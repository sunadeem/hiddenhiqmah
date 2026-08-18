package com.hiddenhiqmah.app;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/**
 * The widgets' view of the app's data.
 *
 * A widget runs in a different process from the WebView: no JS, no localStorage,
 * no way to call computePrayerTimes. So the APP is the producer — `syncWidgetData()`
 * writes a self-contained ~30-day payload on every foreground, and this reads it.
 * That is the same contract iOS uses (App Group UserDefaults there,
 * SharedPreferences here), and the JSON is byte-identical, so the payload
 * producer needed no Android-specific changes at all.
 *
 * ~30 days of coverage means a phone that never opens the app for a month still
 * renders correct times, and the widget works with the radio off.
 */
final class WidgetStore {

    static final String PREFS = "HiqmahWidgets";
    static final String KEY_DATA = "widgetData";

    private WidgetStore() {}

    static void write(Context context, String json) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_DATA, json).apply();
    }

    static JSONObject read(Context context) {
        String json = context
            .getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getString(KEY_DATA, null);
        if (json == null) return null;
        try {
            return new JSONObject(json);
        } catch (Exception e) {
            return null;
        }
    }

    /** One prayer on a specific day. */
    static final class Prayer {
        final String name;
        final long timeMs;

        Prayer(String name, long timeMs) {
            this.name = name;
            this.timeMs = timeMs;
        }
    }

    private static final String[] KEYS = { "fajr", "dhuhr", "asr", "maghrib", "isha" };
    private static final String[] LABELS = { "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha" };

    /**
     * The next prayer at or after `now`, looking across day boundaries.
     *
     * Crossing days matters: after Isha the next prayer is tomorrow's Fajr, and a
     * widget that only searched today would sit blank every evening — the hours
     * when someone is most likely to glance at it.
     */
    static Prayer nextPrayer(JSONObject payload, long nowMs) {
        if (payload == null) return null;
        JSONArray days = payload.optJSONArray("days");
        if (days == null) return null;

        for (int d = 0; d < days.length(); d++) {
            JSONObject day = days.optJSONObject(d);
            if (day == null) continue;
            String date = day.optString("date", null);
            if (date == null) continue;
            for (int i = 0; i < KEYS.length; i++) {
                long t = parseLocal(date, day.optString(KEYS[i], null));
                if (t > 0 && t > nowMs) {
                    return new Prayer(LABELS[i], t);
                }
            }
        }
        return null;
    }

    /** Today's five, for the list widget. Empty if today isn't in the payload. */
    static Prayer[] today(JSONObject payload, long nowMs) {
        if (payload == null) return new Prayer[0];
        JSONArray days = payload.optJSONArray("days");
        if (days == null) return new Prayer[0];
        String todayStr = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date(nowMs));
        for (int d = 0; d < days.length(); d++) {
            JSONObject day = days.optJSONObject(d);
            if (day == null || !todayStr.equals(day.optString("date", null))) continue;
            Prayer[] out = new Prayer[KEYS.length];
            for (int i = 0; i < KEYS.length; i++) {
                out[i] = new Prayer(LABELS[i], parseLocal(todayStr, day.optString(KEYS[i], null)));
            }
            return out;
        }
        return new Prayer[0];
    }

    /**
     * "YYYY-MM-DD" + "HH:mm" in the device's LOCAL zone.
     *
     * Deliberately built with Calendar rather than parsed as an instant: the
     * payload carries local wall-clock strings, exactly as the app computed them
     * for the user's own location. Treating them as UTC — the tempting shortcut —
     * would shift every prayer by the zone offset.
     */
    private static long parseLocal(String date, String hhmm) {
        if (date == null || hhmm == null || hhmm.length() < 4) return 0;
        try {
            String[] d = date.split("-");
            String[] t = hhmm.split(":");
            Calendar c = Calendar.getInstance();
            c.set(Calendar.YEAR, Integer.parseInt(d[0]));
            c.set(Calendar.MONTH, Integer.parseInt(d[1]) - 1);
            c.set(Calendar.DAY_OF_MONTH, Integer.parseInt(d[2]));
            c.set(Calendar.HOUR_OF_DAY, Integer.parseInt(t[0]));
            c.set(Calendar.MINUTE, Integer.parseInt(t[1]));
            c.set(Calendar.SECOND, 0);
            c.set(Calendar.MILLISECOND, 0);
            return c.getTimeInMillis();
        } catch (Exception e) {
            return 0;
        }
    }

    /** "5:07 AM" in the device's locale/format. */
    static String formatTime(Context context, long timeMs) {
        if (timeMs <= 0) return "--";
        return android.text.format.DateFormat.getTimeFormat(context).format(new Date(timeMs));
    }

    static String city(JSONObject payload) {
        return payload == null ? "" : payload.optString("city", "");
    }

    static int streak(JSONObject payload) {
        return payload == null ? 0 : payload.optInt("streak", 0);
    }
}
