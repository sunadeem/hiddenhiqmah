package com.hiddenhiqmah.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ContentResolver;
import android.content.Context;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;

/**
 * Creates the adhan notification channel natively, because Capacitor cannot.
 *
 * WHY THIS EXISTS. On Android 8+ the CHANNEL owns sound, importance and — the
 * part that matters here — the AudioAttributes the sound is played with. The
 * Capacitor LocalNotifications plugin hard-codes those attributes to
 * USAGE_NOTIFICATION for every channel created through its JS createChannel()
 * API (NotificationChannelManager.java:96-99) and exposes no override.
 *
 * USAGE_NOTIFICATION is wrong for the adhan, in two ways that both bite at the
 * worst possible moment:
 *
 *   1. Do Not Disturb / One UI Bedtime mode. Android's zen filtering classifies
 *      a posted notification as an ALARM by its AudioAttributes usage, and the
 *      default DND policy admits alarms while suppressing notification sounds.
 *      A USAGE_NOTIFICATION adhan is therefore silenced by the very mode people
 *      switch on overnight — so Fajr, the prayer most dependent on being woken,
 *      is the one guaranteed to arrive silent.
 *
 *   2. The ringer. Notification-usage sound is muted when the phone is on
 *      vibrate or silent; alarm-usage sound plays on STREAM_ALARM, which is
 *      independent of the ringer switch. A phone face-down on silent is the
 *      normal state, not an edge case.
 *
 * Capacitor's own implicit "default" channel gets USAGE_ALARM
 * (LocalNotificationManager.java:112-115) — so this is an inconsistency in the
 * plugin's JS API, not a platform limitation.
 *
 * ⚠️ A NotificationChannel is IMMUTABLE once created: createNotificationChannel
 * on an existing id is silently ignored, so these attributes cannot be corrected
 * in place on any device that has already registered the id. Changing anything
 * here requires minting a NEW id (bump the _vN suffix) — which is also why this
 * runs from MainActivity.onCreate, BEFORE the JS ensureChannels() can register
 * the id with the plugin's wrong attributes and freeze them.
 *
 * The other three channels (prayer/daily/events) stay in JS: they carry ordinary
 * notification sounds, for which USAGE_NOTIFICATION is correct.
 */
final class AdhanChannel {

    /** Must stay identical to CH_ADHAN in apps/web/src/lib/mobile/notifications.ts. */
    static final String ID = "hiqmah_adhan_v1";

    private AdhanChannel() {}

    static void ensure(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager nm = context.getSystemService(NotificationManager.class);
        if (nm == null) return;
        // Idempotent, and deliberately non-destructive: if the channel already
        // exists the user may have customised it, and their choice outranks ours.
        if (nm.getNotificationChannel(ID) != null) return;

        NotificationChannel channel = new NotificationChannel(
            ID,
            "Adhan",
            // HIGH (4), not MAX (5): every framework gate is `>= IMPORTANCE_HIGH`,
            // so 5 buys no extra behaviour, and it is not representable in the
            // system's per-channel importance picker — the first time the user or
            // an OEM "optimise notifications" pass touches the channel, 5 is
            // rewritten to 4 anyway.
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("The call to prayer, at each prayer time");
        channel.enableVibration(true);
        channel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);

        // res/raw/adhan.m4a — 25s AAC, transcoded from the iOS adhan.caf so both
        // platforms play the same clip. Referenced WITHOUT extension: a resource
        // is named by its base name.
        Uri sound = Uri.parse(
            ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + context.getPackageName() + "/raw/adhan"
        );
        channel.setSound(
            sound,
            new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM)
                .build()
        );

        nm.createNotificationChannel(channel);
    }
}
