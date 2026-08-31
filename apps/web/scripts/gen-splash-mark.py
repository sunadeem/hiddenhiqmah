#!/usr/bin/env python3
"""Generate the Android splash mark for Hidden Hiqmah — FAITHFUL vectorisation.

This replaces the build-6 redesign (reverted in 44b073f): every shape below is a
least-squares fit of the ORIGINAL raster mark, measured sub-pixel on
assets/icon-original.png (the highest-resolution copy of the art), with
placement verified against the shipped drawable-xxxhdpi/splash_icon.png
(source-dp = splash px / 4; the two agree under a uniform x0.665 map).

The ONLY geometric change vs the raster is scale: the source ink measures
194.73dp across its bbox diagonal on the 288dp canvas; it is scaled about its
own centre to 186.0dp (a 4.5% reduction, inside the brief's 176-186 band) and
recentred so the ink bbox centre sits exactly on the canvas centre (144,144).
Everything else — hairline strokes, star proportions, serif brackets, book
layers, lighting gradients — reproduces the measurement.

Colors are OPAQUE and match icon-original's on-black appearance, which is also
what the iOS splash ships (verified pixel-for-pixel); the Android PNG's global
semi-transparency (wall a~53%, leaf a~43%) was an export artifact that made the
Android splash darker than iOS — it is deliberately NOT reproduced.

Raster shading that a 3-stop VectorDrawable gradient cannot carry is built
from transparent->dark gradient fills: two OVERDRAWS of already-drawn geometry
(gutter_* re-fills the page so its needle darkens into the centre V; tipfade_*
re-fills the leaf ribbon so its outer tip dims), two strip families with their
own geometry (leaf_fold1-3, the dark folded crease along the leaf's outer top
edge; page_sh1-3, the soft shadow along the page's bottom contour - each drawn
as three stacked layers so their interior boundary fades instead of cutting).
The page/leaf gap is left EMPTY: the source gap is genuinely black (a seam
filler tried in one revision measurably deviated and was removed).

Fitted parameters come from per-element subpixel contour fits (max residual:
arch 0.17dp, star 0.09dp, H 0.10dp, book 0.15dp; fill fits mean |dRGB| <=
6.8/255), then three rounds of adversarial verification: blind A/B judges
comparing the render against the original at 303x455 px (the measured device
render size), an independent geometry audit re-derived from the emitted SVG,
a VectorDrawable spec audit, and multi-scale render audits at 288-2304px.
Final round: a blind judge who knew one image was a vectorisation could not
tell WHICH at 1:1 from the mark itself (only from raster noise/AA character),
and every earlier finding (dark corner facet, seam-filler invention, hard
overdraw edges, abutting-AA centre seam) was fixed and re-verified.

Tweak parameters, never the emitted SVG/XML. The judge-verified remaining
sub-perceptual gaps, all deliberate: no ~1px specular rim hairlines (arch
inner edges, page bottom edge - the raster has them, they vanish at splash
size), corner folds read as clean facets rather than painterly blends, and
the raster's resampling grain/halo is absent.
"""

import math
import os
import sys

# =========================================================================
# ARCH — fine gold ogee outline. Outer+inner edge chains, left fitted,
# right mirrored about the arch's own centre line. G1 by construction.
# =========================================================================
ARCH_P = {
    "cx": 143.824,               # arch's own mirror line (LSQ of 4 wall lines)
    "apex_y": 61.25,             # outer tip corner (topmost ink)
    "inner_apex_y": 66.98,       # inner tip corner (strokes merge between)
    "apex_dxdy": -0.5297,        # outer edge slope dx/dy at the tip, left side
    "inner_apex_dxdy": -0.7062,
    "wall_outer_x": 90.00,       # left wall outer edge (right mirrors to 197.65)
    "wall_thickness": 3.078,     # constant along the wall (no taper)
    "wall_top_outer_y": 120.0,   # ogee -> straight-wall junction (outer edge)
    "wall_top_inner_y": 120.5,
    "wall_end_outer_y": 201.37,  # bevel cap outer corner (walls end in a ~46deg
    "wall_end_inner_y": 198.17,  #  bevel, NOT a square cut — visible in the art)
    # ogee chains: on-curve knots (inflection, mid-shoulder), tangents [dx/dy,1],
    # handle lengths per cubic; final tangent vertical to meet the wall G1
    "outer_knots": [[121.53, 80.2], [98.18, 98.0]],
    "outer_knot_tangents": [[-1.8437, 1.0], [-0.7655, 1.0]],
    "outer_handles": [[11.41, 10.11], [9.85, 10.22], [7.92, 8.01]],
    "inner_knots": [[123.88, 82.5], [100.57, 100.0]],
    "inner_knot_tangents": [[-1.8298, 1.0], [-0.7599, 1.0]],
    "inner_handles": [[9.57, 8.44], [10.17, 10.18], [7.45, 7.54]],
}


def _unit(v):
    n = math.hypot(v[0], v[1])
    return (v[0] / n, v[1] / n)


def _f(v):
    return f"{round(v, 2) + 0.0:g}"


def _a_chain(apex, apex_tan, knots, knot_tans, junction, handles):
    nodes = [apex] + list(knots) + [junction]
    tans = [_unit(apex_tan)] + [_unit(t) for t in knot_tans] + [(0.0, 1.0)]
    segs = []
    for i, (a, b) in enumerate(handles):
        p0, p3 = nodes[i], nodes[i + 1]
        t0, t1 = tans[i], tans[i + 1]
        segs.append((p0, (p0[0] + a * t0[0], p0[1] + a * t0[1]),
                     (p3[0] - b * t1[0], p3[1] - b * t1[1]), p3))
    return segs


def _mirror_seg(seg, cx):
    return tuple((2 * cx - p[0], p[1]) for p in seg)


def _rev_seg(seg):
    return (seg[3], seg[2], seg[1], seg[0])


def _emit_C(segs):
    return [f"C {_f(c1[0])} {_f(c1[1])} {_f(c2[0])} {_f(c2[1])} {_f(p3[0])} {_f(p3[1])}"
            for _, c1, c2, p3 in segs]


def build_arch(P):
    cx = P["cx"]
    apex = (cx, P["apex_y"])
    in_apex = (cx, P["inner_apex_y"])
    wx_out = P["wall_outer_x"]
    wx_in = wx_out + P["wall_thickness"]
    outer = _a_chain(apex, (P["apex_dxdy"], 1.0), P["outer_knots"],
                     P["outer_knot_tangents"], (wx_out, P["wall_top_outer_y"]),
                     P["outer_handles"])
    inner = _a_chain(in_apex, (P["inner_apex_dxdy"], 1.0), P["inner_knots"],
                     P["inner_knot_tangents"], (wx_in, P["wall_top_inner_y"]),
                     P["inner_handles"])
    outer_r = [_mirror_seg(s, cx) for s in outer]
    inner_r = [_mirror_seg(s, cx) for s in inner]
    d = [f"M {_f(apex[0])} {_f(apex[1])}"]
    d += _emit_C(outer)
    d.append(f"V {_f(P['wall_end_outer_y'])}")
    d.append(f"L {_f(wx_in)} {_f(P['wall_end_inner_y'])}")
    d.append(f"V {_f(P['wall_top_inner_y'])}")
    d += _emit_C([_rev_seg(s) for s in reversed(inner)])
    d += _emit_C(inner_r)
    d.append(f"V {_f(P['wall_end_inner_y'])}")
    d.append(f"L {_f(2 * cx - wx_out)} {_f(P['wall_end_outer_y'])}")
    d.append(f"V {_f(P['wall_top_outer_y'])}")
    d += _emit_C([_rev_seg(s) for s in reversed(outer_r)])
    d.append("Z")
    return [("arch", " ".join(d))]


# =========================================================================
# STAR — khatam outline band: two 16-vertex star polygons (ring + hole).
# NOT the ideal two-squares construction: measured Rc/Rp = 0.732/0.734
# (notches cut ~0.39dp deeper, points sharper). Do not "correct" it.
# =========================================================================
STAR_P = {
    "outer": {"cx": 143.85, "cy": 101.49, "Rp": 11.59, "Rc": 8.48, "rot": 0.0},
    "hole":  {"cx": 143.85, "cy": 101.50, "Rp": 8.13,  "Rc": 5.97, "rot": 0.0},
}


def _star_vertices(cx, cy, Rp, Rc, rot):
    vs = []
    for k in range(8):
        for ang, R in ((rot + k * 45.0, Rp), (rot + 22.5 + k * 45.0, Rc)):
            a = math.radians(ang)
            vs.append((cx + R * math.sin(a), cy - R * math.cos(a)))
    return vs


def _poly_d(verts, reverse=False):
    if reverse:
        verts = [verts[0]] + verts[1:][::-1]
    return " ".join([f"M {_f(verts[0][0])} {_f(verts[0][1])}"] +
                    [f"L {_f(x)} {_f(y)}" for x, y in verts[1:]] + ["Z"])


def build_star(P):
    o, h = P["outer"], P["hole"]
    d = (_poly_d(_star_vertices(o["cx"], o["cy"], o["Rp"], o["Rc"], o["rot"])) + " " +
         _poly_d(_star_vertices(h["cx"], h["cy"], h["Rp"], h["Rc"], h["rot"]), reverse=True))
    return [("star", d)]


# =========================================================================
# H — cream serif letterform, constructed: 4 congruent serifs (rounded tip
# corner + vertical tip face + G1 two-cubic bracket), sharp crossbar joints.
# =========================================================================
H_P = {
    "cx": 143.50,          # the letter's own mirror line
    "y_top": 125.66, "y_bot": 186.64,
    "stem_out": 26.15, "stem_in": 15.57,     # |x-cx| of stem edges (w=10.58)
    "serif_out": 32.85, "serif_in": 8.76,    # |x-cx| of serif tip extremes
    "tip_flat": 0.30, "tip_r": 0.37, "tip_corner_k": 0.55, "face_v": 0.80,
    "bar_top": 152.21, "bar_bot": 155.82,    # centre 154.02 — optical, keep
    "bracket_out": {"a": 0.43, "knot": (3.65, 1.83), "theta": 22.40,
                    "la": 1.81, "lb": 3.16, "b": 3.22, "slab_h": 10.00},
    "bracket_in": {"a": 0.57, "knot": (3.84, 1.90), "theta": 25.70,
                   "la": 1.73, "lb": 2.86, "b": 3.32, "slab_h": 9.60},
}


def _serif_chain(x_tip, x_stem, y_ref, v, P, br):
    u = 1.0 if x_stem > x_tip else -1.0
    tf, tr, kc, fv = P["tip_flat"], P["tip_r"], P["tip_corner_k"], P["face_v"]
    a, (dxk, dyk), th = br["a"], br["knot"], br["theta"]
    la, lb, b, slab = br["la"], br["lb"], br["b"], br["slab_h"]
    dirx, diry = u * math.cos(math.radians(th)), v * math.sin(math.radians(th))
    F = (x_tip + u * tf, y_ref)
    T = (x_tip, y_ref + v * tr)
    P0 = (x_tip, y_ref + v * fv)
    K = (x_tip + u * dxk, y_ref + v * dyk)
    P3 = (x_stem, y_ref + v * slab)
    segs = [
        ("C", ((F[0] - u * tf * kc, y_ref), (x_tip, T[1] - v * tr * kc), T)),
        ("L", P0),
        ("C", ((x_tip, P0[1] + v * a), (K[0] - dirx * la, K[1] - diry * la), K)),
        ("C", ((K[0] + dirx * lb, K[1] + diry * lb), (x_stem, P3[1] - v * b), P3)),
    ]
    return F, segs


def _h_rev(F, segs):
    pts = [F]
    for t, s in segs:
        pts.append(s if t == "L" else s[2])
    out = []
    for i in range(len(segs) - 1, -1, -1):
        t, s = segs[i]
        prev = pts[i]
        out.append(("L", prev) if t == "L" else ("C", (s[1], s[0], prev)))
    return out


def build_h(P):
    cx = P["cx"]
    yt, yb = P["y_top"], P["y_bot"]
    lo, li = cx - P["stem_out"], cx - P["stem_in"]
    ro, ri = cx + P["stem_out"], cx + P["stem_in"]
    to, ti = cx - P["serif_out"], cx - P["serif_in"]
    TO, TI = cx + P["serif_out"], cx + P["serif_in"]
    bt, bb = P["bar_top"], P["bar_bot"]
    bo, bi = P["bracket_out"], P["bracket_in"]
    ch = {
        "tlo": _serif_chain(to, lo, yt, +1, P, bo),
        "blo": _serif_chain(to, lo, yb, -1, P, bo),
        "bli": _serif_chain(ti, li, yb, -1, P, bi),
        "bri": _serif_chain(TI, ri, yb, -1, P, bi),
        "bro": _serif_chain(TO, ro, yb, -1, P, bo),
        "tro": _serif_chain(TO, ro, yt, +1, P, bo),
        "tri": _serif_chain(TI, ri, yt, +1, P, bi),
        "tli": _serif_chain(ti, li, yt, +1, P, bi),
    }
    so, si = bo["slab_h"], bi["slab_h"]
    segs = []
    F1, c = ch["tlo"]
    segs += c
    segs.append(("L", (lo, yb - so)))
    segs += _h_rev(*ch["blo"])
    segs.append(("L", ch["bli"][0]))
    segs += ch["bli"][1]
    segs.append(("L", (li, bb)))
    segs.append(("L", (ri, bb)))
    segs.append(("L", (ri, yb - si)))
    segs += _h_rev(*ch["bri"])
    segs.append(("L", ch["bro"][0]))
    segs += ch["bro"][1]
    segs.append(("L", (ro, yt + so)))
    segs += _h_rev(*ch["tro"])
    segs.append(("L", ch["tri"][0]))
    segs += ch["tri"][1]
    segs.append(("L", (ri, bt)))
    segs.append(("L", (li, bt)))
    segs.append(("L", (li, yt + si)))
    segs += _h_rev(*ch["tli"])
    segs.append(("L", F1))
    d = [f"M {_f(F1[0])} {_f(F1[1])}"]
    for t, s in segs:
        if t == "L":
            d.append(f"L {_f(s[0])} {_f(s[1])}")
        else:
            c1, c2, p = s
            d.append(f"C {_f(c1[0])} {_f(c1[1])} {_f(c2[0])} {_f(c2[1])} {_f(p[0])} {_f(p[1])}")
    d.append("Z")
    return [("h", " ".join(d))]


# =========================================================================
# BOOK — main page ribbon + fold facet + top-edge highlight rim + one big
# leaf ribbon + bottom-leaf tip wedge. Left wing fitted, right mirrored.
# Landmarks: CT crease-top, PT page fold tip, CB crease-bottom, MT leaf dim
# tip, WT wedge tip (stops 0.25dp short of the wall outer edge x=90.00; it is
# the mark's furthest-out ink). Chains are fitted cubics, knots at fixed x.
# =========================================================================
BOOK_P = {
    "cx": 143.85, "rim_dp": 0.36,
    "CT": [100.8, 194.22], "PT": [93.95, 200.95], "MT": [94.55, 205.85],
    "WT": [90.25, 211.72], "CB": [104.2, 200.85],
    "seam_fuse": [95.85, 206.35], "seam_slope": -1.04, "seam_end_x": 96.9,
    "page_top": [
        [[100.8, 194.22], [105.351, 194.27], [107.922, 194.683], [112.0, 195.3]],
        [[112.0, 195.3], [116.282, 196.081], [119.967, 197.126], [124.0, 198.825]],
        [[124.0, 198.825], [127.718, 200.451], [130.83, 202.12], [134.0, 204.573]],
        [[134.0, 204.573], [136.506, 206.43], [138.738, 208.634], [140.5, 211.062]],
        [[140.5, 211.062], [141.864, 212.995], [142.458, 213.772], [143.85, 217.38]],
    ],
    "page_bot": [
        [[93.95, 200.95], [97.964, 200.835], [99.697, 200.696], [103.0, 200.791]],
        [[103.0, 200.791], [107.538, 200.96], [111.649, 201.416], [116.0, 202.421]],
        [[116.0, 202.421], [120.436, 203.466], [124.861, 205.13], [128.0, 206.675]],
        [[128.0, 206.675], [130.708, 208.013], [133.478, 209.438], [137.0, 212.079]],
        [[137.0, 212.079], [138.596, 213.211], [140.093, 214.458], [141.5, 215.897]],
        [[141.5, 215.897], [142.499, 216.832], [142.436, 216.807], [143.85, 218.32]],
    ],
    "leaf_top": [
        [[94.55, 205.85], [96.378, 204.337], [95.876, 204.845], [97.0, 204.259]],
        [[97.0, 204.259], [99.472, 204.138], [101.831, 204.173], [104.0, 204.327]],
        [[104.0, 204.327], [109.442, 205.081], [111.693, 204.941], [116.0, 205.896]],
        [[116.0, 205.896], [120.724, 206.955], [124.013, 208.103], [128.0, 209.923]],
        [[128.0, 209.923], [130.405, 211.033], [133.489, 212.581], [137.0, 215.114]],
        [[137.0, 215.114], [138.568, 216.298], [140.115, 217.545], [141.5, 218.929]],
        [[141.5, 218.929], [142.531, 219.847], [142.505, 220.044], [143.85, 221.4]],
    ],
    "leaf_bot": [
        [[90.25, 211.72], [97.918, 210.038], [95.744, 210.641], [99.8, 210.04]],
        [[99.8, 210.04], [103.112, 209.63], [106.448, 209.48], [110.0, 209.596]],
        [[110.0, 209.596], [114.414, 209.819], [117.895, 210.391], [122.0, 211.418]],
        [[122.0, 211.418], [125.769, 212.456], [129.246, 213.679], [133.0, 215.67]],
        [[133.0, 215.67], [135.862, 217.096], [138.125, 218.582], [140.5, 220.472]],
        [[140.5, 220.472], [141.852, 221.589], [142.153, 221.842], [143.85, 223.52]],
    ],
    # dark folded strip along the leaf's outer top edge (crease line below the
    # leaf_top chain; right end fades out via its fill gradient)
    # dark fold strip along the leaf's outer top edge: the crease sits ~1dp
    # below the top edge (verify round: 205.9 was 0.6dp too deep - the raster
    # is bright again by y=205.3). Drawn as N_FOLD stacked layers whose bottoms
    # step up by fold_step, so the crease fades instead of cutting hard.
    "leaf_fold_end_x": 111.5, "leaf_fold_crease_y": 205.35, "fold_step": 0.15,
    "shadow_dp": 1.1,       # page bottom-edge shadow band height (3 layers)
    "center_overlap": 0.06, # left/right halves overlap at the centre V so the
                            # abutting-AA seam cannot show on 4K tablets
}


def _b_chain(segs, dy=0.0, rev=False):
    ss = [list(reversed(s)) for s in reversed(segs)] if rev else segs
    return ["C " + " ".join(f"{_f(p[0])} {_f(p[1] + dy)}" for p in (s[1], s[2], s[3]))
            for s in ss]


def _split_cubic_at_x(seg, x):
    """de Casteljau split of cubic seg at the t where x(t)=x (x monotonic)."""
    p0, c1, c2, p3 = [tuple(p) for p in seg]
    lo, hi = 0.0, 1.0
    for _ in range(60):
        mid = (lo + hi) / 2
        xm = ((1 - mid) ** 3 * p0[0] + 3 * (1 - mid) ** 2 * mid * c1[0]
              + 3 * (1 - mid) * mid ** 2 * c2[0] + mid ** 3 * p3[0])
        if (xm < x) == (p0[0] < p3[0]):
            lo = mid
        else:
            hi = mid
    t = (lo + hi) / 2

    def lerp(a, b):
        return (a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]))
    q0, q1, q2 = lerp(p0, c1), lerp(c1, c2), lerp(c2, p3)
    r0, r1 = lerp(q0, q1), lerp(q1, q2)
    s = lerp(r0, r1)
    return (p0, q0, r0, s), (s, r1, q2, p3)


def _b_mirror_d(d, cx):
    toks = d.split()
    out, i = [], 0
    while i < len(toks):
        t = toks[i]
        if t in ("M", "L"):
            out += [t, _f(2 * cx - float(toks[i + 1])), toks[i + 2]]
            i += 3
        elif t == "C":
            out.append("C")
            for j in range(3):
                out += [_f(2 * cx - float(toks[i + 1 + 2 * j])), toks[i + 2 + 2 * j]]
            i += 7
        elif t == "Z":
            out.append("Z")
            i += 1
        else:
            raise ValueError(t)
    return " ".join(out)


def _shift_end(chain, dx):
    """Copy of a cubic chain with the final on-curve point shifted by dx."""
    out = [list(map(list, seg)) for seg in chain]
    out[-1][3][0] += dx
    return out


def build_book(P):
    cx = P["cx"]
    CT, PT, MT, WT, CB = P["CT"], P["PT"], P["MT"], P["WT"], P["CB"]
    ov = P["center_overlap"]
    pt_chain = _shift_end(P["page_top"], ov)
    pb_chain = _shift_end(P["page_bot"], ov)
    lt_chain = _shift_end(P["leaf_top"], ov)
    lb_chain = _shift_end(P["leaf_bot"], ov)
    yN = pt_chain[-1][3][1]
    yU = pb_chain[-1][3][1]
    yLB = lb_chain[-1][3][1]
    K1 = tuple(lb_chain[1][0])
    fuse = P["seam_fuse"]
    seam_end = (P["seam_end_x"], WT[1] + P["seam_slope"] * (P["seam_end_x"] - WT[0]))
    rim = P["rim_dp"]
    cxo = cx + ov

    left = {}
    left["page"] = " ".join(
        [f"M {_f(PT[0])} {_f(PT[1])}", f"L {_f(CT[0])} {_f(CT[1])}"]
        + _b_chain(pt_chain) + [f"L {_f(cxo)} {_f(yU)}"]
        + _b_chain(pb_chain, rev=True) + ["Z"])
    pt_plain = [list(map(list, s)) for s in P["page_top"]]   # no centre overlap:
    left["page_hl"] = " ".join(                              # fused rims made a
        [f"M {_f(CT[0])} {_f(CT[1])}"] + _b_chain(pt_plain)  # bright 1px junction
        + [f"L {_f(cx)} {_f(yN + rim)}"] + _b_chain(pt_plain, dy=rim, rev=True) + ["Z"])
    # soft shadow along the page's bottom edge (the master's page face darkens
    # toward its lower contour). Three stacked bands whose tops step down by
    # shadow_dp/3 fake a vertical fade - a single band showed a hard interior
    # edge on 4K tablets (verify round).
    sh = P["shadow_dp"]
    for i in (1, 2, 3):
        d = sh * i / 3.0
        left[f"page_sh{i}"] = " ".join(
            [f"M {_f(PT[0])} {_f(PT[1] - d)}"] + _b_chain(pb_chain, dy=-d)
            + [f"L {_f(cxo)} {_f(yU)}"] + _b_chain(pb_chain, rev=True) + ["Z"])
    left["fold"] = " ".join([
        f"M {_f(CT[0])} {_f(CT[1])}", f"L {_f(CB[0])} {_f(CB[1])}",
        f"L {_f(PT[0])} {_f(PT[1])}", "Z"])
    left["leaf_mid"] = " ".join(
        [f"M {_f(MT[0])} {_f(MT[1])}"] + _b_chain(lt_chain)
        + [f"L {_f(cxo)} {_f(yLB)}"] + _b_chain(lb_chain[1:], rev=True)
        + [f"L {_f(fuse[0])} {_f(fuse[1])}", "Z"])
    left["leaf_bot"] = " ".join(
        [f"M {_f(WT[0])} {_f(WT[1])}",
         f"L {_f(seam_end[0])} {_f(seam_end[1])}", f"L {_f(K1[0])} {_f(K1[1])}"]
        + _b_chain(lb_chain[:1], rev=True) + ["Z"])
    # dark folded strip along leaf_top from MT to leaf_fold_end_x, down to a
    # crease. Three layers, crease stepping up, so the lower boundary fades.
    fx = P["leaf_fold_end_x"]
    strip_segs = []
    for seg in lt_chain:
        if seg[3][0] <= fx:
            strip_segs.append(seg)
        elif seg[0][0] < fx:
            strip_segs.append(_split_cubic_at_x(seg, fx)[0])
    for i in (1, 2, 3):
        fy = P["leaf_fold_crease_y"] - P["fold_step"] * (i - 1)
        left[f"leaf_fold{i}"] = " ".join(
            [f"M {_f(MT[0])} {_f(MT[1])}"] + _b_chain(strip_segs)
            + [f"L {_f(fx)} {_f(fy)}", f"L {_f(MT[0] + 1.2)} {_f(fy)}", "Z"])

    order = ["leaf_bot", "leaf_mid", "leaf_fold1", "leaf_fold2",
             "leaf_fold3", "page", "page_sh1", "page_sh2", "page_sh3",
             "fold", "page_hl"]
    out = []
    for name in order:
        out.append((f"{name}_l", left[name]))
        out.append((f"{name}_r", _b_mirror_d(left[name], cx)))
    return out


# =========================================================================
# FILLS — fitted on icon-original interiors (>=2px eroded); coordinates in
# source-dp (transformed with the geometry). VectorDrawable-compatible:
# flat or linear, <=3 stops, alpha allowed.
# =========================================================================
def _fade(x_from, x_to, y, color, stops):
    """transparent -> dark overdraw gradient along x; stops = [(off, opacity)]."""
    return {"type": "linear", "x1": x_from, "y1": y, "x2": x_to, "y2": y,
            "stops": [{"offset": o, "color": color, "opacity": a} for o, a in stops]}


BCX = BOOK_P["cx"]
FILLS = {
    # arch: 3-stop LSQ refit against 56 band-centerline stations of the
    # reference at 303x455 (mean |dRGB| 3.3 vs 4.2 for the fitted 2-stop; the
    # 2-stop overshot the apex tip by ~19/255). Mid/top stops carry a small
    # positive bump over the raw LSQ values: the raster's band peak (it has a
    # ~1px specular rim inside the stroke edges) runs brighter than the band
    # mean the fit matches; the bump closes the mean gap the final forensic
    # judge measured without inventing the rim as geometry.
    "arch": {"type": "linear", "x1": 131.39, "y1": 205.55, "x2": 153.91, "y2": 65.68,
             "stops": [{"offset": 0.0, "color": "#7E561D"},
                       {"offset": 0.5, "color": "#D4A146"},
                       {"offset": 1.0, "color": "#F4C25E"}]},
    # star: probes read top 219 / left 207 / bottom 204 — a vertical axis, not
    # the fitted tilt (which made the left band too bright)
    "star": {"type": "linear", "x1": 143.85, "y1": 112.6, "x2": 143.85, "y2": 90.3,
             "stops": [{"offset": 0.0, "color": "#D4A149"},
                       {"offset": 1.0, "color": "#E0AD50"}]},
    "h": {"type": "flat", "color": "#F9E9CB"},
    "page_l": {"type": "linear", "x1": 145.8, "y1": 209.79, "x2": 102.39, "y2": 196.28,
               "stops": [{"offset": 0.0, "color": "#A1732D"},
                         {"offset": 0.55, "color": "#DAA345"},
                         {"offset": 1.0, "color": "#C18D38"}]},
    "page_r": {"type": "linear", "x1": 141.85, "y1": 211.72, "x2": 184.76, "y2": 194.91,
               "stops": [{"offset": 0.0, "color": "#A5762D"},
                         {"offset": 0.5, "color": "#D6A044"},
                         {"offset": 1.0, "color": "#C28E39"}]},
    "fold_l": {"type": "flat", "color": "#C08C38"},
    "fold_r": {"type": "linear", "x1": 191.77, "y1": 200.25, "x2": 181.23, "y2": 196.94,
               "stops": [{"offset": 0.0, "color": "#B07E32"},
                         {"offset": 1.0, "color": "#C9943C"}]},
    # highlight rim: peaks pulled ~10% down from the fitted per-column maxima -
    # against the soft raster the full-peak hairline read as a hard metallic
    # ridge (blind-judge round); the original's ridge blends into the face
    "page_hl_l": {"type": "linear", "x1": 100.89, "y1": 196.02, "x2": 142.42, "y2": 203.23,
                  "stops": [{"offset": 0.0, "color": "#D29134"},
                            {"offset": 0.45, "color": "#F2D267"},
                            {"offset": 1.0, "color": "#CC8730"}]},
    "page_hl_r": {"type": "linear", "x1": 177.63, "y1": 186.89, "x2": 151.6, "y2": 216.23,
                  "stops": [{"offset": 0.0, "color": "#D09335"},
                            {"offset": 0.4, "color": "#F0C158"},
                            {"offset": 1.0, "color": "#CD923B"}]},
    "leaf_mid_l": {"type": "linear", "x1": 109.8, "y1": 218.08, "x2": 115.81, "y2": 204.98,
                   "stops": [{"offset": 0.0, "color": "#946725"},
                             {"offset": 1.0, "color": "#B48434"}]},
    "leaf_mid_r": {"type": "linear", "x1": 179.8, "y1": 219.39, "x2": 170.43, "y2": 203.85,
                   "stops": [{"offset": 0.0, "color": "#8D6324"},
                             {"offset": 1.0, "color": "#B18135"}]},
    # dark folded strip: three stacked layers (bottoms step up 0.15dp) so the
    # crease fades downward like the raster instead of cutting hard
    # page bottom-edge shadow: three stacked bands (tops step down) fake the
    # vertical fade; per-layer opacity ~1/3 of the single-band value
    # overdraw fades (raster fades a 3-stop gradient can't carry). Stops are
    # probe-tuned: page needle keeps full gradient colour until ~3.5dp from the
    # centre V then dives (ref R-channel 163@140.5 -> 140@142 -> 92@143.2);
    # the leaf ribbon fades only in its last ~3dp before the dim tip MT.
    "gutter_l": _fade(140.3, 143.9, 210.0, "#463214",
                      [(0.0, 0.0), (0.45, 0.14), (1.0, 0.84)]),
    "gutter_r": _fade(2 * BCX - 140.3, 2 * BCX - 143.9, 210.0, "#463214",
                      [(0.0, 0.0), (0.45, 0.14), (1.0, 0.84)]),
    "tipfade_l": _fade(101.0, 93.5, 211.0, "#201503",
                       [(0.0, 0.0), (0.45, 0.22), (1.0, 0.80)]),
    "tipfade_r": _fade(2 * BCX - 101.0, 2 * BCX - 93.5, 211.0, "#201503",
                       [(0.0, 0.0), (0.45, 0.22), (1.0, 0.80)]),
    # wedge (bottom-leaf tip): the raster keeps the tip BRIGHT (~luma 100)
    # with only a small dark corner shadow at the extreme outer end - the
    # verify round caught a flat dark facet here as the worst deviation
    "leaf_bot_l": {"type": "linear", "x1": 90.6, "y1": 211.5, "x2": 99.5, "y2": 208.3,
                   "stops": [{"offset": 0.0, "color": "#7B551D"},
                             {"offset": 1.0, "color": "#A0712A"}]},
    "leaf_bot_r": {"type": "linear", "x1": 197.1, "y1": 211.5, "x2": 188.2, "y2": 208.3,
                   "stops": [{"offset": 0.0, "color": "#78521B"},
                             {"offset": 1.0, "color": "#9C6E28"}]},
}
# layered fills: fold strip (downward-fading crease) and page bottom shadow
for _i, _a in ((1, 1.0), (2, 0.40), (3, 0.35)):
    FILLS[f"leaf_fold{_i}_l"] = _fade(95.0, 110.5, 205.0, "#684818",
                                      [(0.0, _a), (0.5, _a * 0.9), (1.0, 0.0)])
    FILLS[f"leaf_fold{_i}_r"] = _fade(2 * BCX - 95.0, 2 * BCX - 110.5, 205.0,
                                      "#664618",
                                      [(0.0, _a), (0.5, _a * 0.9), (1.0, 0.0)])
for _i in (1, 2, 3):
    FILLS[f"page_sh{_i}_l"] = _fade(97.0, BCX, 205.0, "#5C3F16",
                                    [(0.0, 0.0), (0.45, 0.104), (1.0, 0.0)])
    FILLS[f"page_sh{_i}_r"] = _fade(2 * BCX - 97.0, BCX, 205.0, "#5C3F16",
                                    [(0.0, 0.0), (0.45, 0.104), (1.0, 0.0)])


# =========================================================================
# Assembly: build all paths in source-dp, then scale about the ink-bbox
# centre to TARGET_DIAG and recentre onto the canvas centre.
# =========================================================================
TARGET_DIAG = 185.99   # brief: 176-186dp; the gentlest permitted reduction
                       # (4.5% from the source's 194.73dp diagonal). 185.99
                       # rather than 186.00 so the 0.01dp coordinate rounding
                       # at emission cannot push the measured diagonal over.
CANVAS = 288.0
R_MAX = 88.0           # containment audit: no ink beyond this radius
SRC_DIAG = 194.73      # the source mark's ink-bbox diagonal; pinned so a
                       # geometry typo cannot silently be absorbed into k

# every command the emitters may produce (Android VectorDrawable-safe subset;
# parse_path raises on anything else, so emission is provably inside this set)
ALLOWED_CMDS = set("MLHVCZ")


def require(cond, msg):
    """Audit check that survives python -O (assert would be stripped)."""
    if not cond:
        raise SystemExit(f"AUDIT FAIL: {msg}")


def parse_path(d):
    """-> list of (cmd, [floats]); absolute M L H V C Z only (what we emit)."""
    toks = d.split()
    out, i = [], 0
    while i < len(toks):
        c = toks[i]
        if c not in ALLOWED_CMDS:
            raise SystemExit(f"AUDIT FAIL: unsupported path command {c!r}")
        n = {"M": 2, "L": 2, "C": 6, "H": 1, "V": 1, "Z": 0}[c]
        out.append((c, [float(v) for v in toks[i + 1:i + 1 + n]]))
        i += 1 + n
    return out


def path_points(d, samples=24):
    """Sample a path to points for audit (beziers subdivided)."""
    pts, cur, start = [], None, None
    for c, v in parse_path(d):
        if c == "M":
            cur = start = (v[0], v[1])
            pts.append(cur)
        elif c == "L":
            cur = (v[0], v[1])
            pts.append(cur)
        elif c == "H":
            cur = (v[0], cur[1])
            pts.append(cur)
        elif c == "V":
            cur = (cur[0], v[0])
            pts.append(cur)
        elif c == "C":
            p0, c1, c2, p3 = cur, (v[0], v[1]), (v[2], v[3]), (v[4], v[5])
            for i in range(1, samples + 1):
                t = i / samples
                mt = 1 - t
                pts.append((mt**3 * p0[0] + 3 * mt**2 * t * c1[0] + 3 * mt * t**2 * c2[0] + t**3 * p3[0],
                            mt**3 * p0[1] + 3 * mt**2 * t * c1[1] + 3 * mt * t**2 * c2[1] + t**3 * p3[1]))
            cur = p3
        elif c == "Z":
            if start:
                pts.append(start)
    return pts


def transform_path(d, k, tx, ty):
    out = []
    for c, v in parse_path(d):
        if c in ("M", "L"):
            out.append(f"{c} {_f(v[0] * k + tx)} {_f(v[1] * k + ty)}")
        elif c == "H":
            out.append(f"H {_f(v[0] * k + tx)}")
        elif c == "V":
            out.append(f"V {_f(v[0] * k + ty)}")
        elif c == "C":
            xy = [v[j] * k + (tx if j % 2 == 0 else ty) for j in range(6)]
            out.append("C " + " ".join(_f(z) for z in xy))
        else:
            out.append("Z")
    return " ".join(out)


def transform_fill(fill, k, tx, ty):
    if fill["type"] != "linear":
        return dict(fill)
    f = dict(fill)
    f["x1"], f["y1"] = fill["x1"] * k + tx, fill["y1"] * k + ty
    f["x2"], f["y2"] = fill["x2"] * k + tx, fill["y2"] * k + ty
    return f


def generate():
    paths = []                                   # (slot, d) in z-order
    paths += build_arch(ARCH_P)
    book = dict(build_book(BOOK_P))
    consumed = set()

    def emit_book(slot):
        consumed.add(slot)
        paths.append((slot, book[slot]))

    for slot in ("leaf_bot_l", "leaf_bot_r", "leaf_mid_l", "leaf_mid_r"):
        emit_book(slot)
    # overdraw fades reuse the leaf-ribbon geometry
    paths.append(("tipfade_l", book["leaf_mid_l"]))
    paths.append(("tipfade_r", book["leaf_mid_r"]))
    for slot in ("leaf_fold1_l", "leaf_fold1_r", "leaf_fold2_l", "leaf_fold2_r",
                 "leaf_fold3_l", "leaf_fold3_r", "page_l", "page_r",
                 "page_sh1_l", "page_sh1_r", "page_sh2_l", "page_sh2_r",
                 "page_sh3_l", "page_sh3_r"):
        emit_book(slot)
    paths.append(("gutter_l", book["page_l"]))
    paths.append(("gutter_r", book["page_r"]))
    for slot in ("fold_l", "fold_r", "page_hl_l", "page_hl_r"):
        emit_book(slot)
    require(consumed == set(book), f"book slots not emitted: {set(book) - consumed}")
    paths += build_star(STAR_P)
    paths += build_h(H_P)

    # ---- ink bbox (overdraw fades excluded: they add no new ink) ----
    ink = [p for s, d in paths if not s.startswith(("tipfade", "gutter"))
           for p in path_points(d)]
    xs = [p[0] for p in ink]
    ys = [p[1] for p in ink]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    src_diag = math.hypot(x1 - x0, y1 - y0)
    require(abs(src_diag - SRC_DIAG) < 0.3,
            f"source geometry drifted: ink diagonal {src_diag:.2f}dp != {SRC_DIAG}")
    k = TARGET_DIAG / src_diag
    cxm, cym = (x0 + x1) / 2, (y0 + y1) / 2
    tx, ty = CANVAS / 2 - k * cxm, CANVAS / 2 - k * cym

    tpaths = [(s, transform_path(d, k, tx, ty)) for s, d in paths]
    tfills = {s: transform_fill(f, k, tx, ty) for s, f in FILLS.items()}

    # ------------------------------ audit -------------------------------
    ink2 = [p for s, d in tpaths if not s.startswith(("tipfade", "gutter"))
            for p in path_points(d)]
    xs = [p[0] for p in ink2]
    ys = [p[1] for p in ink2]
    bw, bh = max(xs) - min(xs), max(ys) - min(ys)
    diag = math.hypot(bw, bh)
    worst = max(ink2, key=lambda p: math.hypot(p[0] - 144, p[1] - 144))
    worst_r = math.hypot(worst[0] - 144, worst[1] - 144)
    bcx, bcy = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2

    print(f"scale k={k:.5f} (source diag {src_diag:.2f}dp -> {diag:.2f}dp)")
    print(f"ink bbox: {bw:.2f} x {bh:.2f}dp at centre ({bcx:.2f},{bcy:.2f})")
    print(f"furthest ink: r={worst_r:.2f}dp at ({worst[0]:.1f},{worst[1]:.1f}) "
          f"(192dp-circle radius is 96; audit ceiling {R_MAX})")
    require(176.0 <= diag <= 186.0, f"diagonal {diag:.2f} outside 176-186")
    require(abs(diag - TARGET_DIAG) < 0.5, f"diagonal {diag:.2f} != target {TARGET_DIAG}")
    require(worst_r <= R_MAX, f"ink escapes the {2*R_MAX:.0f}dp circle: r={worst_r:.2f}")
    require(abs(bcx - 144) < 0.05 and abs(bcy - 144) < 0.05, "not recentred")

    # element invariants (final space)
    wall_t = ARCH_P["wall_thickness"] * k
    require(2.8 <= wall_t <= 3.1, f"wall thickness {wall_t:.2f}dp drifted")
    band = (STAR_P["outer"]["Rp"] - STAR_P["hole"]["Rp"]) * k
    require(3.0 <= band <= 3.5, f"star point-band {band:.2f}dp drifted")
    stem_w = (H_P["stem_out"] - H_P["stem_in"]) * k
    require(9.5 <= stem_w <= 10.5, f"H stem {stem_w:.2f}dp drifted")
    lowest = max(ink2, key=lambda p: p[1])
    require(abs(lowest[0] - 144) < 1.5, f"lowest ink not the centre V tip: {lowest}")
    for s, d in tpaths:
        for c, v in parse_path(d):
            for z in v:
                require(0 <= z <= CANVAS and math.isfinite(z),
                        f"{s}: coord {z} out of canvas")
    # slots and fills must match exactly both ways (a stale/orphaned FILLS
    # entry is the residue of a rename and must not linger silently)
    require({s for s, _ in tpaths} == set(tfills),
            f"slot/fill mismatch: paths-only {({s for s, _ in tpaths}) - set(tfills)}, "
            f"fills-only {set(tfills) - {s for s, _ in tpaths}}")
    print(f"invariants OK: wall {wall_t:.2f}dp, star band {band:.2f}dp, "
          f"H stem {stem_w:.2f}dp, lowest ink ({lowest[0]:.1f},{lowest[1]:.1f})")
    return tpaths, tfills, {"k": k, "diag": diag, "worst_r": worst_r}


# =========================================================================
# Emitters
# =========================================================================
def svg_fill_attrs(slot, fill, defs):
    if fill["type"] == "flat":
        return f'fill="{fill["color"]}"'
    gid = f"g_{slot}"
    stops = []
    for st in fill["stops"]:
        op = f' stop-opacity="{st["opacity"]:g}"' if "opacity" in st else ""
        stops.append(f'    <stop offset="{st["offset"]:g}" stop-color="{st["color"]}"{op}/>')
    defs.append(
        f'  <linearGradient id="{gid}" gradientUnits="userSpaceOnUse" '
        f'x1="{fill["x1"]:.2f}" y1="{fill["y1"]:.2f}" x2="{fill["x2"]:.2f}" y2="{fill["y2"]:.2f}">\n'
        + "\n".join(stops) + "\n  </linearGradient>")
    return f'fill="url(#{gid})"'


def emit_svg(tpaths, tfills, meta):
    defs, body = [], []
    for slot, d in tpaths:
        attrs = svg_fill_attrs(slot, tfills[slot], defs)
        body.append(f'  <path {attrs} d="{d}"/>')
    defs_block = "  <defs>\n" + "\n".join(defs) + "\n  </defs>\n" if defs else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 288" width="288" height="288">\n'
        f'  <!-- Hidden Hiqmah - Android 12+ splash mark. FAITHFUL vectorisation of\n'
        f'       assets/icon-original.png (see gen-splash-mark.py; edit the generator,\n'
        f'       never this file). Transparent background: the black field comes from\n'
        f'       windowSplashScreenBackground. Ink bbox diagonal {meta["diag"]:.1f}dp of the\n'
        f'       288dp canvas (192dp circle guaranteed visible; furthest ink r={meta["worst_r"]:.1f}dp). -->\n'
        + defs_block + "\n".join(body) + "\n</svg>\n")


def vd_color(c, opacity=None):
    a = 255 if opacity is None else max(0, min(255, round(opacity * 255)))
    return f"#{a:02X}{c[1:].upper()}"


def emit_vd(tpaths, tfills):
    out = ['<?xml version="1.0" encoding="utf-8"?>',
           '<vector xmlns:android="http://schemas.android.com/apk/res/android"',
           '    xmlns:aapt="http://schemas.android.com/aapt"',
           '    android:width="288dp"', '    android:height="288dp"',
           '    android:viewportWidth="288"', '    android:viewportHeight="288">',
           '    <!-- Generated by gen-splash-mark.py - edit the generator, not this',
           '         file. To wire it up, copy into res/drawable/ under an Android-',
           '         legal name (e.g. splash_icon.xml - hyphens are illegal in',
           '         resource names) and DELETE the drawable-<dpi>/splash_icon.png',
           '         buckets in the same change: a vector and same-name rasters are',
           '         both valid candidates for one resource (see df3175e). -->']
    for slot, d in tpaths:
        f = tfills[slot]
        if f["type"] == "flat":
            out.append(f'    <path android:pathData="{d}" android:fillColor="{vd_color(f["color"])}"/>')
        else:
            out.append(f'    <path android:pathData="{d}">')
            out.append('        <aapt:attr name="android:fillColor">')
            out.append(f'            <gradient android:type="linear" '
                       f'android:startX="{f["x1"]:.2f}" android:startY="{f["y1"]:.2f}" '
                       f'android:endX="{f["x2"]:.2f}" android:endY="{f["y2"]:.2f}">')
            for st in f["stops"]:
                out.append(f'                <item android:offset="{st["offset"]:g}" '
                           f'android:color="{vd_color(st["color"], st.get("opacity"))}"/>')
            out.append('            </gradient>')
            out.append('        </aapt:attr>')
            out.append('    </path>')
    out.append('</vector>')
    return "\n".join(out) + "\n"


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.normpath(
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets"))
    os.makedirs(out_dir, exist_ok=True)
    tpaths, tfills, meta = generate()
    svg = emit_svg(tpaths, tfills, meta)
    with open(os.path.join(out_dir, "splash-mark.svg"), "w") as fp:
        fp.write(svg)
    vd = emit_vd(tpaths, tfills)
    with open(os.path.join(out_dir, "splash-mark-vd.xml"), "w") as fp:
        fp.write(vd)
    print(f"wrote {out_dir}/splash-mark.svg ({len(svg)} bytes) and "
          f"splash-mark-vd.xml ({len(vd)} bytes)")


if __name__ == "__main__":
    main()
