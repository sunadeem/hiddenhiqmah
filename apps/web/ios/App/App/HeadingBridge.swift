import Foundation
import CoreLocation
import UIKit
import Capacitor

/**
 * HeadingBridge — the native compass feed for the qiblah compass.
 *
 * The web layer cannot get a heading inside a WKWebView: `webkitCompassHeading`
 * is a Safari-only extension and is absent in an app's web view, and
 * DeviceOrientationEvent's `alpha` is not north-referenced there, so it can't be
 * turned into a bearing. (@capacitor/motion is only a web shim over those same
 * events, so it inherits the problem.) CoreLocation is the real source, which is
 * all this plugin is: CLLocationManager.startUpdatingHeading() streamed to JS.
 *
 * JS side — src/lib/mobile/heading.ts / components/QiblahSection.tsx:
 *   const h = await HeadingBridge.addListener("heading", (e) => { … })
 *   await HeadingBridge.start()
 *   …
 *   h.remove(); await HeadingBridge.stop()
 *
 * Event payload:
 *   { trueHeading: Double, magneticHeading: Double, accuracy: Double }
 *
 * `trueHeading` ALREADY includes the local magnetic declination — the JS side
 * must NOT apply its own correction on top of it. It is NEGATIVE when
 * CoreLocation has no location fix to derive declination from; the caller then
 * falls back to `magneticHeading` and corrects that itself. `accuracy` is
 * CLHeading.headingAccuracy: degrees of maximum error, negative when the reading
 * is invalid and the magnetometer needs calibrating.
 *
 * Location permission is already granted for prayer times, so this adds no new
 * consent prompt (heading updates need no authorization of their own; the
 * authorization only decides whether a TRUE heading is available).
 */
@objc(HeadingBridge)
public class HeadingBridge: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    public let identifier = "HeadingBridge"
    public let jsName = "HeadingBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise)
    ]

    /// Created lazily on the main thread — CLLocationManager must be used from a
    /// thread with an active run loop, and Capacitor calls arrive on a background
    /// queue.
    private var manager: CLLocationManager?
    /// Gates event emission so a delivery already in flight when stop() lands
    /// can't reach a compass the web layer has already torn down.
    private var running = false
    private var observingOrientation = false

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": CLLocationManager.headingAvailable()])
    }

    @objc func start(_ call: CAPPluginCall) {
        // iPads and the simulator have no magnetometer; reject rather than
        // resolve into a stream that never emits, so the UI can say so honestly.
        guard CLLocationManager.headingAvailable() else {
            call.reject("This device has no compass (magnetometer) available")
            return
        }
        DispatchQueue.main.async {
            let manager = self.manager ?? CLLocationManager()
            self.manager = manager
            manager.delegate = self
            // 1° — the dial animates between readings anyway, and anything finer
            // is noise the user can't act on.
            manager.headingFilter = 1
            // iOS reports the heading of whichever device edge headingOrientation
            // names, so a rotated phone (the app allows landscape) reads 90° off
            // unless this tracks the real orientation.
            self.syncHeadingOrientation()
            self.observeOrientation()
            self.running = true
            manager.startUpdatingHeading()
            call.resolve()
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.running = false
            self.manager?.stopUpdatingHeading()
            NotificationCenter.default.removeObserver(
                self, name: UIDevice.orientationDidChangeNotification, object: nil)
            if self.observingOrientation {
                UIDevice.current.endGeneratingDeviceOrientationNotifications()
            }
            self.observingOrientation = false
            call.resolve()
        }
    }

    private func observeOrientation() {
        guard !observingOrientation else { return }
        observingOrientation = true
        // UIKit contract: UIDevice.orientation returns .unknown and the
        // orientationDidChange notification NEVER fires unless generation is
        // explicitly begun. Balanced by endGenerating in stop().
        UIDevice.current.beginGeneratingDeviceOrientationNotifications()
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(orientationDidChange),
            name: UIDevice.orientationDidChangeNotification,
            object: nil)
    }

    @objc private func orientationDidChange() {
        syncHeadingOrientation()
    }

    /// CLDeviceOrientation shares UIDeviceOrientation's raw values. Face-up /
    /// face-down / unknown aren't interface orientations, so those are skipped and
    /// the last real one is kept — a phone held flat (exactly how you use a
    /// compass) reports faceUp constantly.
    private func syncHeadingOrientation() {
        let deviceOrientation = UIDevice.current.orientation
        guard deviceOrientation.isValidInterfaceOrientation,
              let orientation = CLDeviceOrientation(rawValue: Int32(deviceOrientation.rawValue))
        else { return }
        manager?.headingOrientation = orientation
    }

    public func locationManager(_ manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        guard running else { return }
        notifyListeners("heading", data: [
            "trueHeading": newHeading.trueHeading,
            "magneticHeading": newHeading.magneticHeading,
            "accuracy": newHeading.headingAccuracy
        ])
    }

    /// Let iOS put up its own figure-8 calibration sheet when it decides the
    /// magnetometer needs it — the single biggest cause of a wrong qiblah.
    public func locationManagerShouldDisplayHeadingCalibration(_ manager: CLLocationManager) -> Bool {
        return true
    }
}
