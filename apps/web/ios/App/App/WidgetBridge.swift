import Foundation
import Capacitor

#if canImport(WidgetKit)
import WidgetKit
#endif

/**
 * WidgetBridge — the one-way pipe from the web layer to the WidgetKit extension.
 *
 * Everything the widgets show (prayer times, city) is computed in JS
 * (src/lib/prayer-times.ts) from the cached GPS fix + the user's calculation
 * method, exactly like the local notifications are. The widget extension is a
 * separate process with its own sandbox, so it cannot read localStorage — the
 * app hands it a pre-computed JSON blob through the shared app group
 * (`group.com.hiddenhiqmah.app`, key `widgetData`) and asks WidgetKit to
 * rebuild its timelines.
 *
 * JS side — src/lib/mobile/widgets.ts:
 *   await WidgetBridge.setWidgetData({ json: JSON.stringify(payload) })
 *
 * Payload shape (HiqmahWidgets/SharedData.swift is the decoder):
 *   {
 *     "version": 1,
 *     "updatedAt": "2026-07-29T18:00:00.000Z",
 *     "city": "Toronto",
 *     "days": [
 *       { "date": "2026-07-29", "fajr": "04:21", "dhuhr": "13:22",
 *         "asr": "17:15", "maghrib": "20:41", "isha": "22:10" },
 *       ...
 *     ]
 *   }
 *
 * `date` is the LOCAL calendar day (yyyy-MM-dd) and the times are local "HH:mm"
 * — the same strings computePrayerTimes() already returns. The writer publishes
 * ~30 days so the widget survives a month of the app never being opened; once
 * the days run out the widget falls back to "Open Hiqmah" on its own.
 */
@objc(WidgetBridge)
public class WidgetBridge: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetBridge"
    public let jsName = "WidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setWidgetData", returnType: CAPPluginReturnPromise)
    ]

    /// Must match HiqmahWidgets.entitlements + App.entitlements.
    static let appGroupIdentifier = "group.com.hiddenhiqmah.app"
    /// Must match SharedData.swift.
    static let widgetDataKey = "widgetData"

    @objc func setWidgetData(_ call: CAPPluginCall) {
        guard let json = call.getString("json"), !json.isEmpty else {
            call.reject("setWidgetData requires a non-empty \"json\" string")
            return
        }
        guard let defaults = UserDefaults(suiteName: WidgetBridge.appGroupIdentifier) else {
            call.reject("App group \(WidgetBridge.appGroupIdentifier) is not available to this build")
            return
        }

        defaults.set(json, forKey: WidgetBridge.widgetDataKey)

        #if canImport(WidgetKit)
        // Deployment target is iOS 15, so WidgetCenter is unconditionally available.
        WidgetCenter.shared.reloadAllTimelines()
        #endif

        call.resolve()
    }
}
