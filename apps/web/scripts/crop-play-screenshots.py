#!/usr/bin/env python3
"""
Crop raw phone captures into Play-compliant store screenshots.

WHY THIS EXISTS. Google Play rejects a screenshot whose long side is more than
TWICE its short side. Every modern phone is taller than that — a Galaxy A17
captures 1080x2340, and 2340 > 2*1080 = 2160 — so a raw screencap can never be
uploaded as-is. It is not a quality bar, it is a hard validation, and it fails at
upload time after you have already written the listing.

The 180px that has to go is exactly the part nobody wants in a store listing
anyway: the status bar (clock, wifi, battery) and the Android navigation bar.
Cropping them is the only change that both fixes compliance AND improves the
picture, which is why this crops rather than scales or letterboxes.

The bars are DETECTED, not assumed. Hardcoding "72px top, 110px bottom" would
silently mangle a capture from a different device, a different One UI version, or
gesture navigation instead of three-button — and a silently wrong crop is worse
than a loud failure, because you would not notice until the listing looked odd.

Usage:
    python3 scripts/crop-play-screenshots.py <input-dir> [output-dir] [--top N]

Defaults the output to android/play-screenshots/ so the results land beside the
icon and feature graphic, versioned rather than living in a downloads folder.

--top overrides the top crop, and exists because detection alone CANNOT remove
the status bar: the clock and the wifi/battery icons make those rows non-uniform,
so the walk stops at the first of them and leaves the bar in the picture. The
authoritative height comes from the device itself —

    adb shell dumpsys window | grep -oE 'statusBars frame=\\[[0-9,]+\\]\\[[0-9,]+\\]'
    -> statusBars frame=[0,0][1080,100]   (Galaxy A17, 450dpi)

so pass --top 100 for that device. --bottom is the same story for the navigation
bar, which detection also cannot find: the three buttons make the last row
non-uniform, so the walk returns 0 and the bar is only ever trimmed by whatever
the ratio maths happens to need.

    adb shell dumpsys window | grep -oE 'navigationBars frame=\[[0-9,]+\]\[[0-9,]+\]'
    -> navigationBars frame=[0,2205][1080,2340]   => 2340-2205 = 135

    python3 scripts/crop-play-screenshots.py <dir> --top 100 --bottom 135

Guessing either number would silently mangle captures from any other phone,
which is why they are arguments and not constants.
"""

import sys
import pathlib
from PIL import Image

# Play's rule, plus a margin. Landing exactly on 2.000 would pass, but a
# validator using a strict inequality — or a single-pixel rounding difference on
# their side — turns "exactly at the limit" into a rejection for no benefit.
MAX_RATIO = 1.99

# A bar is "uniform" if every pixel in the row is within this of the row's mean.
# Loose enough to accept the near-black chrome the app draws behind the status
# bar, tight enough to stop at the first row carrying real content.
UNIFORM_TOL = 10


def row_is_uniform(px, w, y):
    vals = [sum(px[x, y][:3]) // 3 for x in range(0, w, max(1, w // 60))]
    return max(vals) - min(vals) <= UNIFORM_TOL


def find_bar(img, from_top: bool, limit: int):
    """Walk in from an edge while rows stay uniform; return how many to cut.

    Stops at `limit` so a screenshot that is uniformly dark all the way down
    (a loading state, a black page) cannot eat the whole image.
    """
    w, h = img.size
    px = img.load()
    cut = 0
    while cut < limit:
        y = cut if from_top else h - 1 - cut
        if not row_is_uniform(px, w, y):
            break
        cut += 1
    return cut


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    top_override = bottom_override = None
    for i, a in enumerate(sys.argv):
        if a in ("--top", "--bottom") and i + 1 < len(sys.argv):
            val = int(sys.argv[i + 1])
            if a == "--top":
                top_override = val
            else:
                bottom_override = val
            args = [x for x in args if x != sys.argv[i + 1]]
    if not args:
        print(__doc__.strip())
        return 2
    src = pathlib.Path(args[0]).expanduser()
    here = pathlib.Path(__file__).resolve().parent
    dst = pathlib.Path(args[1]).expanduser() if len(args) > 1 else (
        here.parent / "android" / "play-screenshots"
    )
    if not src.is_dir():
        print(f"crop-play-screenshots: {src} is not a directory")
        return 2
    dst.mkdir(parents=True, exist_ok=True)

    files = sorted(
        p for p in src.iterdir()
        if p.suffix.lower() in {".png", ".jpg", ".jpeg"} and not p.name.startswith(".")
    )
    if not files:
        print(f"crop-play-screenshots: no images in {src}")
        return 2

    print(f"  {len(files)} image(s) -> {dst}\n")
    failures = 0
    for i, f in enumerate(files, 1):
        img = Image.open(f).convert("RGB")
        w, h = img.size
        # Cap each search at 12% of the height — far more than any real system
        # bar, far less than enough to swallow content.
        top = top_override if top_override is not None else find_bar(img, True, int(h * 0.12))
        bot = bottom_override if bottom_override is not None else find_bar(img, False, int(h * 0.12))

        # If detection alone does not get us under the ratio, take the remainder
        # off the BOTTOM: the top of a screenshot carries the screen title and
        # the first card, which is what a browsing user actually reads.
        need = h - top - bot - int(w * MAX_RATIO)
        if need > 0:
            bot += need

        out = img.crop((0, top, w, h - bot))
        ow, oh = out.size
        ratio = oh / ow
        ok = ratio <= 2.0 and min(ow, oh) >= 320 and max(ow, oh) <= 3840
        if not ok:
            failures += 1
        name = f"{i:02d}-{f.stem.lower().replace(' ', '-').replace('_', '-')}.png"
        out.save(dst / name, optimize=True)
        print(f"  {'OK ' if ok else 'FAIL'} {name:34} {w}x{h} -> {ow}x{oh}"
              f"  ratio {ratio:.3f}   cut {top}px top / {bot}px bottom")

    print()
    if failures:
        print(f"  {failures} still out of spec — inspect those manually.")
        return 1
    print("  All within Play's limits (long side <= 2x short side).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
