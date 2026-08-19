package com.hiddenhiqmah.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.widget.RemoteViews;

import org.json.JSONObject;

/**
 * Today's five prayers, with the next one highlighted.
 *
 * Shares WidgetStore with NextPrayerWidget — one payload, one parser, several
 * faces. Adding a widget is therefore mostly a layout, which is the point of
 * putting the parsing in a store rather than in a provider.
 */
public class PrayerTimesWidget extends AppWidgetProvider {

    static final String ACTION_REFRESH = "com.hiddenhiqmah.app.WIDGET_REFRESH_TIMES";

    private static final int[] ROW_NAME = {
        R.id.pt_name_0, R.id.pt_name_1, R.id.pt_name_2, R.id.pt_name_3, R.id.pt_name_4
    };
    private static final int[] ROW_TIME = {
        R.id.pt_time_0, R.id.pt_time_1, R.id.pt_time_2, R.id.pt_time_3, R.id.pt_time_4
    };

    private static final int GOLD = Color.parseColor("#D4A843");
    private static final int MUTED = Color.parseColor("#8D887C");

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_REFRESH.equals(intent.getAction())) {
            AppWidgetManager mgr = AppWidgetManager.getInstance(context);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(context, PrayerTimesWidget.class));
            if (ids != null && ids.length > 0) onUpdate(context, mgr, ids);
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        JSONObject payload = WidgetStore.read(context);
        long now = System.currentTimeMillis();
        WidgetStore.Prayer[] today = WidgetStore.today(payload, now);
        WidgetStore.Prayer next = WidgetStore.nextPrayer(payload, now);

        RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_prayer_times);

        Intent open = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (open != null) {
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
            v.setOnClickPendingIntent(R.id.pt_root, PendingIntent.getActivity(context, 0, open, flags));
        }

        String city = WidgetStore.city(payload);
        v.setTextViewText(R.id.pt_city, city == null ? "" : city);

        for (int i = 0; i < ROW_NAME.length; i++) {
            if (i < today.length && today[i] != null) {
                // Highlight the upcoming prayer, so the widget answers "what's
                // next" at a glance instead of making the eye scan five rows.
                // Compared by NAME, not by time: `next` may be tomorrow's Fajr
                // after Isha, and matching on time would highlight nothing.
                boolean isNext = next != null && next.name.equals(today[i].name);
                v.setTextViewText(ROW_NAME[i], today[i].name);
                v.setTextViewText(ROW_TIME[i], WidgetStore.formatTime(context, today[i].timeMs));
                v.setTextColor(ROW_NAME[i], isNext ? GOLD : MUTED);
                v.setTextColor(ROW_TIME[i], isNext ? GOLD : MUTED);
            } else {
                v.setTextViewText(ROW_NAME[i], "");
                v.setTextViewText(ROW_TIME[i], "");
            }
        }

        for (int id : ids) mgr.updateAppWidget(id, v);
    }

    static void refreshAll(Context context) {
        context.sendBroadcast(new Intent(context, PrayerTimesWidget.class).setAction(ACTION_REFRESH));
    }
}
