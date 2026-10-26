"""Finds surfaces that would print in mid-air: downward-facing faces steeper than 45 degrees from vertical,
in the orientation the part is printed, ignoring what sits on the plate.

    python lampa/overhang.py            # every part
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
import generate  # noqa: E402
import geom  # noqa: E402

LIMIT_DEG = 45.0   # from vertical; Bambu PLA prints cleanly up to about this without support
BED_TOL = 0.3      # mm: faces this close to the plate rest on it
BRIDGE_MAX = 12.0  # mm: Bambu PLA bridges this cleanly; longer flat ceilings need a look in the slicer
MIN_WALL = 0.8     # mm: two 0.4 mm lines; anything thinner may vanish in the slicer
MIN_AREA = 15.0    # mm2: the 3 mm bayonet pins are horizontal cylinders; their undersides (~4 mm2 each) print fine,
                   # like any small horizontal hole or pin


def unsupported(m):
    """Sloped faces steeper than LIMIT_DEG (true overhangs) and flat ceilings (bridges), off the plate."""
    n = m.face_normals
    down = -n[:, 2]
    z = m.triangles_center[:, 2]
    off_bed = z > m.bounds[0][2] + BED_TOL
    flat = down > 0.999
    steep = (down > np.cos(np.radians(LIMIT_DEG))) & ~flat & off_bed
    bridge = flat & off_bed
    return m.area_faces[steep].sum(), z[steep], m.area_faces[bridge].sum(), m.triangles_center[bridge]


def bridge_span(centers):
    """Rough longest bridge: at each height, the narrowest of the x, y and radial extents of the flat ceiling faces.
    A ring-shaped ledge is as long as it is wide radially; separate small recesses are as long as one recess."""
    if not len(centers):
        return 0.0
    worst = 0.0
    for zc in np.unique(np.round(centers[:, 2], 1)):
        pts = centers[np.abs(centers[:, 2] - zc) < 0.05][:, :2]
        if len(pts) > 2:
            r = np.hypot(pts[:, 0], pts[:, 1])
            worst = max(worst, min(np.ptp(pts[:, 0]), np.ptp(pts[:, 1]), np.ptp(r)))
    return worst


def outside_profile(kind):
    """How far (mm) anything in the base body sticks out of its outer profile; must stay ~0."""
    m = geom.base(kind)
    v = m.vertices
    rv = np.hypot(v[:, 0], v[:, 1])
    out = [rv[i] - geom._outer_r_at(kind, v[i, 2]) for i in np.where(rv > 30)[0]]
    return max(out)


def thinnest_top_wall(kind):
    """Narrowest ring of material around the ring seat, half way down the seat (the rounded outer edge above
    it thins to nothing, as every rounded edge does)."""
    from shapely.geometry import LineString
    S = geom.SPEC
    z = S['base']['height'] - S['ring']['seat_depth'] / 2
    sec, _ = geom.base_section(kind)
    hit = sec.intersection(LineString([(0, z), (200, z)]))
    return min(s.length for s in getattr(hit, 'geoms', [hit]) if s.length > 0)


def needs_bridge_review(m):
    # A flat downward face may bridge or cantilever: normals alone cannot establish support, so long ones get a look
    return bridge_span(unsupported(m)[3]) > BRIDGE_MAX


if __name__ == '__main__':
    worst = 0
    review_bridges = False
    for name, (mesh, flip) in generate.parts(quick=True).items():
        m = generate.place_on_bed(mesh, flip)
        area, zs, barea, bc = unsupported(m)
        worst = max(worst, area)
        span = bridge_span(bc)
        review_bridges |= span > BRIDGE_MAX
        where = f'la z = {zs.min():.1f}..{zs.max():.1f} mm' if len(zs) else ''
        print(f"{'PROBLEMĂ' if area > MIN_AREA else 'ok':8s} {name:20s} surplomb {area:7.1f} mm2 {where:24s} punți {barea:6.1f} mm2, cea mai lungă {span:5.1f} mm")
    bad = False
    for k in ('galet', 'monolit', 'con'):
        o = outside_profile(k)
        bad |= o > 0.05
        print(f"{'PROBLEMĂ' if o > 0.05 else 'ok':8s} soclu-{k:13s} iese din profil {max(o, 0):.2f} mm")
        w = thinnest_top_wall(k)
        bad |= w < MIN_WALL
        print(f"{'PROBLEMĂ' if w < MIN_WALL else 'ok':8s} soclu-{k:13s} cel mai subțire perete lângă inel {w:.2f} mm")
    if worst > MIN_AREA or bad:
        sys.exit(1)
    if review_bridges:
        print(f'DE REVIZUIT: există punți mai lungi de {BRIDGE_MAX:.0f} mm. Verifică ancorarea și punțile în slicer; normalele nu certifică printarea fără suporturi.')
        sys.exit(2)
    sys.exit(0)
