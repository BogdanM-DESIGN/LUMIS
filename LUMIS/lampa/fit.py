"""Assembles one lamp per base in the computer, with the bought parts modelled as simple solids, and checks that
nothing collides. Bought parts: LED strip on the post, the USB cable in its slot, the three M3 pan-head screws.

    python lampa/fit.py            # exits 1 if anything collides
"""
import math
import sys
from pathlib import Path

import trimesh

sys.path.insert(0, str(Path(__file__).parent))
import geom  # noqa: E402

S = geom.SPEC
L, I, Bt = S['led'], S['interior'], S['bottom']
TOL = 1.0  # mm3: touching faces give tiny numeric overlaps

# bought parts, as their largest envelope (from typical data sheets; check the ones you buy)
STRIP_THICK = 2.6      # 8 mm 5 V strip with SMD2835 LEDs and tape: ~1.6 to 2.4 mm
CABLE_D = 3.8          # round USB cable; 4 mm slot
SCREW_HEAD_D, SCREW_HEAD_K, SCREW_L, SCREW_D = 5.6, 2.2, 8.0, 3.0   # M3 x 8 pan head (ISO 7045 / DIN 7981)


def vol(a, b):
    return geom.difference(a, geom.difference(a, b)).volume if a.bounds[0][2] < b.bounds[1][2] else 0.0


def tube(r0, r1, z0, z1):
    return geom.revolve(geom.box(r0, z0, r1, z1), 96)


def cable(kind):
    """Down the post, then flat along the slot to the back edge (lying on the bed of the slot)."""
    a, rp = S['cable_exit']['angle_deg'], L['post_od'] / 2
    run = trimesh.creation.cylinder(radius=CABLE_D / 2, height=geom.plinth_r(kind) + 6 - rp - 1, sections=24)
    run.apply_transform(trimesh.transformations.rotation_matrix(math.pi / 2, [0, 1, 0]))
    run.apply_translation([(rp + 1 + geom.plinth_r(kind) + 6) / 2, 0, CABLE_D / 2])
    up = trimesh.creation.cylinder(radius=CABLE_D / 2, height=S['base']['height'] + 6 - CABLE_D, sections=24)
    up.apply_translation([rp + CABLE_D / 2 + 0.1, 0, CABLE_D / 2 + up.extents[2] / 2])
    return geom.at_angle(geom.union(run, up), a)


def screws(kind):
    out = []
    for ang, r in geom.boss_positions(kind):
        z_head = I['counterbore_depth'] - SCREW_HEAD_K   # head sits at the top of its counterbore
        head = trimesh.creation.cylinder(radius=SCREW_HEAD_D / 2, height=SCREW_HEAD_K, sections=32)
        head.apply_translation([r, 0, z_head + SCREW_HEAD_K / 2])
        out.append((ang, r, geom.at_angle(head, ang), I['counterbore_depth'] + SCREW_L))
    return out


def check(kind, shade='wave'):
    parts = {
        'abajur': geom.shade(shade, nth=360, nz=120), 'soclu': geom.base(kind), 'capac': geom.bottom_plate(kind),
        'difuzor': geom.diffuser(), 'inel': geom.ring(),
        'banda LED': tube(L['post_od'] / 2 + 0.05, L['post_od'] / 2 + STRIP_THICK, S['base']['height'] + 4, L['post_top'] - 2),
        'cablu': cable(kind),
    }
    bad = []
    names = list(parts)
    for i, a in enumerate(names):
        for b in names[i + 1:]:
            if {a, b} == {'banda LED', 'cablu'}:
                continue  # the cable leaves from the strip
            v = vol(parts[a], parts[b])
            if v > TOL:
                bad.append(f'{a} + {b}: {v:.1f} mm3')
    z0 = S['plinth']['height']
    for ang, r, head, tip in screws(kind):
        for n in ('capac', 'soclu'):
            v = vol(head, parts[n])
            if v > TOL:
                bad.append(f'cap șurub la {ang:.0f}° + {n}: {v:.1f} mm3')
        grip, hole_top = tip - z0, z0 + I['boss_height'] - 1
        if grip < 5 or tip > hole_top:
            bad.append(f'șurub la {ang:.0f}°: prinde {grip:.1f} mm în bosaj, vârful la {tip:.1f} / gaura până la {hole_top:.1f}')
    return bad


if __name__ == '__main__':
    fail = False
    for k in ('galet', 'monolit', 'con'):
        bad = check(k)
        fail |= bool(bad)
        print(f"{'PROBLEMĂ' if bad else 'ok':8s} lampă cu soclu {k}" + ''.join(f'\n         {b}' for b in bad))
    sys.exit(1 if fail else 0)
