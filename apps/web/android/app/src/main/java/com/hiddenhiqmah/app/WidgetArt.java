package com.hiddenhiqmah.app;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RadialGradient;
import android.graphics.RectF;
import android.graphics.Shader;

/**
 * The widgets' drawn layer — the Android half of the iOS widget design system.
 *
 * WHY DRAW AT ALL. RemoteViews cannot express a gradient ground, a bled
 * watermark or a glyph; it can only set properties on a fixed whitelist of
 * views. So the decorative layer is rendered here into a Bitmap and handed to a
 * single ImageView, with the live text laid over it in a FrameLayout. A bitmap
 * for everything would have been simpler and wrong: it would freeze the
 * Chronometer, and the countdown ticking by itself is the whole reason that view
 * is there.
 *
 * The tokens mirror the iOS widgets deliberately, including gold as THREE values
 * rather than one — a bright display gold, a softer text gold and a dim line
 * gold. Using a single gold is what makes a dark UI look flat and cheap.
 */
final class WidgetArt {

    // ── Tokens (shared with the iOS widget bundle and globals.css) ──────────
    static final int GOLD_DISPLAY = 0xFFE2BB6A;
    static final int GOLD_TEXT = 0xFFD4A843;
    static final int GOLD_LINE = 0xFF6E5A2A;
    static final int CREAM = 0xFFF1ECE0;
    static final int MUTED = 0xFF8D887C;
    static final int FAINT = 0xFF6B665C;
    static final int INK_TOP = 0xFF141210;
    static final int INK_BOTTOM = 0xFF08080A;

    private WidgetArt() {}

    /** Motifs, chosen per widget so each face reads as its own thing. */
    enum Motif { ARCH, STAR, CRESCENT, KAABA, FLAME }

    /**
     * The card: warm-dark vertical gradient, a low radial lift behind the motif,
     * a hairline edge, and the motif itself bled off the right side at low alpha.
     *
     * Bleeding it off-frame rather than centring it is what keeps it reading as
     * texture instead of a sticker sitting on top of the content.
     */
    static Bitmap card(Context context, int wPx, int hPx, Motif motif) {
        if (wPx <= 0 || hPx <= 0) return null;
        Bitmap bmp = Bitmap.createBitmap(wPx, hPx, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(bmp);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);

        float r = dp(context, 24);
        RectF rect = new RectF(0, 0, wPx, hPx);

        // Ground
        p.setShader(new LinearGradient(0, 0, 0, hPx, INK_TOP, INK_BOTTOM, Shader.TileMode.CLAMP));
        c.drawRoundRect(rect, r, r, p);
        p.setShader(null);

        // A warm lift behind where the motif sits, so the right side is not a
        // flat void once the motif fades out.
        p.setShader(
            new RadialGradient(
                wPx * 0.86f,
                hPx * 0.30f,
                Math.max(wPx, hPx) * 0.62f,
                0x2ED4A843,
                0x00000000,
                Shader.TileMode.CLAMP
            )
        );
        c.drawRoundRect(rect, r, r, p);
        p.setShader(null);

        // Motif, clipped to the card so the bleed is a crop, not an overflow.
        c.save();
        Path clip = new Path();
        clip.addRoundRect(rect, r, r, Path.Direction.CW);
        c.clipPath(clip);
        drawMotif(c, motif, wPx, hPx, context);
        c.restore();

        // Hairline edge last, so nothing paints over it.
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(dp(context, 1));
        p.setColor(0x40D4A843);
        float inset = dp(context, 0.5f);
        c.drawRoundRect(
            new RectF(inset, inset, wPx - inset, hPx - inset),
            r,
            r,
            p
        );
        return bmp;
    }

    private static void drawMotif(Canvas c, Motif motif, int w, int h, Context ctx) {
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(dp(ctx, 2f));
        p.setColor(0x1FD4A843); // deliberately faint: texture, not decoration

        // Radius is PER MOTIF, as a fraction of height, because they do not read
        // at the same scale. Sized from device feedback: the crescent and the
        // star were large enough to cross the layout's hairline dividers and get
        // clipped, while the Kaaba and flame sat right — so only the first two
        // came down, rather than scaling everything and spoiling what worked.
        float r;
        switch (motif) {
            case STAR: r = h * 0.27f; break;
            case CRESCENT: r = h * 0.30f; break;
            case KAABA: r = h * 0.32f; break;
            case FLAME: r = h * 0.40f; break;
            case ARCH: default: r = h * 0.30f; break;
        }
        // Bleed horizontally only. A vertical bleed is what collides with the
        // dividers; cropping on the right costs nothing.
        float cx = w - r * 0.95f;
        float cy = h * 0.50f;

        switch (motif) {
            case STAR: rubElHizb(c, cx, cy, r, p); break;
            case CRESCENT: crescent(c, cx, cy, r, p); break;
            case KAABA: kaaba(c, cx, cy, r, p); break;
            case FLAME: flame(c, cx, cy, r, p); break;
            case ARCH: default: arch(c, cx, cy, r, p); break;
        }
    }

    /** Rub el Hizb — two squares, one rotated 45°. */
    private static void rubElHizb(Canvas c, float cx, float cy, float r, Paint p) {
        Path a = new Path();
        a.addRect(cx - r, cy - r, cx + r, cy + r, Path.Direction.CW);
        c.drawPath(a, p);
        c.save();
        c.rotate(45, cx, cy);
        c.drawPath(a, p);
        c.restore();
    }

    /** The mihrab arch from the app mark: pointed apex, shoulders, flat base. */
    private static void arch(Canvas c, float cx, float cy, float r, Paint p) {
        Path path = new Path();
        float w = r * 0.78f, top = cy - r, bottom = cy + r;
        path.moveTo(cx - w, bottom);
        path.lineTo(cx - w, cy - r * 0.10f);
        path.cubicTo(cx - w, top + r * 0.22f, cx - w * 0.45f, top, cx, top);
        path.cubicTo(cx + w * 0.45f, top, cx + w, top + r * 0.22f, cx + w, cy - r * 0.10f);
        path.lineTo(cx + w, bottom);
        c.drawPath(path, p);
    }

    /** Crescent: one disc minus another, offset. */
    private static void crescent(Canvas c, float cx, float cy, float r, Paint p) {
        Path outer = new Path();
        outer.addCircle(cx, cy, r, Path.Direction.CW);
        Path inner = new Path();
        inner.addCircle(cx + r * 0.42f, cy - r * 0.10f, r * 0.86f, Path.Direction.CW);
        outer.op(inner, Path.Op.DIFFERENCE);
        c.drawPath(outer, p);
    }

    /**
     * Kaaba. A bare rectangle reads as a stray UI box, so it needs the two
     * details that actually identify it: the kiswah band across the upper
     * third, and the door.
     */
    private static void kaaba(Canvas c, float cx, float cy, float r, Paint p) {
        RectF box = new RectF(cx - r * 0.86f, cy - r, cx + r * 0.86f, cy + r);
        c.drawRoundRect(box, r * 0.05f, r * 0.05f, p);

        // Kiswah band — two lines, not one, so it reads as a band.
        float bandTop = cy - r * 0.42f, bandBottom = cy - r * 0.20f;
        c.drawLine(box.left, bandTop, box.right, bandTop, p);
        c.drawLine(box.left, bandBottom, box.right, bandBottom, p);

        // Door, lower right of the face.
        float dw = r * 0.26f, dh = r * 0.52f;
        float dx = cx + r * 0.24f;
        c.drawRect(dx - dw / 2, cy + r - dh, dx + dw / 2, cy + r * 0.92f, p);
    }

    /**
     * Flame. A symmetric teardrop reads as a water droplet — the exact wrong
     * connotation for a streak — so the tip leans and the base is broad.
     */
    private static void flame(Canvas c, float cx, float cy, float r, Paint p) {
        Path path = new Path();
        path.moveTo(cx + r * 0.10f, cy - r);                       // leaning tip
        path.cubicTo(cx + r * 0.95f, cy - r * 0.05f, cx + r * 0.62f, cy + r, cx, cy + r);
        path.cubicTo(cx - r * 0.62f, cy + r, cx - r * 0.92f, cy - r * 0.10f,
                     cx - r * 0.16f, cy - r * 0.62f);
        path.cubicTo(cx - r * 0.02f, cy - r * 0.80f, cx + r * 0.04f, cy - r * 0.90f,
                     cx + r * 0.10f, cy - r);
        c.drawPath(path, p);

        // Inner flame, so it is unmistakable rather than merely blob-shaped.
        Path inner = new Path();
        inner.moveTo(cx + r * 0.02f, cy - r * 0.34f);
        inner.cubicTo(cx + r * 0.46f, cy + r * 0.10f, cx + r * 0.30f, cy + r * 0.72f,
                      cx, cy + r * 0.72f);
        inner.cubicTo(cx - r * 0.30f, cy + r * 0.72f, cx - r * 0.42f, cy + r * 0.14f,
                      cx + r * 0.02f, cy - r * 0.34f);
        c.drawPath(inner, p);
    }

    /**
     * A small filled badge with a glyph, for the top-left of a face.
     *
     * Returned separately from the card so the two can be sized independently:
     * the card is measured from the launcher's cell, the badge is a fixed dp.
     */
    static Bitmap badge(Context context, int sizePx, Motif motif) {
        if (sizePx <= 0) return null;
        Bitmap bmp = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(bmp);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);

        float r = sizePx * 0.28f;
        p.setStyle(Paint.Style.FILL);
        p.setShader(
            new LinearGradient(0, 0, 0, sizePx, 0x33D4A843, 0x14D4A843, Shader.TileMode.CLAMP)
        );
        c.drawRoundRect(new RectF(0, 0, sizePx, sizePx), r, r, p);
        p.setShader(null);

        p.setStyle(Paint.Style.STROKE);
        p.setStrokeWidth(Math.max(1f, sizePx * 0.055f));
        p.setColor(GOLD_DISPLAY);
        float cx = sizePx / 2f, cy = sizePx / 2f, gr = sizePx * 0.27f;
        switch (motif) {
            case STAR: rubElHizb(c, cx, cy, gr * 0.82f, p); break;
            case CRESCENT: crescent(c, cx, cy, gr, p); break;
            case KAABA: kaaba(c, cx, cy, gr * 0.8f, p); break;
            case FLAME: flame(c, cx, cy, gr, p); break;
            case ARCH: default: arch(c, cx, cy, gr, p); break;
        }
        return bmp;
    }

    static float dp(Context context, float v) {
        return v * context.getResources().getDisplayMetrics().density;
    }

    static int dpi(Context context, float v) {
        return Math.round(dp(context, v));
    }
}
