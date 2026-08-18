package com.hiddenhiqmah.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Android twin of ios/App/App/WidgetBridge.swift.
 *
 * The JS producer (`lib/mobile/widgets.ts` -> `syncWidgetData()`) is entirely
 * platform-agnostic and already ships the payload on every foreground; it gates
 * on `isNativePlatform()`, not on iOS. So implementing this plugin was the whole
 * Android job on the data side — no changes to the producer at all, and the two
 * platforms consume byte-identical JSON.
 *
 * iOS writes it into an App Group's UserDefaults and calls
 * WidgetCenter.reloadAllTimelines(); here it goes to SharedPreferences and we
 * broadcast a refresh. Same contract, different plumbing.
 */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridge extends Plugin {

    @PluginMethod
    public void setWidgetData(PluginCall call) {
        String json = call.getString("json");
        if (json == null || json.isEmpty()) {
            call.reject("json is required");
            return;
        }
        WidgetStore.write(getContext(), json);
        // Redraw immediately rather than waiting for the next boundary alarm, so
        // a location or calculation-method change is reflected the moment the
        // user returns to the home screen.
        NextPrayerWidget.refreshAll(getContext());
        call.resolve();
    }
}
