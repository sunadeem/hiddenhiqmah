package com.hiddenhiqmah.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;

/**
 * A foreground service whose only job is to exist while audio is playing.
 *
 * It does NOT own or play the audio — the WebView does, through the same
 * HTMLAudioElement the web and iOS builds use, so all the existing playback
 * logic is untouched. What it buys is permission to keep making sound.
 *
 * Measured, not assumed: with the app backgrounded and no foreground service,
 * `adb shell dumpsys audio` reports
 *
 *     AudioHardening background playback would be muted for
 *     com.hiddenhiqmah.app, level: partial
 *
 * Android mutes background playback for apps that have no running foreground
 * service of an audio type. For this app that is not a nice-to-have: the adhan
 * sounds at the prayer time, which is by definition a moment when nobody is
 * looking at the screen. A silent adhan is the product failing at the one thing
 * it promises.
 *
 * The notification is required — Android will not let a foreground service run
 * without one — so it is made useful rather than apologetic: it names what is
 * playing and taps back into the app.
 */
public class PlaybackService extends Service {

    public static final String ACTION_START = "com.hiddenhiqmah.app.PLAYBACK_START";
    public static final String ACTION_STOP = "com.hiddenhiqmah.app.PLAYBACK_STOP";
    public static final String EXTRA_TITLE = "title";

    private static final String CHANNEL_ID = "hiqmah_playback";
    private static final int NOTIFICATION_ID = 4711;

    @Override
    public IBinder onBind(Intent intent) {
        return null; // started, not bound
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent != null ? intent.getAction() : null;

        if (ACTION_STOP.equals(action)) {
            stopForegroundCompat();
            stopSelf();
            return START_NOT_STICKY;
        }

        String title = intent != null ? intent.getStringExtra(EXTRA_TITLE) : null;
        if (title == null || title.isEmpty()) title = "Playing";

        createChannel();
        Notification notification = buildNotification(title);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // The type is what actually exempts us from the background-audio
            // mute; a plain foreground service would not.
            startForeground(NOTIFICATION_ID, notification,
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        // Deliberately NOT sticky: if Android kills us under memory pressure,
        // silently resurrecting a service for audio that is no longer playing
        // would leave a phantom notification with nothing behind it.
        return START_NOT_STICKY;
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm == null || nm.getNotificationChannel(CHANNEL_ID) != null) return;
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID, "Playback", NotificationManager.IMPORTANCE_LOW);
        channel.setDescription("Shown while recitation or the adhan is playing");
        channel.setShowBadge(false);
        channel.setSound(null, null);   // the audio IS the sound
        nm.createNotificationChannel(channel);
    }

    private Notification buildNotification(String title) {
        Intent open = new Intent(this, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent tap = PendingIntent.getActivity(this, 0, open, flags);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText("Hiqmah")
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setContentIntent(tap)
                .setOngoing(true)
                .setSilent(true)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();
    }

    private void stopForegroundCompat() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(Service.STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }
    }

    @Override
    public void onDestroy() {
        stopForegroundCompat();
        super.onDestroy();
    }

    // --- helpers for the plugin -------------------------------------------

    static void start(Context context, String title) {
        Intent intent = new Intent(context, PlaybackService.class);
        intent.setAction(ACTION_START);
        intent.putExtra(EXTRA_TITLE, title);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
    }

    static void stop(Context context) {
        Intent intent = new Intent(context, PlaybackService.class);
        intent.setAction(ACTION_STOP);
        context.startService(intent);
    }
}
