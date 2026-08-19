#!/usr/bin/env python3
"""
Generate every Android launcher icon AND the Android 12+ splash icon from the
one master mark.

    pip3 install --user Pillow
    python3 scripts/gen-android-icons.py

Nothing here is hand-placed, so when the brand art changes this is re-run rather
than re-drawn.

TWO SOURCES, DELIBERATELY

  launcher  public/icons/icon-512.png   — the same mark the iOS app and the
                                          website use. 512px is ample: the
                                          largest launcher asset is 432px.
  splash    assets/icon-original.png    — 1254px. The splash needs 1152px at
                                          xxxhdpi, so the 512 master CANNOT
                                          supply it; that mismatch is the whole
                                          bug this script's splash half fixes.

They are the same artwork (furthest-ink ratio 0.8264 vs 0.8278, 0.17% apart), so
the founder-approved MARGIN below transfers between them unchanged. The launcher
deliberately keeps the 512 source so its already device-verified bytes do not
move for a 0.17% scale difference.

Do NOT "simplify" this by pointing both at one file. icon-512 is too small for
the splash, and assets/splash.png — despite being 2732x2732 — is a red herring:
its mark is only 466x702 of actual ink on a vast empty canvas, FEWER real pixels
than icon-original's 649x977.

WHY THE MARK GETS SMALLER THAN ON iOS

An adaptive icon is a 108dp canvas of which the launcher only guarantees the
centre 72dp. The outer ring is deliberately sacrificial: it is what gets cropped
when a launcher applies a circle, squircle or rounded-square mask, and what
slides under the parallax some launchers animate. Art drawn to the edge — which
is exactly what a good iOS icon is — loses its corners.

So the mark is scaled to fit. Not by guessing an inset, but by measuring: this
script finds the furthest ink pixel from the centre and solves for the scale at
which that pixel lands on the 36dp safe radius. For this mark the limiting pixel
is the bottom-left corner of the open book, and the answer is ~0.81, leaving the
mark 68dp tall inside the 72dp circle. Fitting the BOUNDING BOX instead would
have shrunk it to ~55dp for no reason — the box corners are empty, so they do
not need protecting.

BLACK BACKGROUND TO ALPHA

The master art is gold on opaque black. An adaptive foreground wants
transparency, so alpha is derived from luminance and the colour un-premultiplied
(c' = c*255/a). Over a black background layer this looks identical to the
original, but it now behaves correctly when a launcher separates the layers.

THE SPLASH ICON IS A DIFFERENT CANVAS FROM THE LAUNCHER ICON

Android 12+ draws the launch splash itself, and the icon it draws is a 288dp
canvas of which only the centre 192dp survives the mask. Both numbers are read
off core-splashscreen 1.2.0 (splashscreen_icon_size_no_background = 288dp; mask
bounds 410dp with a 109dp stroke, so the clear diameter is 410 - 2*109 = 192dp).
192/288 is exactly 2/3 — the SAME ratio as the adaptive icon's 72/108 — which is
why safe_scale() serves both and only the dp constants differ.

Before this existed, the theme named no splash icon, so the platform fell back
to the LAUNCHER icon: on a 450dpi phone that is the xxhdpi foreground, 324px,
blown up to 288dp = 810px — a 2.5x upscale of a raster. That is what "grainy and
dull" was. Here every bucket is a DOWNSCALE of a 1254px master instead.

(324 and not the 432 of xxxhdpi: 450dpi resolves to the xxhdpi bucket, and the
same matcher picks the 864px splash_icon this script writes there. Both assets
come from one bucket, so they cannot disagree.)

Per-bucket drawable-*, never drawable-nodpi: nodpi art is exempt from density
scaling, so a 1152px nodpi file would render at 1152 physical px — 410dp on this
phone — instead of the 288dp the slot asks for.

Do NOT add windowSplashScreenIconBackgroundColor to the theme. It silently
retargets the geometry to the 240dp canvas / 158dp circle pair, which would crop
17% off art authored to 288dp, and it draws a visible disc behind the mark.
"""

import math
import os
import sys

try:
    from PIL import Image, ImageDraw
except ImportError:
    sys.exit("Pillow is required:  pip3 install --user Pillow")

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(HERE)
SRC = os.path.join(WEB, "public/icons/icon-512.png")
SPLASH_SRC = os.path.join(WEB, "assets/icon-original.png")
RES = os.path.join(WEB, "android/app/src/main/res")

# Adaptive icon layers are 108dp; the launcher only guarantees the centre 72dp.
ADAPTIVE_DP, SAFE_DP = 108, 72
# Android 12+ splash icon: 288dp canvas, 192dp visible circle. Both from
# core-splashscreen 1.2.0 — see the module docstring for the derivation.
SPLASH_DP, SPLASH_SAFE_DP = 288, 192
# Legacy (API 24–25) launcher icons are 48dp.
LEGACY_DP = 48
DENSITIES = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
INK = 60  # r+g+b above this counts as mark rather than background
# Breathing room inside the safe zone. Solving for tangency alone (MARGIN = 0)
# is correct but reads as cramped: the arch tip and the book's outer corners
# land exactly on the mask edge, so a circular launcher looks about to clip the
# mark even though it never does. 5% was tried on the device and still read
# tight; 10% is what actually looks composed, and the mark is a tall arch, so
# what it loses in scale it keeps in legibility - the H is the part that has to
# survive 48dp, and that is unaffected. Founder's call 2026-08-18, from a
# rendered 0/5/10% comparison plus a device check at 5%.
MARGIN = 0.10


def load_mark(path: str = SRC) -> Image.Image:
    """The master art with its black background converted to alpha."""
    im = Image.open(path).convert("RGB")
    w, h = im.size
    out = Image.new("RGBA", (w, h))
    src, dst = im.load(), out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = src[x, y]
            a = max(r, g, b)
            if a == 0:
                dst[x, y] = (0, 0, 0, 0)
            else:
                # Un-premultiply so edge pixels keep their true colour.
                dst[x, y] = (
                    min(255, r * 255 // a),
                    min(255, g * 255 // a),
                    min(255, b * 255 // a),
                    a,
                )
    return out


def furthest_ink(mark: Image.Image) -> float:
    """Distance in px from the canvas centre to the outermost ink pixel."""
    w, h = mark.size
    cx = cy = w / 2
    px = mark.load()
    furthest = 0.0
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > INK // 3:
                d = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
                furthest = max(furthest, d)
    return furthest


def safe_scale(mark: Image.Image, canvas_dp: int = ADAPTIVE_DP,
               safe_dp: int = SAFE_DP) -> float:
    """Largest scale at which NO ink escapes the safe circle, less MARGIN.

    Same solve for both canvases — the adaptive icon's 108dp/72dp and the
    splash's 288dp/192dp are both a 2/3 ratio, so only the constants move.
    """
    w = mark.size[0]
    # furthest (px) maps to (safe_dp / 2) on the canvas_dp canvas
    tangent = (safe_dp / 2) / (furthest_ink(mark) / w * canvas_dp)
    return tangent * (1 - MARGIN)


def centred(canvas_px: int, mark: Image.Image, mark_px: int) -> Image.Image:
    """Mark scaled to mark_px, centred on a transparent canvas_px square."""
    out = Image.new("RGBA", (canvas_px, canvas_px), (0, 0, 0, 0))
    m = mark.resize((mark_px, mark_px), Image.LANCZOS)
    off = (canvas_px - mark_px) // 2
    out.paste(m, (off, off), m)
    return out


def write(img: Image.Image, folder: str, name: str) -> None:
    d = os.path.join(RES, folder)
    os.makedirs(d, exist_ok=True)
    img.save(os.path.join(d, name))


# Every splash.png Capacitor's template shipped, and its exact pixel size. These
# are the LEGACY fallback only (see gen_legacy_splash), so the list is the set of
# files that already exist rather than anything we chose.
LEGACY_SPLASH = {
    "drawable": (480, 320),
    "drawable-port-mdpi": (320, 480),
    "drawable-port-hdpi": (480, 800),
    "drawable-port-xhdpi": (720, 1280),
    "drawable-port-xxhdpi": (960, 1600),
    "drawable-port-xxxhdpi": (1280, 1920),
    "drawable-land-mdpi": (480, 320),
    "drawable-land-hdpi": (800, 480),
    "drawable-land-xhdpi": (1280, 720),
    "drawable-land-xxhdpi": (1600, 960),
    "drawable-land-xxxhdpi": (1920, 1280),
}


def gen_splash(mark: Image.Image, scale: float) -> None:
    """drawable-<bucket>/splash_icon.png — the Android 12+ splash icon.

    Transparent, because the full-screen fill comes from the theme's
    windowSplashScreenBackground: an icon-sized asset cannot cover 1080x2340, so
    the colour has to come from the attribute either way, and baking black in as
    well would show a square seam the instant the two hexes drifted apart.
    """
    for density, mult in DENSITIES.items():
        canvas_px = int(SPLASH_DP * mult)
        img = centred(canvas_px, mark, int(canvas_px * scale))
        write(img, f"drawable-{density}", "splash_icon.png")
        print(f"  drawable-{density:<11} canvas {canvas_px}px · mark {int(canvas_px * scale)}px")


def gen_legacy_splash(mark: Image.Image) -> None:
    """The pre-Android-12 / fallback full-screen splash bitmaps.

    Capacitor's SplashScreen plugin only reaches these if showWithAndroid12API()
    THROWS — it catches the exception, logs "Android 12 Splash API failed" and
    inflates an ImageView with @drawable/splash instead. That never happens on a
    healthy build, so these are a safety net, not the launch path.

    They are regenerated anyway because the template art they replace is the
    stock blue Capacitor logo on a WHITE field. Leaving it would mean the one
    remaining splash bitmap in a branded app is someone else's logo, shown at
    exactly the moment something has already gone wrong.

    The mark is sized off the SHORT side, because the fallback ImageView uses
    androidScaleType CENTER_CROP: on a 1080x2340 phone the portrait xxhdpi frame
    is scaled 1.4625x and 324px of width are cropped away. Sizing off the short
    side means the crop can only ever eat empty black field.
    """
    for folder, (w, h) in LEGACY_SPLASH.items():
        img = Image.new("RGBA", (w, h), (0, 0, 0, 255))
        box = int(min(w, h) * 0.45)
        m = mark.resize((box, box), Image.LANCZOS)
        img.paste(m, ((w - box) // 2, (h - box) // 2), m)
        write(img.convert("RGB"), folder, "splash.png")


def main() -> None:
    mark = load_mark()
    scale = safe_scale(mark)
    print(f"source          {SRC}")
    mark_dp = ADAPTIVE_DP * scale * (398 / 512)  # 398px = measured mark height
    print(f"safe scale      {scale:.3f} ({MARGIN:.0%} margin) → mark {mark_dp:.1f}dp tall in the {SAFE_DP}dp safe zone")

    for density, mult in DENSITIES.items():
        folder = f"mipmap-{density}"
        adaptive_px = int(ADAPTIVE_DP * mult)
        legacy_px = int(LEGACY_DP * mult)

        # 1. Adaptive foreground — transparent, mark inside the safe circle.
        fg = centred(adaptive_px, mark, int(adaptive_px * scale))
        write(fg, folder, "ic_launcher_foreground.png")

        # 2. Monochrome (Android 13+ themed icons). The system tints this by the
        #    user's wallpaper palette and uses ONLY its alpha, so the colour is
        #    irrelevant — but it must be a solid silhouette, not a gradient, or
        #    the tint renders muddy.
        mono = Image.new("RGBA", fg.size, (0, 0, 0, 0))
        fp, mp = fg.load(), mono.load()
        for y in range(fg.size[1]):
            for x in range(fg.size[0]):
                a = fp[x, y][3]
                if a:
                    mp[x, y] = (255, 255, 255, 255 if a > 128 else a)
        write(mono, folder, "ic_launcher_monochrome.png")

        # 3. Legacy square (API 24–25): full-bleed, matching the iOS icon.
        legacy = Image.new("RGBA", (legacy_px, legacy_px), (0, 0, 0, 255))
        m = mark.resize((legacy_px, legacy_px), Image.LANCZOS)
        legacy.paste(m, (0, 0), m)
        write(legacy, folder, "ic_launcher.png")

        # 4. Legacy round: black disc, mark at the safe scale so the circle
        #    crop cannot clip it.
        round_ic = Image.new("RGBA", (legacy_px, legacy_px), (0, 0, 0, 0))
        d = ImageDraw.Draw(round_ic)
        d.ellipse([0, 0, legacy_px - 1, legacy_px - 1], fill=(0, 0, 0, 255))
        inner = int(legacy_px * scale)
        m = mark.resize((inner, inner), Image.LANCZOS)
        off = (legacy_px - inner) // 2
        round_ic.paste(m, (off, off), m)
        write(round_ic, folder, "ic_launcher_round.png")

        print(f"  {folder:<16} foreground {adaptive_px}px · legacy {legacy_px}px")

    # 5. Play Console store listing icon (uploaded by hand, not bundled).
    store = Image.new("RGBA", (512, 512), (0, 0, 0, 255))
    store.paste(mark, (0, 0), mark)
    out = os.path.join(WEB, "android/play-store-icon-512.png")
    store.convert("RGB").save(out)
    print(f"\n  Play Console listing icon → {out}")

    # 6. Android 12+ splash icon, from the LARGER master (see docstring).
    splash_mark = load_mark(SPLASH_SRC)
    splash_scale = safe_scale(splash_mark, SPLASH_DP, SPLASH_SAFE_DP)
    reach = furthest_ink(splash_mark) / splash_mark.size[0] * SPLASH_DP * splash_scale
    print(f"\nsplash source   {SPLASH_SRC}")
    print(f"safe scale      {splash_scale:.4f} ({MARGIN:.0%} margin) → mark {SPLASH_DP * splash_scale:.1f}dp "
          f"on the {SPLASH_DP}dp canvas, furthest ink {reach:.1f}dp of the {SPLASH_SAFE_DP // 2}dp mask radius")
    gen_splash(splash_mark, splash_scale)
    gen_legacy_splash(splash_mark)
    print(f"  {len(LEGACY_SPLASH)} legacy fallback splash.png rebranded")


if __name__ == "__main__":
    main()
