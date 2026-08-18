package com.hiddenhiqmah.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Capacitor bridge to PlaybackService.
 *
 * Two directions:
 *   JS -> native   start / update / stop, carrying the metadata the lock screen
 *                  and notification-shade media card render.
 *   native -> JS   a `transport` event whenever the user hits play, pause, seek
 *                  or skip from ANY of those surfaces — including a Bluetooth or
 *                  car head-unit button.
 *
 * The WebView remains the only thing that actually plays audio, so every
 * transport command is advisory: native reports the button press, JS decides
 * what it means. That keeps one playback implementation across web, iOS and
 * Android instead of forking it per platform.
 */
@CapacitorPlugin(name = "PlaybackBridge")
public class PlaybackBridge extends Plugin {

    @Override
    public void load() {
        // Forward every transport command from the MediaSession (or the
        // notification's own buttons) into the WebView.
        PlaybackService.setTransportListener((action, positionMs) -> {
            JSObject ev = new JSObject();
            ev.put("action", action);
            if (positionMs >= 0) ev.put("positionMs", positionMs);
            notifyListeners("transport", ev);
        });
    }

    /**
     * Raise the foreground service and publish media metadata.
     *
     * Safe to call repeatedly — it doubles as the "update" path, so JS can
     * re-send on every verse change to keep the lock screen in step without
     * needing a separate method.
     */
    @PluginMethod
    public void start(PluginCall call) {
        String title = call.getString("title", "Playing");
        String subtitle = call.getString("subtitle", "Hiqmah");
        String album = call.getString("album", null);
        // -1 means "unknown, leave whatever the service already has".
        long durationMs = call.getLong("durationMs", -1L);
        long positionMs = call.getLong("positionMs", -1L);
        boolean playing = Boolean.TRUE.equals(call.getBoolean("playing", true));
        PlaybackService.start(getContext(), title, subtitle, album, durationMs, positionMs, playing);
        call.resolve();
    }

    /** Update playing/paused and position without changing metadata. */
    @PluginMethod
    public void setState(PluginCall call) {
        boolean playing = Boolean.TRUE.equals(call.getBoolean("playing", true));
        long positionMs = call.getLong("positionMs", -1L);
        long durationMs = call.getLong("durationMs", -1L);
        PlaybackService.start(getContext(), null, null, null, durationMs, positionMs, playing);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        PlaybackService.stop(getContext());
        call.resolve();
    }
}
