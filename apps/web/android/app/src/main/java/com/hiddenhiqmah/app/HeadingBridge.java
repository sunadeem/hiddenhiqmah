package com.hiddenhiqmah.app;

import android.content.Context;
import android.hardware.GeomagneticField;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.location.LocationManager;
import android.view.Surface;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Compass heading — the Android twin of ios/App/App/HeadingBridge.swift.
 *
 * Same JS contract (src/lib/mobile/heading.ts): start/stop/isAvailable plus a
 * "heading" event carrying trueHeading, magneticHeading and accuracy. The web
 * path can't serve as a fallback here for the same reason it can't on iOS —
 * DeviceOrientationEvent.alpha is not north-referenced in a WebView.
 *
 * ⚠️ THE DIFFERENCE THAT MATTERS: iOS hands you `trueHeading` with magnetic
 * declination ALREADY APPLIED. Android does not. The rotation vector is
 * referenced to MAGNETIC north, and true north is magnetic + declination, which
 * we have to compute ourselves from GeomagneticField at the user's position.
 * Get this wrong and the qiblah is off by the local declination — up to ~20° in
 * parts of North America, which is the difference between facing Makkah and
 * facing the next city over.
 *
 * Declination is applied EXACTLY ONCE, here, so it matches the iOS contract
 * where trueHeading arrives ready to use. QiblahSection has a single dial entry
 * point (applyTrueHeading) precisely so it can never be applied twice.
 */
@CapacitorPlugin(name = "HeadingBridge")
public class HeadingBridge extends Plugin implements SensorEventListener {

    private SensorManager sensorManager;
    private Sensor rotationVector;
    private boolean running = false;

    /** Degrees to add to a magnetic heading to get a true one. 0 until we have a fix. */
    private float declination = 0f;
    private boolean haveDeclination = false;

    private final float[] rotationMatrix = new float[9];
    private final float[] orientation = new float[3];

    /**
     * The rotation vector updates far faster than a compass dial needs, and every
     * event crosses the JS bridge. ~20/s is smooth to the eye and an order of
     * magnitude cheaper than the raw stream.
     */
    private static final long MIN_INTERVAL_MS = 50;
    private long lastEmit = 0L;

    @Override
    public void load() {
        sensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            // GEOMAGNETIC_ROTATION_VECTOR uses the magnetometer without the
            // gyroscope: slightly less smooth, but it is the one that stays
            // north-referenced and it costs far less battery. Fall back to the
            // full rotation vector on devices that lack it.
            rotationVector = sensorManager.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR);
            if (rotationVector == null) {
                rotationVector = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
            }
        }
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", rotationVector != null);
        call.resolve(ret);
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (rotationVector == null) {
            call.reject("No compass on this device");
            return;
        }
        if (!running) {
            refreshDeclination();
            sensorManager.registerListener(this, rotationVector, SensorManager.SENSOR_DELAY_GAME);
            running = true;
        }
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        stopUpdates();
        call.resolve();
    }

    private void stopUpdates() {
        if (running && sensorManager != null) {
            sensorManager.unregisterListener(this);
            running = false;
        }
    }

    /** The magnetometer keeps costing battery if the activity goes away mid-session. */
    @Override
    protected void handleOnPause() {
        stopUpdates();
    }

    @Override
    protected void handleOnDestroy() {
        stopUpdates();
    }

    /**
     * Declination for the user's current position. Uses the last known fix only —
     * this never requests location itself, because the app has already asked for
     * it for prayer times and a compass should not trigger a second prompt. With
     * no fix we leave declination at 0 and report trueHeading as -1, which the JS
     * contract defines as "not available", so the caller applies its own
     * correction (QiblahSection carries a WMM model for exactly this).
     */
    private void refreshDeclination() {
        try {
            LocationManager lm = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
            if (lm == null) return;
            Location best = null;
            for (String provider : lm.getProviders(true)) {
                Location loc = lm.getLastKnownLocation(provider);
                if (loc == null) continue;
                if (best == null || loc.getTime() > best.getTime()) best = loc;
            }
            if (best == null) return;
            GeomagneticField field = new GeomagneticField(
                    (float) best.getLatitude(),
                    (float) best.getLongitude(),
                    (float) best.getAltitude(),
                    System.currentTimeMillis());
            declination = field.getDeclination();
            haveDeclination = true;
        } catch (SecurityException e) {
            // Permission revoked mid-session: magnetic heading still works.
            haveDeclination = false;
        }
    }

    /**
     * Screen rotation changes which axis points "up", and the sensor frame does
     * not follow it. iOS handles this via headingOrientation; here we remap the
     * rotation matrix ourselves, or a landscape device reads 90° off.
     */
    private int displayRotation() {
        try {
            return getActivity().getWindowManager().getDefaultDisplay().getRotation();
        } catch (Exception e) {
            return Surface.ROTATION_0;
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor != rotationVector) return;

        long now = System.currentTimeMillis();
        if (now - lastEmit < MIN_INTERVAL_MS) return;
        lastEmit = now;

        SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values);

        int axisX = SensorManager.AXIS_X;
        int axisY = SensorManager.AXIS_Y;
        switch (displayRotation()) {
            case Surface.ROTATION_90:
                axisX = SensorManager.AXIS_Y;
                axisY = SensorManager.AXIS_MINUS_X;
                break;
            case Surface.ROTATION_180:
                axisX = SensorManager.AXIS_MINUS_X;
                axisY = SensorManager.AXIS_MINUS_Y;
                break;
            case Surface.ROTATION_270:
                axisX = SensorManager.AXIS_MINUS_Y;
                axisY = SensorManager.AXIS_X;
                break;
            default:
                break;
        }
        float[] remapped = new float[9];
        SensorManager.remapCoordinateSystem(rotationMatrix, axisX, axisY, remapped);
        SensorManager.getOrientation(remapped, orientation);

        // azimuth is radians from magnetic north, -pi..pi
        double magnetic = Math.toDegrees(orientation[0]);
        magnetic = (magnetic + 360.0) % 360.0;

        // Declination applied exactly once — see the class note.
        double trueHeading = haveDeclination ? (magnetic + declination + 360.0) % 360.0 : -1.0;

        JSObject ret = new JSObject();
        ret.put("trueHeading", trueHeading);
        ret.put("magneticHeading", magnetic);
        ret.put("accuracy", accuracyDegrees());
        notifyListeners("heading", ret);
    }

    /**
     * The JS contract wants a maximum error in degrees, NEGATIVE when the reading
     * is invalid and the magnetometer wants calibrating — the same convention as
     * webkitCompassAccuracy. Android reports a coarse enum instead, so map it.
     */
    private double accuracyDegrees() {
        switch (lastAccuracy) {
            case SensorManager.SENSOR_STATUS_ACCURACY_HIGH:
                return 5.0;
            case SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM:
                return 15.0;
            case SensorManager.SENSOR_STATUS_ACCURACY_LOW:
                return 30.0;
            default:
                return -1.0;
        }
    }

    private int lastAccuracy = SensorManager.SENSOR_STATUS_ACCURACY_HIGH;

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        if (sensor == rotationVector) lastAccuracy = accuracy;
    }
}
