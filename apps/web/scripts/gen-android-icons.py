#!/usr/bin/env python3
"""
Generate every Android launcher icon from the one master mark.

    pip3 install --user Pillow
    python3 scripts/gen-android-icons.py

Source of truth is public/icons/icon-512.png — the same mark the iOS app and the
website use. Nothing here is hand-placed, so when the brand art changes this is
re-run rather than re-drawn.

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
RES = os.path.join(WEB, "android/app/src/main/res")

# Adaptive icon layers are 108dp; the launcher only guarantees the centre 72dp.
ADAPTIVE_DP, SAFE_DP = 108, 72
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


def load_mark() -> Image.Image:
    """The master art with its black background converted to alpha."""
    im = Image.open(SRC).convert("RGB")
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


def safe_scale(mark: Image.Image) -> float:
    """Largest scale at which NO ink escapes the 72dp circle."""
    w, h = mark.size
    cx = cy = w / 2
    px = mark.load()
    furthest = 0.0
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > INK // 3:
                d = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
                furthest = max(furthest, d)
    # furthest (px) maps to (SAFE_DP / 2) on the ADAPTIVE_DP canvas
    tangent = (SAFE_DP / 2) / (furthest / w * ADAPTIVE_DP)
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


if __name__ == "__main__":
    main()
