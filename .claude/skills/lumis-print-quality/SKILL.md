---
name: lumis-print-quality
description: "Review and improve LUMIS printable lamp CAD, STL/3MF, wall thickness, joints, tolerances, slicing, supports, LED diffusion, heat and print quality. Use for prototype defects or production changes; distinguish calculations from physical tests."
---

# LUMIS print quality
Read the current `LUMIS/lampa/spec.json`, `geom.py`, `generate.py`, `fit.py`, `overhang.py`, `GHID-PRINT.md` and associated tests. Use the current branch's source as authority, not archived packages or old proposed dimensions.

## Workflow
1. Record the defect, exact component/version, printer, nozzle, layer height, filament and slicer settings if known. Continue analysis with known inputs and label unknowns.
2. Reproduce the issue numerically or on a supplied specimen/photo. Cite file and line for code findings. Classify each claim as calculated, sliced, measured on a prototype, or unverified.
3. Propose the smallest coherent geometry change. Trace dependent seats, clearances, rings, lids and the website geometry. Do not change a single radius without checking its mating components.
4. Run applicable existing geometry, fit and regression checks. Inspect closed solids, winding, components and relevant cross-sections, not just nominal parameters. Sample thin walls throughout the affected region; one section cannot prove a global minimum. Nozzle diameter alone does not guarantee strength.
5. Inspect the intended print orientation and slicer preview when a slicer is available. Describe bridge endpoints, support and actual unsupported span. Triangle-centroid bounding boxes are not a reliable bridge-length measurement: a 25 mm radial cantilever was reported as 8.33 mm by the current heuristic. An automated pass cannot certify support-free printing.
6. Regenerate affected deliverables and dimension reports together when implementing a change; distinguish generated files from an optional candidate. Verify the viewer still matches the geometry parameters.
7. Define a minimal physical test and record outcomes before recommending production.

## Prototype checklist
- Print joint/tolerance coupons before a complete lamp; verify insertion, rotation, retention and removal.
- Inspect shell finish, seam, ring seat, lid screws, stability and cable strain relief.
- Check LED spots at the actual strip/diffuser spacing. The approximately 1.4 mm clearance is an unresolved optical risk, not proof of failure.
- Measure ambient, strip, support and nearby PLA temperatures over time until stable under stated conditions. Compare with the actual component/material limits; do not promise a cold lamp or imply certification.
- Record filament mass, machine time, rejects and assembly time using actual measurements.

Return a severity table, evidence, concrete code/parameter proposal, regenerated-file list if applicable, checks run, and remaining physical tests. Never describe an unprinted part as validated for manufacture.
