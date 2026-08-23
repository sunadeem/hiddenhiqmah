package com.hiddenhiqmah.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Custom plugins must be registered BEFORE super.onCreate builds the
        // bridge. The iOS twin is registered by MainViewController for the same
        // reason; there is no auto-discovery for plugins that live in the app.
        registerPlugin(HeadingBridge.class);
        registerPlugin(PlaybackBridge.class);
        registerPlugin(WidgetBridge.class);

        // Must run before the WebView can call ensureChannels(): a channel is
        // immutable once created, so whichever side registers the id first wins
        // permanently. Capacitor's createChannel() would freeze the adhan on
        // USAGE_NOTIFICATION, which Do Not Disturb silences. See AdhanChannel.
        AdhanChannel.ensure(this);

        super.onCreate(savedInstanceState);
    }
}
