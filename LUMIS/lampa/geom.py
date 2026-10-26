"""LUMIS lamp geometry, in millimetres, z up, z = 0 on the table.

The shade surface functions here are mirrored in js/geometry.js for the website.
tests/geometry.test.mjs checks both agree on samples written by generate.py.
"""
import json
import math
from pathlib import Path

import numpy as np
import trimesh
from shapely.geometry import Polygon, box, LineString
from shapely.ops import unary_union

SPEC = json.loads((Path(__file__).parent / 'spec.json').read_text())


# ---------------------------------------------------------------- shared math
def smooth01(x):
    t = np.clip(x, 0.0, 1.0)
    return t * t * (3 - 2 * t)


def chaikin(pts, it, closed=False, max_cut=None):
    """Corner cutting. With max_cut (mm) every corner is rounded by at most that much, whatever the side length,
    so long flat faces stay flat and the rounding is a fixed, small radius. The cap halves on every pass,
    so the total rounding stays under 2 * max_cut."""
    p = np.asarray(pts, dtype=float)
    for k in range(it):
        a = p if closed else p[:-1]
        b = np.roll(p, -1, axis=0) if closed else p[1:]
        L = np.linalg.norm(b - a, axis=1, keepdims=True)
        f = np.full_like(L, 0.25) if max_cut is None else np.minimum(0.25, max_cut * 0.5 ** k / np.maximum(L, 1e-9))
        mid = np.stack([a + f * (b - a), b - f * (b - a)], 1).reshape(-1, 2)
        p = mid if closed else np.vstack([p[:1], mid, p[-1:]])
    return p


def ribbed_profile(z, pts):
    z = np.asarray(z, dtype=float)
    out = np.ones_like(z)
    for k in range(len(pts) - 1):
        (a0, a1), (b0, b1) = pts[k], pts[k + 1]
        m = (z >= a0) & (z <= b0)
        t = (1 - np.cos(np.pi * (z[m] - a0) / (b0 - a0))) / 2
        out[m] = a1 + (b1 - a1) * t
    return out


def shade_radius(kind, th, zn):
    """Outer radius (mm) at angle th (rad) and normalised height zn in [0, 1] of the visible shade."""
    S = SPEC['shade']
    R = S['radius']
    th = np.asarray(th, dtype=float)
    zn = np.asarray(zn, dtype=float)
    if kind == 'litho':
        return np.full(np.broadcast(th, zn).shape, float(R))
    p = S['shapes'][kind]
    env = smooth01((zn - p['env_in'][0]) / p['env_in'][1]) * smooth01((1 - zn) / p['env_out'])
    if kind == 'wave':
        return R * (1 + p['amplitude'] * env * np.cos(p['lobes'] * (th + math.radians(p['twist_deg']) * zn)))
    if kind == 'twist':
        phi = p['ribs'] * (th + math.radians(p['twist_deg']) * zn)
        tri = 1 - 2 * np.arccos(np.clip(np.cos(phi), -1, 1)) / np.pi
        return R * (1 + p['amplitude'] * env * (0.75 * tri + 0.25 * np.cos(phi)))
    if kind == 'ribbed':
        rib = 0.5 + 0.5 * np.cos(p['ribs'] * th)
        return R * ribbed_profile(zn, p['profile']) * (1 + p['amplitude'] * env * (rib ** 0.6 - 0.5))
    raise ValueError(kind)


def base_profile(kind):
    B = SPEC['base']
    return chaikin(B['profiles'][kind], B['chaikin'], max_cut=B['corner'])


# ---------------------------------------------------------------- mesh helpers
def tube_from_grids(outer, inner):
    """Closed solid between two (nz, nth, 3) vertex grids that wrap around in theta."""
    nz, nth, _ = outer.shape
    V = np.vstack([outer.reshape(-1, 3), inner.reshape(-1, 3)])
    off = nz * nth
    idx = lambda i, j: i * nth + (j % nth)
    F = []
    for i in range(nz - 1):
        j = np.arange(nth)
        a, b, c, d = idx(i, j), idx(i, j + 1), idx(i + 1, j + 1), idx(i + 1, j)
        F += [np.stack([a, b, c], 1), np.stack([a, c, d], 1)]                       # outer, facing out
        F += [np.stack([a + off, c + off, b + off], 1), np.stack([a + off, d + off, c + off], 1)]  # inner, facing in
    j = np.arange(nth)
    for i, flip in ((0, True), (nz - 1, False)):                                   # bottom and top rims
        a, b = idx(i, j), idx(i, j + 1)
        ai, bi = a + off, b + off
        if flip:
            F += [np.stack([a, ai, bi], 1), np.stack([a, bi, b], 1)]
        else:
            F += [np.stack([a, bi, ai], 1), np.stack([a, b, bi], 1)]
    m = trimesh.Trimesh(V, np.vstack(F), process=True)
    m.fix_normals()
    return m


def revolve(section, sections=256):
    """Revolve a shapely polygon given in (r, z) around the z axis."""
    pts = np.asarray(section.exterior.coords)[:-1]
    if Polygon(pts).exterior.is_ccw:
        pts = pts[::-1]
    m = trimesh.creation.revolve(np.vstack([pts, pts[:1]]), sections=sections)
    m.fix_normals()
    return m


def at_angle(mesh, deg):
    return mesh.copy().apply_transform(trimesh.transformations.rotation_matrix(math.radians(deg), [0, 0, 1]))


def union(*ms):
    return trimesh.boolean.union(list(ms), engine='manifold')


def difference(a, *bs):
    return trimesh.boolean.difference([a, *bs], engine='manifold')


def radial_box(r0, r1, z0, z1, width, deg):
    """Box spanning radius r0..r1 along +x, then rotated to angle deg."""
    b = trimesh.creation.box(extents=[r1 - r0, width, z1 - z0])
    b.apply_translation([(r0 + r1) / 2, 0, (z0 + z1) / 2])
    return at_angle(b, deg)


# ---------------------------------------------------------------- shade
def shade_body(kind, nth=720, nz=240, thickness=None):
    """Visible shade from z0 to z0 + height. thickness(th, zn) overrides the constant wall (lithophane)."""
    S = SPEC['shade']
    th = np.linspace(0, 2 * np.pi, nth, endpoint=False)
    zn = np.linspace(0, 1, nz)
    ZN, TH = np.meshgrid(zn, th, indexing='ij')
    R = shade_radius(kind, TH, ZN)
    T = thickness(TH, ZN) if thickness else np.full_like(R, S['wall'])
    Z = S['z0'] + ZN * S['height']
    # the body starts 0.6 mm below z0 so it fuses with the collar
    Z = np.where(ZN == 0, Z - 0.6, Z)
    outer = np.stack([R * np.cos(TH), R * np.sin(TH), Z], -1)
    inner = np.stack([(R - T) * np.cos(TH), (R - T) * np.sin(TH), Z], -1)
    return tube_from_grids(outer, inner)


def collar():
    """Hidden bottom ring of every shade, with J-slots for the twist lock."""
    S, C = SPEC['shade'], SPEC['shade']['collar']
    R, z1 = S['radius'], S['z0']
    z0 = z1 - C['height']
    ring = revolve(box(R - C['wall'], z0, R, z1 + 0.6))
    cuts = []
    w, dz = C['slot_width'], C['slot_depth']
    for k in range(C['slots']):
        a = k * 360 / C['slots']
        cuts.append(radial_box(R - C['wall'] - 1, R + 1, z0 - 1, z0 + dz, w, a))        # vertical entry from the bottom
        # horizontal leg: a run of short boxes along the arc, at the top of the entry
        steps = 8
        for s in range(steps + 1):
            cuts.append(radial_box(R - C['wall'] - 1, R + 1, z0 + dz - w, z0 + dz, w, a + C['slot_turn_deg'] * s / steps))
    return difference(ring, union(*cuts))


def shade(kind, **kw):
    return union(shade_body(kind, **kw), collar())


# ---------------------------------------------------------------- base
# The base is printed upright. Its body starts on top of a recessed plinth (the bottom plate), so it seems
# to float on a line of shadow; the cable leaves through that shadow line at the back.
def _inner_r_at(poly, z):
    hit = poly.intersection(LineString([(0, z), (200, z)]))
    return max(x for x, _ in np.asarray(hit.coords)) if not hit.is_empty else 0.0


def _outer_r_at(kind, z):
    hit = Polygon(base_profile(kind)).intersection(LineString([(0, z), (200, z)]))
    return hit.bounds[2] if not hit.is_empty else 0.0


def body_bottom_r(kind):
    """Outer radius of the body where it meets the plinth (same rule as js/geometry.js)."""
    z0 = SPEC['plinth']['height']
    return max(r for r, z in base_profile(kind) if z <= z0 + 1e-6)


def plinth_r(kind):
    return body_bottom_r(kind) - SPEC['plinth']['inset']


def flange_r(kind):
    """Inner edge of the flat ring at the bottom of the body that rests on the plinth."""
    return body_bottom_r(kind) - SPEC['interior']['flange']


def screw_r(kind):
    return body_bottom_r(kind) - SPEC['interior']['screw_from_edge']


def base_section(kind):
    B, So, Ri, I = SPEC['base'], SPEC['socket'], SPEC['ring'], SPEC['interior']
    H, wall, z0 = B['height'], B['wall'], SPEC['plinth']['height']
    outer = Polygon(base_profile(kind))
    inner = outer.buffer(-wall, join_style='round')
    r_sock = SPEC['shade']['radius'] + So['clearance']
    r_sock_out = r_sock + So['wall']
    z_sock = H - So['depth']
    # ceiling inside the body: a 45 degree cone from the bottom of the socket wall out to the side wall,
    # so nothing is printed in mid-air
    k = math.tan(math.radians(I['ceiling_deg']))
    # the cone starts at the socket bore, so the socket wall ends in a 45 degree chamfer instead of a ledge
    z_cone = z_sock + 0.05  # overlaps the bore so no skin is left across it
    r_end = r_sock + (z_cone - (z0 - 1)) / k
    below_cone = Polygon([(0, z0 - 1), (0, z_cone), (r_sock, z_cone), (r_end, z0 - 1)])
    hollow = inner.intersection(below_cone)
    hollow = unary_union([hollow, box(0, z0 - 1, flange_r(kind), z0 + wall + 0.1)])  # opening inside the flange
    shell = outer.difference(hollow)
    shell = shell.difference(box(0, z_sock, r_sock, H + 1))                                    # socket for the shade
    # ring seat + shadow reveal; the seat opens straight into the socket bore, so no thin lip is left between them
    shell = shell.difference(box(r_sock - 0.05, H - Ri['seat_depth'], Ri['r_out'] + Ri['reveal'], H + 1))
    if shell.geom_type != 'Polygon':
        shell = max(shell.geoms, key=lambda g: g.area)
    return shell, inner


def boss_positions(kind):
    """Screw bosses: angle, and radius of the screw axis."""
    return [(60 + k * 360 / SPEC['bottom']['screws'], screw_r(kind)) for k in range(SPEC['bottom']['screws'])]


def base(kind):
    So, Ce, I = SPEC['socket'], SPEC['cable_exit'], SPEC['interior']
    C = SPEC['shade']['collar']
    z0 = SPEC['plinth']['height']
    section, inner = base_section(kind)
    m = revolve(section)
    r_sock = SPEC['shade']['radius'] + So['clearance']
    z_pin = SPEC['shade']['z0'] - C['height'] + C['slot_depth'] - C['slot_width'] / 2
    pins = []
    for k in range(C['slots']):
        p = trimesh.creation.cylinder(radius=So['pin_diameter'] / 2, height=So['pin_length'] + 1.0, sections=32)
        p.apply_transform(trimesh.transformations.rotation_matrix(math.pi / 2, [0, 1, 0]))
        p.apply_translation([r_sock - So['pin_length'] / 2 + 0.5, 0, z_pin])
        pins.append(at_angle(p, k * 360 / C['slots'] + C['slot_turn_deg']))
    # screw bosses rise from the plate side and lean with the wall; the top tapers at 45 degrees into the wall
    bosses, holes = [], []
    w, h = I['boss_width'], I['boss_height']
    wall = SPEC['base']['wall']
    for ang, r_axis in boss_positions(kind):
        # the boss stands on the flange, reaches 3.2 mm inside the screw axis and leans out with the wall;
        # above h its inner face steps back at 45 degrees into the wall
        r_face = r_axis - 3.2
        pts = []
        for z in np.linspace(z0, z0 + h + 14, 15):
            # merge 1.5 mm into the wall, but keep at least 0.8 mm of wall outside it, also where the wall flares
            r_wall = min(_inner_r_at(inner, max(z, z0 + wall + 0.05)) + 1.5, _outer_r_at(kind, z) - 0.8)
            inner_r = r_face if z <= z0 + h else min(r_wall - 0.4, r_face + (z - z0 - h))
            if inner_r >= r_wall - 0.4 and z > z0 + h:
                pts += [[r_wall, -w / 2, z], [r_wall, w / 2, z], [r_wall - 0.4, -w / 2, z], [r_wall - 0.4, w / 2, z]]
                break
            for y in (-w / 2, w / 2):
                pts += [[r_wall, y, z], [inner_r, y, z]]
        bosses.append(at_angle(trimesh.convex.convex_hull(np.array(pts)), ang))
        hole = trimesh.creation.cylinder(radius=I['pilot_hole'] / 2, height=2 * (h - 1), sections=24)
        hole.apply_translation([r_axis, 0, z0])
        holes.append(at_angle(hole, ang))
    m = union(m, *pins, *bosses)
    return difference(m, union(*holes))


def bottom_plate(kind):
    """Recessed plinth + lid: carries the LED post, the weight tray and the diffuser."""
    Bt, L, Ce, I, Pl = SPEC['bottom'], SPEC['led'], SPEC['cable_exit'], SPEC['interior'], SPEC['plinth']
    _, inner = base_section(kind)
    t = Pl['height']
    Rp = plinth_r(kind)
    r_open = flange_r(kind)
    plate = trimesh.creation.cylinder(radius=Rp, height=t, sections=192)
    plate.apply_translation([0, 0, t / 2])
    # centering lip that enters the body, cut away where the bosses are
    lip = revolve(box(r_open - Bt['clearance'] - I['lip_wall'], t - 0.1, r_open - Bt['clearance'], t + I['lip_height']), 192)
    lip_cuts = [radial_box(r_open - 15, r_open + 2, t - 0.5, t + I['lip_height'] + 1, I['boss_width'] + 2, ang) for ang, _ in boss_positions(kind)]
    lip = difference(lip, union(*lip_cuts))
    r_post = L['post_od'] / 2
    post = revolve(box(r_post - L['post_wall'], t - 0.1, r_post, L['post_top']), 128)
    tray_out = min(r_open - 3, 46)
    tray = revolve(box(Bt['tray_inner_r'], t - 0.1, Bt['tray_inner_r'] + Bt['tray_wall'], t + Bt['tray_height']), 128)
    tray_o = revolve(box(tray_out - Bt['tray_wall'], t - 0.1, tray_out, t + Bt['tray_height']), 128)
    solid = union(plate, lip, post, tray, tray_o)
    # cable: an open slot from the foot of the LED post straight to the back edge, through the whole plate, so the
    # cable is laid in from above and nothing (USB plug, inline switch) has to be threaded through a hole.
    # Where it crosses the weight tray it runs between two walls, so the steel shot stays in the tray.
    a, w = Ce['angle_deg'], L['cable_d'] + 0.6
    tw = Bt['tray_wall']
    walls = [radial_box(Bt['tray_inner_r'], tray_out, t - 0.1, t + Bt['tray_height'], tw, 0) for _ in (0, 1)]
    for k, sgn in enumerate((-1, 1)):
        walls[k].apply_translation([0, sgn * (w / 2 + tw / 2), 0])
    solid = union(solid, *[at_angle(m, a) for m in walls])
    cuts = [radial_box(r_post, Rp + 2, -1, t + Bt['tray_height'] + 1, w, a)]
    rd = L['diffuser_od'] / 2
    cuts.append(revolve(box(rd - L['diffuser_wall'] - 0.2, t - 1, rd + 0.2, t + 0.5), 128))
    for ang, r_axis in boss_positions(kind):
        h = trimesh.creation.cylinder(radius=1.7, height=t * 3, sections=24)
        cb = trimesh.creation.cylinder(radius=I['counterbore_r'], height=2 * I['counterbore_depth'], sections=32)  # for an M3 pan head
        hh = union(h, cb)
        hh.apply_translation([r_axis, 0, 0])
        cuts.append(at_angle(hh, ang))
    for k in range(4):
        f = trimesh.creation.cylinder(radius=Bt['felt_diameter'] / 2 + 0.2, height=Bt['felt_depth'] * 2, sections=32)
        f.apply_translation([Rp - 9, 0, 0])
        cuts.append(at_angle(f, 45 + 90 * k))
    return difference(solid, union(*cuts))


def diffuser():
    L, t = SPEC['led'], SPEC['bottom']['thickness']
    rd = L['diffuser_od'] / 2
    wall = revolve(box(rd - L['diffuser_wall'], t - 0.8, rd, L['diffuser_top']), 160)
    top = trimesh.creation.cylinder(radius=rd, height=L['diffuser_wall'], sections=160)
    top.apply_translation([0, 0, L['diffuser_top'] - L['diffuser_wall'] / 2])
    # notch over the cable, where it leaves the post; turn the diffuser so the notch sits on the cable
    notch = radial_box(rd - L['diffuser_wall'] - 1, rd + 1, t - 2, t + 5, L['cable_d'] + 2, SPEC['cable_exit']['angle_deg'])
    return difference(union(wall, top), notch)


def ring():
    R, H = SPEC['ring'], SPEC['base']['height']
    sec = Polygon(chaikin([[R['r_in'], 0], [R['r_out'], 0], [R['r_out'], R['height'] + R['seat_depth']], [R['r_in'], R['height'] + R['seat_depth']]], 2, closed=True))
    m = revolve(sec, 256)
    m.apply_translation([0, 0, H - R['seat_depth']])
    return m
