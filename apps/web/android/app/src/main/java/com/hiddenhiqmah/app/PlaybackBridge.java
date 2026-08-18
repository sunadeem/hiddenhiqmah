package com.hiddenhiqmah.app;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Lets the web layer raise and drop the playback foreground service.
 *
 * Android-only: iOS gets the same behaviour from UIBackgroundModes:audio plus
 * the AVAudioSession set up in AppDelegate, with no JS involvement at all. The
 * JS wrapper (packages/ui/lib/playbackService.ts) is a no-op everywhere else, so
 * callers need no platform branch.
 */
@CapacitorPlugin(name = "PlaybackBridge")
public class PlaybackBridge extends Plugin {

    @PluginMethod
    public void start(PluginCall call) {
        String title = call.getString("title", "Playing");
        PlaybackService.start(getContext(), title);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        PlaybackService.stop(getContext());
        call.resolve();
    }
}
