package com.hiddenhiqmah.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.util.Locale;

/**
 * Qibla bearing and distance.
 *
 * Shows a BEARING, not a live needle: a widget cannot read the magnetometer, so
 * a rotating arrow would be a lie. The number is honest on its own — "56.2° from
 * true North" is usable with any compass — and tapping opens the app's live
 * compass, which is where a needle belongs.
 *
 * The bearing is derived here from the payload's coordinates rather than shipped
 * as a precomputed figure, exactly as the iOS widget does: one number to keep
 * honest instead of two, and it lets the widget show the distance too.
 */
public class QiblaWidget extends AppWidgetProvider {

    static final String ACTION_REFRESH = "com.hiddenhiqmah.app.WIDGET_REFRESH_QIBLA";

    private static final double KAABA_LAT = 21.4225;
    private static final double KAABA_LNG = 39.8262;
    private static final double EARTH_KM = 6371.0088;

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_REFRESH.equals(intent.getAction())) {
            AppWidgetManager mgr = AppWidgetManager.getInstance(context);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(context, QiblaWidget.class));
            if (ids != null && ids.length > 0) onUpdate(context, mgr, ids);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context c, AppWidgetManager m, int id, Bundle o) {
        super.onAppWidgetOptionsChanged(c, m, id, o);
        onUpdate(c, m, new int[] { id });
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        JSONObject payload = WidgetStore.read(context);
        RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_qibla);

        // Deep-link to this widget's own area rather than just opening the app.
        // "qiblah" is resolved by WIDGET_ROUTES in lib/mobile/deeplinks.ts, the
        // same table the iOS widgets use, so both platforms land in one place.
        Intent open = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse("hiddenhiqmah://qiblah"));
        open.setPackage(context.getPackageName());
        if (open != null) {
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
            v.setOnClickPendingIntent(R.id.qb_root, PendingIntent.getActivity(context, 0, open, flags));
        }

        if (payload == null || !payload.has("lat")) {
            v.setTextViewText(R.id.qb_bearing, "—");
            v.setTextViewText(R.id.qb_sub, "Open to set your location");
            v.setTextViewText(R.id.qb_city, "");
        } else {
            double lat = payload.optDouble("lat", 0), lng = payload.optDouble("lng", 0);
            double p1 = Math.toRadians(lat), p2 = Math.toRadians(KAABA_LAT);
            double dl = Math.toRadians(KAABA_LNG - lng);
            double y = Math.sin(dl) * Math.cos(p2);
            double x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
            double bearing = (Math.toDegrees(Math.atan2(y, x)) + 360) % 360;

            double dp = p2 - p1;
            double a = Math.sin(dp / 2) * Math.sin(dp / 2)
                + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
            double km = 2 * EARTH_KM * Math.asin(Math.sqrt(a));

            v.setTextViewText(R.id.qb_bearing, String.format(Locale.US, "%.1f°", bearing));
            v.setTextViewText(
                R.id.qb_sub,
                String.format(Locale.US, "%s · %,.0f km", compass(bearing), km)
            );
            String city = WidgetStore.city(payload);
            v.setTextViewText(R.id.qb_city, city == null ? "" : city);
        }

        for (int id : ids) {
            Bundle opts = mgr.getAppWidgetOptions(id);
            int wDp = opts != null ? opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0) : 0;
            int hDp = opts != null ? opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0) : 0;
            if (wDp <= 0) wDp = 250;
            if (hDp <= 0) hDp = 120;
            Bitmap art = WidgetArt.card(
                context, WidgetArt.dpi(context, wDp), WidgetArt.dpi(context, hDp),
                WidgetArt.Motif.KAABA
            );
            if (art != null) v.setImageViewBitmap(R.id.qb_art, art);
            Bitmap badge = WidgetArt.badge(context, WidgetArt.dpi(context, 22), WidgetArt.Motif.KAABA);
            if (badge != null) v.setImageViewBitmap(R.id.qb_badge, badge);
            mgr.updateAppWidget(id, v);
        }
    }

    /** 56.2° -> "NE". A cardinal is easier to act on than three digits. */
    private static String compass(double deg) {
        String[] pts = { "N", "NE", "E", "SE", "S", "SW", "W", "NW" };
        return pts[(int) Math.round(deg / 45.0) % 8];
    }

    static void refreshAll(Context context) {
        context.sendBroadcast(new Intent(context, QiblaWidget.class).setAction(ACTION_REFRESH));
    }
}
