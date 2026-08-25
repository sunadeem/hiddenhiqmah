#!/usr/bin/env python3
"""Generate the Android splash variant of the Hidden Hiqmah mark.

Spec (from the Android-side session):
  - SVG, transparent background (theme supplies the black field)
  - ~1:1 composition filling ~176dp of the 288dp splash canvas
    (Android 12+ guarantees the centre 192dp circle; 176 leaves ~8% margin)
  - min stroke ~8dp on the 288 canvas; flat colour, no gradients
  - simplified: solid enlarged star, single solid book (no thin page layers)

The arch is built as a FILLED two-contour shape, not a stroked path: a 9dp
stroke meeting at the ogee tip (~18 deg) would miter-spike ~29dp past the
canvas, and a round join would blunt the mihrab point. Outer and inner ogee
curves meet at their own sharp apexes instead, which is also how the original
raster mark thickens from its tip.

Every element contributes sample points to a containment check: nothing may
leave the 88dp radius (176dp circle) around canvas centre.
"""

import math
import os

CX, CY = 144.0, 144.0
R_MAX = 88.0          # ink must stay inside this radius = 176dp circle
GOLD = "#D4A843"      # == hiqmah_gold in colors.xml / --color-gold in globals.css
CREAM = "#F8E8C8"     # dominant cream sampled from the master mark

samples = []          # (x, y, label) — containment audit


def pt(x, y, label):
    samples.append((x, y, label))
    return x, y


def bez(p0, c1, c2, p1, n=60):
    out = []
    for i in range(n + 1):
        t = i / n
        mt = 1 - t
        x = mt**3 * p0[0] + 3 * mt**2 * t * c1[0] + 3 * mt * t**2 * c2[0] + t**3 * p1[0]
        y = mt**3 * p0[1] + 3 * mt**2 * t * c1[1] + 3 * mt * t**2 * c2[1] + t**3 * p1[1]
        out.append((x, y))
    return out


def audit_bez(p0, c1, c2, p1, label):
    for x, y in bez(p0, c1, c2, p1):
        samples.append((x, y, label))


def f(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return s if s else "0"


def C(c1, c2, p):
    return f"C {f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p[0])} {f(p[1])}"


def mirror(p):
    return (2 * CX - p[0], p[1])


# ---------------------------------------------------------------- arch ------
# Left-side contours; right side is mirrored. y grows downward.
APEX_O = (CX, 56.0)          # outer tip — topmost ink, exactly on the circle
APEX_I = (CX, 72.0)          # inner tip, 16dp deep: sharp point, no spike
ARCH_W = 9.0                 # body thickness (>= 8dp spec)

# Outer dome: apex -> shoulder where the wall turns vertical, then a straight
# drop to the base (which tucks under the book's edge). The original mark is a
# tall horseshoe mihrab — curvature lives in the top third, sides stay upright.
O_C1, O_C2, O_FLANK = (140.0, 72.0), (95.0, 90.0), (88.0, 116.0)
O_D1, O_D2, O_BASE = (87.2, 146.0), (87.5, 176.0), (88.5, 202.0)
# inner dome, one wall-thickness in
I_C1, I_C2, I_FLANK = (140.5, 80.0), (102.5, 98.0), (97.0, 116.0)
I_D1, I_D2, I_BASE = (96.2, 146.0), (96.5, 176.0), (97.5, 202.0)

audit_bez(APEX_O, O_C1, O_C2, O_FLANK, "arch-outer")
audit_bez(O_FLANK, O_D1, O_D2, O_BASE, "arch-outer")
audit_bez(APEX_I, I_C1, I_C2, I_FLANK, "arch-inner")
audit_bez(I_FLANK, I_D1, I_D2, I_BASE, "arch-inner")

arch = " ".join([
    f"M {f(APEX_O[0])} {f(APEX_O[1])}",
    C(O_C1, O_C2, O_FLANK),
    C(O_D1, O_D2, O_BASE),
    f"L {f(I_BASE[0])} {f(I_BASE[1])}",
    C(I_D2, I_D1, I_FLANK),
    C(I_C2, I_C1, APEX_I),
    C(mirror(I_C1), mirror(I_C2), mirror(I_FLANK)),
    C(mirror(I_D1), mirror(I_D2), mirror(I_BASE)),
    f"L {f(mirror(O_BASE)[0])} {f(mirror(O_BASE)[1])}",
    C(mirror(O_D2), mirror(O_D1), mirror(O_FLANK)),
    C(mirror(O_C2), mirror(O_C1), APEX_O),
    "Z",
])

# ---------------------------------------------------------------- star ------
# Khatam: union of two squares (circumradius R), one rotated 45deg.
# 16-gon: outer vertices at k*45deg radius R, inner at 22.5+k*45 radius .765R.
STAR_C = (CX, 99.5)    # verified round 1: at (144,96) R13.5 it sat 3.5dp off the
STAR_R = 15.0          # walls and fused at 48px; round 2 sat 3dp lower + smaller
# A true two-square khatam union has inner radius 0.7654R, but solid at this
# scale that reads as a rosette (round-2 brand review). 0.70 cuts the points
# ~30% deeper while the point bases stay >= 8dp (2 * 0.70R * sin 22.5 = 8.03).
INNER = STAR_R * 0.70

star_pts = []
for k in range(16):
    ang = math.radians(k * 22.5 - 90)  # start with a point straight up
    r = STAR_R if k % 2 == 0 else INNER
    x = STAR_C[0] + r * math.cos(ang)
    y = STAR_C[1] + r * math.sin(ang)
    star_pts.append(pt(x, y, "star"))
star = "M " + " L ".join(f"{f(x)} {f(y)}" for x, y in star_pts) + " Z"

# ------------------------------------------------------------------- H ------
# Slab-bracketed serif H, all features >= 8dp.
H_TOP, H_BOT = 122.0, 186.0        # cap height 64, dropped into the wide zone
STEM_W = 13.0
H_HALF = 30.0                       # outer serif edge at CX +/- 30 (width 60)
SERIF_T = 8.5                       # serif slab thickness
SERIF_OH = 4.5                      # short overhang: at 5.5 the two inner serifs
                                    # left a 10dp aperture between the stems and the
                                    # counters sealed into pinholes at 48px (the H
                                    # read as an '8'); 4.5 + 13dp stems opens it to 16dp
BAR_T = 9.5                         # crossbar — thinner than the stems so the
                                    # letter keeps a hint of the master's contrast
BRACKET = 3.5                       # shallow bracket — deep 5dp brackets read
                                    # Tuscan/western rather than bookish

# left stem: outer serif edge x0, stem edges xs0..xs1, inner serif edge x1
x0 = CX - H_HALF                    # 110
xs0 = x0 + SERIF_OH                 # 116
xs1 = xs0 + STEM_W                  # 131
x1 = xs1 + SERIF_OH                 # 137


def stem(x0, xs0, xs1, x1):
    """One serifed stem as a closed path (clockwise), with quad brackets."""
    t, b = H_TOP, H_BOT
    st, sb = t + SERIF_T, b - SERIF_T
    p = [
        f"M {f(x0)} {f(t)}",
        f"L {f(x1)} {f(t)}",                       # top serif, top edge
        f"L {f(x1)} {f(st)}",                      # down inner face
        f"Q {f(xs1 + 1)} {f(st)} {f(xs1)} {f(st + BRACKET)}",   # bracket in
        f"L {f(xs1)} {f(sb - BRACKET)}",           # stem inner edge
        f"Q {f(xs1 + 1)} {f(sb)} {f(x1)} {f(sb)}", # bracket out
        f"L {f(x1)} {f(b)}",
        f"L {f(x0)} {f(b)}",                       # bottom serif
        f"L {f(x0)} {f(sb)}",
        f"Q {f(xs0 - 1)} {f(sb)} {f(xs0)} {f(sb - BRACKET)}",
        f"L {f(xs0)} {f(st + BRACKET)}",
        f"Q {f(xs0 - 1)} {f(st)} {f(x0)} {f(st)}",
        "Z",
    ]
    for xx in (x0, x1):
        pt(xx, t, "H")
        pt(xx, b, "H")
    return " ".join(p)


bar_y = (H_TOP + H_BOT) / 2 - 1.5   # a touch above true centre (optical)
h_path = " ".join([
    stem(x0, xs0, xs1, x1),
    stem(*[2 * CX - v for v in (x0, xs0, xs1, x1)][::-1]),  # mirrored stem
    # crossbar (overlaps into both stems for a clean weld)
    f"M {f(xs1 - 2)} {f(bar_y - BAR_T / 2)} L {f(2 * CX - xs1 + 2)} {f(bar_y - BAR_T / 2)}"
    f" L {f(2 * CX - xs1 + 2)} {f(bar_y + BAR_T / 2)} L {f(xs1 - 2)} {f(bar_y + BAR_T / 2)} Z",
])

# ---------------------------------------------------------------- book ------
# One solid wing per side — no page layers. Top edge sweeps up from the spine
# dip to a raised outer corner; the outer edge then follows an arc of the
# R_EDGE circle (the corner hugs the splash mask instead of escaping it),
# and the bottom edge swoops to the cover's centre V.
SPINE_TOP = (CX, 201.0)      # top-edge height where the wings shoulder the gutter
NOTCH_HW, NOTCH_D = 6.0, 9.0 # spine gutter: deep dark V — the cue that makes the
                             # corners read RAISED (round-2 brand blocker)
BOTTOM_V = (CX, 223.5)       # lowest ink; keel shortened from 228 — a deep keel
                             # under a flat edge read as a boat hull
R_EDGE = 84.0                # outer edge rides this circle; pulled in from 87 so
                             # the wing tips overhang the arch walls less
PHI_T, PHI_B = 33.0, 46.0    # arc span, degrees below the horizontal


def on_edge(phi_deg):
    a = math.radians(phi_deg)
    return (CX - R_EDGE * math.cos(a), CY + R_EDGE * math.sin(a))


CORNER_T = on_edge(PHI_T)    # (67.9, 186.2)
CORNER_B = on_edge(PHI_B)    # (81.4, 204.4)
for d in range(int(PHI_T), int(PHI_B) + 1):
    x, y = on_edge(d)
    pt(x, y, "book-edge-arc")

# Page edge: flat off the gutter, then a ~23deg upward kick into the corner —
# the master's raised-corner sweep. Round 2 let this edge sag downward instead
# and the whole book read as a boat (brand blocker).
TOP_C1, TOP_C2 = (118.0, 201.0), (88.0, 196.0)
BOT_C1, BOT_C2 = (100.0, 214.5), (124.0, 220.0)  # bottom edge (corner->centre V);
                                                  # C2 sets the cover's V-point angle

SHOULDER = (CX - NOTCH_HW, SPINE_TOP[1] - 1.5)
NOTCH_BOT = (CX, SPINE_TOP[1] + NOTCH_D - 1.5)
audit_bez(SHOULDER, TOP_C1, TOP_C2, CORNER_T, "book-top")
audit_bez(CORNER_B, BOT_C1, BOT_C2, BOTTOM_V, "book-bottom")

book = " ".join([
    f"M {f(NOTCH_BOT[0])} {f(NOTCH_BOT[1])}",
    f"L {f(SHOULDER[0])} {f(SHOULDER[1])}",
    C(TOP_C1, TOP_C2, CORNER_T),
    f"A {f(R_EDGE)} {f(R_EDGE)} 0 0 0 {f(CORNER_B[0])} {f(CORNER_B[1])}",
    C(BOT_C1, BOT_C2, BOTTOM_V),
    C(mirror(BOT_C2), mirror(BOT_C1), mirror(CORNER_B)),
    f"A {f(R_EDGE)} {f(R_EDGE)} 0 0 0 {f(mirror(CORNER_T)[0])} {f(mirror(CORNER_T)[1])}",
    C(mirror(TOP_C2), mirror(TOP_C1), mirror(SHOULDER)),
    "Z",
])

# ------------------------------------------------------------ clearances ----
# Star must float free of the arch: min distance from any star vertex to the
# inner dome curve. Round-1 verification measured 3.47dp here and the star
# fused with the arch at 48px; hold the floor at 5dp.
inner_wall = bez(APEX_I, I_C1, I_C2, I_FLANK, n=200) + bez(I_FLANK, I_D1, I_D2, I_BASE, n=100)
inner_wall += [mirror(p) for p in inner_wall]
star_gap = min(math.hypot(sx - wx, sy - wy)
               for sx, sy in star_pts for wx, wy in inner_wall)
print(f"star-to-arch clearance: {star_gap:.2f}dp")
assert star_gap >= 5.0, f"star grazes the arch: {star_gap:.2f}dp < 5dp"

# Dome wall must hold >= 8dp everywhere below the designed tip taper (y > 90).
outer_wall = bez(APEX_O, O_C1, O_C2, O_FLANK, n=200) + bez(O_FLANK, O_D1, O_D2, O_BASE, n=100)
wall_t = min(min(math.hypot(ox - ix, oy - iy) for ix, iy in inner_wall[:301])
             for ox, oy in outer_wall if oy > 90)
print(f"dome wall thickness (y>90): {wall_t:.2f}dp")
assert wall_t >= 8.0, f"dome wall thins to {wall_t:.2f}dp < 8dp"

aperture = 2 * (CX - (x0 + 2 * SERIF_OH + STEM_W))
print(f"H inner-serif aperture: {aperture:.1f}dp ({aperture / 6:.1f}px at 48px)")
assert aperture >= 14.0, f"H aperture {aperture:.1f}dp — counters will seal at 48px"

# ---------------------------------------------------------- containment -----
worst = max(samples, key=lambda s: math.hypot(s[0] - CX, s[1] - CY))
worst_r = math.hypot(worst[0] - CX, worst[1] - CY)
xs = [s[0] for s in samples]
ys = [s[1] for s in samples]
print(f"ink bbox: x {min(xs):.1f}..{max(xs):.1f} ({max(xs)-min(xs):.1f}dp)  "
      f"y {min(ys):.1f}..{max(ys):.1f} ({max(ys)-min(ys):.1f}dp)")
print(f"furthest ink: r={worst_r:.2f}dp ({worst[2]} at {worst[0]:.1f},{worst[1]:.1f}) "
      f"-> fills a {2*worst_r:.0f}dp circle of the 192dp visible / 288dp canvas")
assert worst_r <= R_MAX + 1e-6, f"ink escapes the {2*R_MAX:.0f}dp circle: {worst}"

svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 288" width="288" height="288">
  <!-- Hidden Hiqmah — Android 12+ splash mark. Generated by gen_splash_mark.py;
       edit the generator, not this file. Flat colour on transparency: the black
       field comes from windowSplashScreenBackground. Ink fills a {2*worst_r:.0f}dp circle
       of the 288dp canvas (192dp is the guaranteed-visible mask). -->
  <path fill="{GOLD}" d="{arch}"/>
  <path fill="{GOLD}" d="{star}"/>
  <path fill="{GOLD}" d="{book}"/>
  <path fill="{CREAM}" d="{h_path}"/>
</svg>
"""

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "assets", "splash-mark.svg"))
with open(OUT, "w") as fp:
    fp.write(svg)
print(f"wrote {OUT} ({len(svg)} bytes)")
