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

import org.json.JSONObject;

/**
 * The visit streak.
 *
 * As fresh as the last app open, by construction: the widget cannot run the
 * visit bookkeeping (that lives in localStorage on the far side of the WebView),
 * so it renders whatever the last sync wrote. A slightly stale streak is the
 * accepted cost of showing one at all — the same trade the iOS widget makes.
 */
public class StreakWidget extends AppWidgetProvider {

    static final String ACTION_REFRESH = "com.hiddenhiqmah.app.WIDGET_REFRESH_STREAK";

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_REFRESH.equals(intent.getAction())) {
            AppWidgetManager mgr = AppWidgetManager.getInstance(context);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(context, StreakWidget.class));
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
        JSONObject payload = WidgetStore.read(context);
        int streak = WidgetStore.streak(payload);

        RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_streak);
        // Deep-link to this widget's own area rather than just opening the app.
        // "muslim-daily" is resolved by WIDGET_ROUTES in lib/mobile/deeplinks.ts, the
        // same table the iOS widgets use, so both platforms land in one place.
        Intent open = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse("hiddenhiqmah://muslim-daily"));
        open.setPackage(context.getPackageName());
        if (open != null) {
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
            v.setOnClickPendingIntent(R.id.sk_root, PendingIntent.getActivity(context, 0, open, flags));
        }
        v.setTextViewText(R.id.sk_count, String.valueOf(streak));
        v.setTextViewText(R.id.sk_unit, streak == 1 ? "day" : "days");

        for (int id : ids) {
            Bundle opts = mgr.getAppWidgetOptions(id);
            int wDp = opts != null ? opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0) : 0;
            int hDp = opts != null ? opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0) : 0;
            if (wDp <= 0) wDp = 160;
            if (hDp <= 0) hDp = 120;
            Bitmap art = WidgetArt.card(
                context, WidgetArt.dpi(context, wDp), WidgetArt.dpi(context, hDp),
                WidgetArt.Motif.FLAME
            );
            if (art != null) v.setImageViewBitmap(R.id.sk_art, art);
            Bitmap badge = WidgetArt.badge(context, WidgetArt.dpi(context, 22), WidgetArt.Motif.FLAME);
            if (badge != null) v.setImageViewBitmap(R.id.sk_badge, badge);
            mgr.updateAppWidget(id, v);
        }
    }

    static void refreshAll(Context context) {
        context.sendBroadcast(new Intent(context, StreakWidget.class).setAction(ACTION_REFRESH));
    }
}
