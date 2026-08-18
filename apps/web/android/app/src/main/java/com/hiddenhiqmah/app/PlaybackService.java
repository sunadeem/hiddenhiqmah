package com.hiddenhiqmah.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Build;
import android.os.IBinder;

/**
 * Foreground service that (a) makes background audio legal and (b) publishes the
 * MediaSession every Android media surface renders from.
 *
 * It still does NOT play anything — the WebView owns playback through the same
 * HTMLAudioElement the web and iOS builds use. This service is permission plus a
 * remote control, nothing more.
 *
 * WHY THE SERVICE EXISTS (measured, not assumed). With the app backgrounded and
 * no foreground service, `adb shell dumpsys audio` reported
 *
 *     AudioHardening background playback would be muted for com.hiddenhiqmah.app
 *
 * Verified fixed on a Galaxy A17: with the service running, the app no longer
 * appears in that list and audio survives backgrounding and screen-lock.
 *
 * WHY THE MEDIASESSION EXISTS. `QuranAudioContext` already sets
 * `navigator.mediaSession` metadata, and on iOS WKWebView forwards that to the
 * system, which is why Now Playing works there. **The Android WebView does not.**
 * Measured on device: `dumpsys media_session` reported "Sessions Stack - have 0
 * sessions" while audio was playing, so there was no lock-screen player, no
 * notification-shade media card, and no metadata over Bluetooth. The session has
 * to be created natively, here.
 *
 * One session covers every surface at once — lock screen, shade/Quick Settings
 * media card, Bluetooth and car head units — which is why this is worth doing
 * once properly rather than per-surface.
 *
 * Deliberately uses the FRAMEWORK MediaSession + Notification.MediaStyle (API
 * 21+, and minSdk here is 24) rather than androidx.media or media3, so it adds
 * no Gradle dependency to a Capacitor project whose build is already long.
 */
public class PlaybackService extends Service {

    public static final String ACTION_START = "com.hiddenhiqmah.app.PLAYBACK_START";
    public static final String ACTION_STOP = "com.hiddenhiqmah.app.PLAYBACK_STOP";
    public static final String ACTION_STATE = "com.hiddenhiqmah.app.PLAYBACK_STATE";
    // Distinct actions so the notification button maps to an unambiguous command
    // rather than a toggle whose meaning depends on state we might have missed.
    static final String ACTION_PLAY_CMD = "com.hiddenhiqmah.app.CMD_PLAY";
    static final String ACTION_PAUSE_CMD = "com.hiddenhiqmah.app.CMD_PAUSE";
    static final String ACTION_NEXT_CMD = "com.hiddenhiqmah.app.CMD_NEXT";
    static final String ACTION_PREV_CMD = "com.hiddenhiqmah.app.CMD_PREV";
    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_SUBTITLE = "subtitle";
    public static final String EXTRA_ALBUM = "album";
    public static final String EXTRA_DURATION = "durationMs";
    public static final String EXTRA_POSITION = "positionMs";
    public static final String EXTRA_PLAYING = "playing";

    private static final String CHANNEL_ID = "hiqmah_playback";
    private static final int NOTIFICATION_ID = 4711;

    /** Set by the plugin so transport commands can be forwarded to the WebView. */
    private static TransportListener transportListener;

    interface TransportListener {
        void onTransport(String action, long positionMs);
    }

    static void setTransportListener(TransportListener l) {
        transportListener = l;
    }

    private MediaSession session;
    private String title = "Playing";
    private String subtitle = "Hiqmah";
    private String album = "Hiqmah";
    private Bitmap artwork;
    private long durationMs = 0;
    private long positionMs = 0;
    private boolean playing = false;

    @Override
    public IBinder onBind(Intent intent) {
        return null; // started, not bound
    }

    @Override
    public void onCreate() {
        super.onCreate();
        session = new MediaSession(this, "HiqmahPlayback");
        session.setCallback(
            new MediaSession.Callback() {
                @Override
                public void onPlay() {
                    emit("play", -1);
                }

                @Override
                public void onPause() {
                    emit("pause", -1);
                }

                @Override
                public void onStop() {
                    emit("stop", -1);
                }

                @Override
                public void onSeekTo(long pos) {
                    emit("seek", pos);
                }

                @Override
                public void onSkipToNext() {
                    emit("next", -1);
                }

                @Override
                public void onSkipToPrevious() {
                    emit("previous", -1);
                }
            }
        );
        session.setActive(true);
    }

    /** Forward a transport command to JS. The WebView is the thing that actually
     *  plays, so every control here is advisory until JS acts on it. */
    private void emit(String action, long pos) {
        TransportListener l = transportListener;
        if (l != null) l.onTransport(action, pos);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent != null ? intent.getAction() : null;

        // The notification's play/pause button targets this service, so its
        // commands must be handled BEFORE the start path or they fall through
        // and get treated as "begin playback".
        if (ACTION_PLAY_CMD.equals(action)) {
            emit("play", -1);
            return START_NOT_STICKY;
        }
        if (ACTION_PAUSE_CMD.equals(action)) {
            emit("pause", -1);
            return START_NOT_STICKY;
        }
        if (ACTION_NEXT_CMD.equals(action)) {
            emit("next", -1);
            return START_NOT_STICKY;
        }
        if (ACTION_PREV_CMD.equals(action)) {
            emit("previous", -1);
            return START_NOT_STICKY;
        }

        if (ACTION_STOP.equals(action)) {
            playing = false;
            stopForegroundCompat();
            stopSelf();
            return START_NOT_STICKY;
        }

        if (intent != null) {
            String t = intent.getStringExtra(EXTRA_TITLE);
            if (t != null && !t.isEmpty()) title = t;
            String s = intent.getStringExtra(EXTRA_SUBTITLE);
            if (s != null) subtitle = s;
            String al = intent.getStringExtra(EXTRA_ALBUM);
            if (al != null) album = al;
            long d = intent.getLongExtra(EXTRA_DURATION, -1);
            if (d >= 0) durationMs = d;
            long p = intent.getLongExtra(EXTRA_POSITION, -1);
            if (p >= 0) positionMs = p;
            playing = intent.getBooleanExtra(EXTRA_PLAYING, true);
        }

        createChannel();
        publishSession();

        if (playing) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // The TYPE is what exempts us from the background-audio mute; a
                // plain foreground service would not.
                startForeground(
                    NOTIFICATION_ID,
                    buildNotification(),
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
                );
            } else {
                startForeground(NOTIFICATION_ID, buildNotification());
            }
        } else {
            // PAUSED is a third state, not a stop. Keep the MediaSession alive
            // so the lock-screen and shade player remain on screen and can
            // resume — killing it here would delete the very control the user
            // reached for. But DETACH from the foreground, so we are not an
            // idle foreground service holding an undismissable notification:
            // detached, it becomes swipeable and the process is reclaimable.
            updateNotification();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                stopForeground(Service.STOP_FOREGROUND_DETACH);
            } else {
                stopForeground(false);
            }
        }

        // Deliberately NOT sticky: if Android kills us under memory pressure,
        // silently resurrecting a service for audio that is no longer playing
        // would leave a phantom notification with nothing behind it.
        return START_NOT_STICKY;
    }

    /** Push metadata + state into the session, which is what the lock screen,
     *  the shade media card and Bluetooth all read. */
    private void publishSession() {
        if (session == null) return;

        MediaMetadata.Builder meta = new MediaMetadata.Builder()
            .putString(MediaMetadata.METADATA_KEY_TITLE, title)
            .putString(MediaMetadata.METADATA_KEY_ARTIST, subtitle)
            .putString(MediaMetadata.METADATA_KEY_ALBUM, album);
        // The scrubber and the elapsed/remaining readout only appear when the
        // session advertises a DURATION. Without it the card is just a title and
        // a play button, which is what shipped before this.
        if (durationMs > 0) {
            meta.putLong(MediaMetadata.METADATA_KEY_DURATION, durationMs);
        }
        Bitmap art = artwork();
        if (art != null) {
            meta.putBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART, art);
        }
        session.setMetadata(meta.build());

        long actions =
            PlaybackState.ACTION_PLAY |
            PlaybackState.ACTION_PAUSE |
            PlaybackState.ACTION_PLAY_PAUSE |
            PlaybackState.ACTION_STOP |
            // Previous/next āyah. Advertised unconditionally: the JS side knows
            // whether there is one to skip to and no-ops at a boundary, which is
            // better than a control that vanishes mid-sūrah.
            PlaybackState.ACTION_SKIP_TO_NEXT |
            PlaybackState.ACTION_SKIP_TO_PREVIOUS;
        if (durationMs > 0) actions |= PlaybackState.ACTION_SEEK_TO;

        session.setPlaybackState(
            new PlaybackState.Builder()
                .setActions(actions)
                .setState(
                    playing ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED,
                    positionMs,
                    playing ? 1.0f : 0.0f
                )
                .build()
        );
        session.setActive(true);
    }

    /** Re-post the notification without changing foreground status. */
    private void updateNotification() {
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm != null) nm.notify(NOTIFICATION_ID, buildNotification());
    }

    /**
     * Album art for the media card. Decoded from the legacy launcher PNG rather
     * than the adaptive icon, because an adaptive icon is a vector/layered
     * drawable that BitmapFactory cannot decode — it would silently return null
     * and the card would show a blank square. Cached: the card re-publishes on
     * every āyah and decoding each time would be wasteful.
     */
    private Bitmap artwork() {
        if (artwork == null) {
            try {
                artwork = BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher);
            } catch (Exception ignored) {
                // Art is a nicety; never let it break playback.
            }
        }
        return artwork;
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm == null || nm.getNotificationChannel(CHANNEL_ID) != null) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Playback",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Shown while recitation or the adhan is playing");
        channel.setShowBadge(false);
        channel.setSound(null, null); // the audio IS the sound
        nm.createNotificationChannel(channel);
    }

    private PendingIntent transportIntent(String action) {
        Intent i = new Intent(this, PlaybackService.class).setAction(action);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getService(this, action.hashCode(), i, flags);
    }

    private Notification buildNotification() {
        Intent open = new Intent(this, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent tap = PendingIntent.getActivity(this, 0, open, flags);

        Notification.Builder b = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
            ? new Notification.Builder(this, CHANNEL_ID)
            : new Notification.Builder(this);

        b
            .setContentTitle(title)
            .setContentText(subtitle)
            .setSmallIcon(R.drawable.ic_stat_hiqmah)
            .setContentIntent(tap)
            .setOngoing(playing)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .setCategory(Notification.CATEGORY_TRANSPORT);

        // MediaStyle + the session token is what turns this from a plain
        // notification into the media card Android renders in the shade and on
        // the lock screen.
        if (session != null) {
            Notification.MediaStyle style = new Notification.MediaStyle()
                .setMediaSession(session.getSessionToken())
                .setShowActionsInCompactView(0, 1, 2);
            b.setStyle(style);
        }

        // Order matters: previous, play/pause, next — the arrangement every
        // Android media card uses, and the order the compact view indexes into.
        b.addAction(
            new Notification.Action.Builder(
                android.graphics.drawable.Icon.createWithResource(
                    this,
                    android.R.drawable.ic_media_previous
                ),
                "Previous",
                transportIntent(ACTION_PREV_CMD)
            ).build()
        );
        b.addAction(
            new Notification.Action.Builder(
                playPauseIcon(),
                playing ? "Pause" : "Play",
                transportIntent(playing ? ACTION_PAUSE_CMD : ACTION_PLAY_CMD)
            ).build()
        );
        b.addAction(
            new Notification.Action.Builder(
                android.graphics.drawable.Icon.createWithResource(
                    this,
                    android.R.drawable.ic_media_next
                ),
                "Next",
                transportIntent(ACTION_NEXT_CMD)
            ).build()
        );

        return b.build();
    }

    private android.graphics.drawable.Icon playPauseIcon() {
        return android.graphics.drawable.Icon.createWithResource(
            this,
            playing ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play
        );
    }

    private void stopForegroundCompat() {
        if (session != null) {
            session.setActive(false);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(Service.STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }
    }

    @Override
    public void onDestroy() {
        stopForegroundCompat();
        if (session != null) {
            session.release();
            session = null;
        }
        super.onDestroy();
    }

    // --- helpers for the plugin -------------------------------------------

    private static void send(Context context, Intent intent) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
    }

    static void start(
        Context context,
        String title,
        String subtitle,
        String album,
        long durationMs,
        long positionMs,
        boolean playing
    ) {
        Intent intent = new Intent(context, PlaybackService.class).setAction(ACTION_START);
        intent.putExtra(EXTRA_TITLE, title);
        if (subtitle != null) intent.putExtra(EXTRA_SUBTITLE, subtitle);
        if (album != null) intent.putExtra(EXTRA_ALBUM, album);
        intent.putExtra(EXTRA_DURATION, durationMs);
        intent.putExtra(EXTRA_POSITION, positionMs);
        intent.putExtra(EXTRA_PLAYING, playing);
        send(context, intent);
    }

    static void stop(Context context) {
        Intent intent = new Intent(context, PlaybackService.class).setAction(ACTION_STOP);
        context.startService(intent);
    }
}
