package com.hiddenhiqmah.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * The Hijri date.
 *
 * ⭐ MONTH NAMES COME FROM OUR OWN LIST, NEVER FROM A FORMATTER. This is the
 * exact trap the Android port already uncovered on the JS side: asking a
 * formatter for a localised Islamic month name can yield a GREGORIAN name while
 * the numbers stay correct — silent, and wrong in a way nobody notices until a
 * user does. So the arithmetic comes from ICU's IslamicCalendar and the WORDS
 * come from the same table as packages/ui/lib/hijri.ts and the iOS widget, which
 * is what keeps app, widget and iOS from ever disagreeing.
 */
public class HijriWidget extends AppWidgetProvider {

    static final String ACTION_REFRESH = "com.hiddenhiqmah.app.WIDGET_REFRESH_HIJRI";

    /** Single source of truth for the words. Matches hijri.ts + HijriCalendar.swift. */
    private static final String[] MONTHS = {
        "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
        "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban",
        "Ramadan", "Shawwal", "Dhu al-Qa'dah", "Dhu al-Hijjah"
    };

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_REFRESH.equals(intent.getAction())) {
            AppWidgetManager mgr = AppWidgetManager.getInstance(context);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(context, HijriWidget.class));
            if (ids != null && ids.length > 0) onUpdate(context, mgr, ids);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context c, AppWidgetManager m, int id, Bundle o) {
        super.onAppWidgetOptionsChanged(c, m, id, o);
        onUpdate(c, m, new int[] { id });
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_hijri);

        // Deep-link to this widget's own area rather than just opening the app.
        // "islamic-calendar" is resolved by WIDGET_ROUTES in lib/mobile/deeplinks.ts, the
        // same table the iOS widgets use, so both platforms land in one place.
        Intent open = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse("hiddenhiqmah://islamic-calendar"));
        open.setPackage(context.getPackageName());
        if (open != null) {
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
            v.setOnClickPendingIntent(R.id.hj_root, PendingIntent.getActivity(context, 0, open, flags));
        }

        int day = 0, month = 0, year = 0;
        try {
            android.icu.util.IslamicCalendar cal = new android.icu.util.IslamicCalendar();
            cal.setCalculationType(android.icu.util.IslamicCalendar.CalculationType.ISLAMIC_UMALQURA);
            cal.setTime(new Date());
            day = cal.get(android.icu.util.Calendar.DATE);
            month = cal.get(android.icu.util.Calendar.MONTH); // 0-based
            year = cal.get(android.icu.util.Calendar.YEAR);
        } catch (Throwable ignored) {
            // Never let a calendar lookup break the widget.
        }

        String monthName = (month >= 0 && month < MONTHS.length) ? MONTHS[month] : "";
        v.setTextViewText(R.id.hj_day, day > 0 ? String.valueOf(day) : "—");
        v.setTextViewText(R.id.hj_month, monthName);
        v.setTextViewText(R.id.hj_year, year > 0 ? year + " AH" : "");
        v.setTextViewText(
            R.id.hj_greg,
            new SimpleDateFormat("EEEE, d MMMM", Locale.getDefault()).format(new Date())
        );

        for (int id : ids) {
            Bundle opts = mgr.getAppWidgetOptions(id);
            int wDp = opts != null ? opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0) : 0;
            int hDp = opts != null ? opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0) : 0;
            if (wDp <= 0) wDp = 250;
            if (hDp <= 0) hDp = 120;
            Bitmap art = WidgetArt.card(
                context, WidgetArt.dpi(context, wDp), WidgetArt.dpi(context, hDp),
                WidgetArt.Motif.STAR
            );
            if (art != null) v.setImageViewBitmap(R.id.hj_art, art);
            Bitmap badge = WidgetArt.badge(context, WidgetArt.dpi(context, 22), WidgetArt.Motif.STAR);
            if (badge != null) v.setImageViewBitmap(R.id.hj_badge, badge);
            mgr.updateAppWidget(id, v);
        }
    }

    static void refreshAll(Context context) {
        context.sendBroadcast(new Intent(context, HijriWidget.class).setAction(ACTION_REFRESH));
    }
}
