---
name: lumis-quality-review
description: "Independently review LUMIS website or marketing changes before completion: mobile layout, configurator, uploaded-photo privacy, links, motion, image fidelity and truthful claims. Use for PR reviews, release checks and improvement audits."
---

# LUMIS quality review
Read the diff and current project guidance. Review against user intent and current source; do not redesign unrelated areas.

For UI changes run the appropriate existing Node and browser tests from `LUMIS/`. Inspect desktop and mobile screenshots, horizontal overflow, keyboard focus and error messages. Exercise the changed path rather than repeating every test without reason.

For configurator lifecycle changes verify delayed photo decode after close, rapid model/hash changes, delayed 3D import, context disposal and reopening. Customer photos stay local in memory while the sheet is open; do not add uploads, storage, filenames in the cart, telemetry or third-party tracking.

The automatic tour was removed at the owner's request (2026-10-26); do not reintroduce it unless asked. Preserve reduced-motion behaviour, the mouse-wheel inertia and normal keyboard/trackpad use. Assess actual rendered motion, not just the existence of CSS smooth scrolling.

Check visual products against their CAD geometry; day/night alignment and physical claims need evidence. Review generated content as illustrative. Reject invented prices, stock, reviews, delivery promises, certifications and fake checkout. Draft legal copy remains a draft.

For market research include source URL, retrieval date, geography, currency, tax/shipping treatment, observations and uncertainty. Never infer competitor sales from a listing or label synthetic personas as interview findings. Adapt SaaS marketing methods to physical lamps.

Output findings by severity with file:line and a reproducible trigger. Separate checked, not checked and external/physical dependencies. If there are no findings say which scope passed; do not imply comprehensive certification.
