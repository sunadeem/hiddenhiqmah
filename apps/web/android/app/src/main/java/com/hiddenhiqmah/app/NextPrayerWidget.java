package com.hiddenhiqmah.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.SystemClock;
import android.widget.RemoteViews;

import org.json.JSONObject;

/**
 * Home-screen (and, on Android 16+, lock-screen) widget: the next prayer, its
 * time, and a live countdown.
 *
 * On Android a lock-screen widget IS a normal AppWidget — there is no separate
 * family the way iOS has accessoryCircular/Rectangular/Inline. So this one
 * implementation serves both surfaces, which is why the six WidgetKit widgets do
 * not need six Android counterparts.
 *
 * THE COUNTDOWN TICKS ITSELF. `Chronometer` in countdown mode updates in the
 * launcher's process, so the widget does not need refreshing to stay live — the
 * RemoteViews equivalent of iOS's Text(timerInterval:). Without it we would be
 * fighting `updatePeriodMillis`, which Android floors at 30 minutes.
 *
 * Data comes from WidgetStore (SharedPreferences), written by the app. The
 * widget never computes prayer times: it has no WebView and no JS.
 */
public class NextPrayerWidget extends AppWidgetProvider {

    /** Sent by WidgetBridge after fresh data lands, and by our own boundary alarm. */
    static final String ACTION_REFRESH = "com.hiddenhiqmah.app.WIDGET_REFRESH";

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_REFRESH.equals(intent.getAction())) {
            AppWidgetManager mgr = AppWidgetManager.getInstance(context);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(context, NextPrayerWidget.class));
            if (ids != null && ids.length > 0) onUpdate(context, mgr, ids);
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        JSONObject payload = WidgetStore.read(context);
        long now = System.currentTimeMillis();
        WidgetStore.Prayer next = WidgetStore.nextPrayer(payload, now);

        for (int id : ids) {
            RemoteViews v = build(context, payload, next, now);
            // Draw the art at the size the launcher actually gave THIS instance,
            // read from its options — a fixed bitmap would stretch or blur on a
            // resized widget, and users resize widgets constantly.
            android.os.Bundle opts = mgr.getAppWidgetOptions(id);
            int wDp = opts != null ? opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0) : 0;
            int hDp = opts != null ? opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0) : 0;
            if (wDp <= 0) wDp = 250;
            if (hDp <= 0) hDp = 160;
            android.graphics.Bitmap art = WidgetArt.card(
                context,
                WidgetArt.dpi(context, wDp),
                WidgetArt.dpi(context, hDp),
                motifFor(next)
            );
            if (art != null) v.setImageViewBitmap(R.id.widget_art, art);
            android.graphics.Bitmap badge =
                WidgetArt.badge(context, WidgetArt.dpi(context, 22), motifFor(next));
            if (badge != null) v.setImageViewBitmap(R.id.widget_badge, badge);
            mgr.updateAppWidget(id, v);
        }
        scheduleBoundary(context, next, now);
    }

    /**
     * A motif per prayer, so the face changes character through the day rather
     * than being one static card: a crescent at the night prayers, the arch by
     * day. Small touch, but it is what makes a widget feel alive on a home
     * screen you look at fifty times.
     */
    private static WidgetArt.Motif motifFor(WidgetStore.Prayer next) {
        if (next == null) return WidgetArt.Motif.ARCH;
        if ("Isha".equals(next.name) || "Fajr".equals(next.name)) return WidgetArt.Motif.CRESCENT;
        if ("Maghrib".equals(next.name)) return WidgetArt.Motif.STAR;
        return WidgetArt.Motif.ARCH;
    }

    /** Redraw when the user resizes, so the art matches the new cell. */
    @Override
    public void onAppWidgetOptionsChanged(
        Context context,
        AppWidgetManager mgr,
        int id,
        android.os.Bundle newOptions
    ) {
        super.onAppWidgetOptionsChanged(context, mgr, id, newOptions);
        onUpdate(context, mgr, new int[] { id });
    }

    private RemoteViews build(
        Context context,
        JSONObject payload,
        WidgetStore.Prayer next,
        long now
    ) {
        RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_next_prayer);

        // Tapping anywhere opens the app.
        Intent open = context
            .getPackageManager()
            .getLaunchIntentForPackage(context.getPackageName());
        if (open != null) {
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
            v.setOnClickPendingIntent(
                R.id.widget_root,
                PendingIntent.getActivity(context, 0, open, flags)
            );
        }

        if (next == null) {
            // No data yet: say so plainly rather than rendering a confident-looking
            // but empty prayer card. Opening the app is what fixes it.
            v.setTextViewText(R.id.widget_label, "HIQMAH");
            v.setTextViewText(R.id.widget_name, "Open to set up");
            v.setTextViewText(R.id.widget_time, "");
            v.setViewVisibility(R.id.widget_countdown, android.view.View.GONE);
            v.setTextViewText(R.id.widget_city, "");
            return v;
        }

        v.setTextViewText(R.id.widget_label, "NEXT PRAYER");
        v.setTextViewText(R.id.widget_name, next.name);
        v.setTextViewText(R.id.widget_time, WidgetStore.formatTime(context, next.timeMs));

        // Chronometer counts down from a base expressed on the elapsedRealtime
        // clock, NOT wall-clock — mixing the two is the classic way to get a
        // countdown that is off by the device's uptime.
        v.setViewVisibility(R.id.widget_countdown, android.view.View.VISIBLE);
        v.setChronometerCountDown(R.id.widget_countdown, true);
        v.setChronometer(
            R.id.widget_countdown,
            SystemClock.elapsedRealtime() + (next.timeMs - now),
            null,
            true
        );

        String city = WidgetStore.city(payload);
        v.setTextViewText(R.id.widget_city, city == null ? "" : city);
        return v;
    }

    /**
     * Re-render exactly when the prayer changes.
     *
     * `updatePeriodMillis` floors at 30 minutes, so relying on it alone would
     * leave a passed prayer on screen for up to half an hour. One alarm at the
     * boundary is both more accurate and cheaper.
     *
     * Deliberately RTC, not RTC_WAKEUP: a widget only matters when someone is
     * looking at the screen, so waking a sleeping device to redraw it would burn
     * battery for nothing. This is the opposite of the adhan notification, which
     * MUST wake the device — same API, opposite correct answer.
     */
    private void scheduleBoundary(Context context, WidgetStore.Prayer next, long now) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null || next == null) return;
        Intent i = new Intent(context, NextPrayerWidget.class).setAction(ACTION_REFRESH);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pi = PendingIntent.getBroadcast(context, 1001, i, flags);
        // +2s so the widget redraws just AFTER the prayer time, never a hair
        // before it, which would re-select the same prayer and schedule a busy
        // loop of alarms seconds apart.
        am.set(AlarmManager.RTC, next.timeMs + 2000, pi);
    }

    /** Ask every instance of this widget to redraw. */
    static void refreshAll(Context context) {
        context.sendBroadcast(
            new Intent(context, NextPrayerWidget.class).setAction(ACTION_REFRESH)
        );
    }
}
