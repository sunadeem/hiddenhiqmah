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
    python3 scripts/crop-play-screenshots.py <input-dir> [output-dir]

Defaults the output to android/play-screenshots/ so the results land beside the
icon and feature graphic, versioned rather than living in a downloads folder.
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
    if len(sys.argv) < 2:
        print(__doc__.strip())
        return 2
    src = pathlib.Path(sys.argv[1]).expanduser()
    here = pathlib.Path(__file__).resolve().parent
    dst = pathlib.Path(sys.argv[2]).expanduser() if len(sys.argv) > 2 else (
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
        top = find_bar(img, True, int(h * 0.12))
        bot = find_bar(img, False, int(h * 0.12))

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
