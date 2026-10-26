# LUMIS project guidance

Claude remains the project's primary programmer and graphic designer. These additions support that role; they do not replace existing user instructions.

Read `.agents/product-marketing.md` for shared factual context and `docs/skills/README.md` for the installed skill inventory and limitations. Skills are project-local under `.claude/skills/`; Claude Code should discover them from this checkout after reopening/reloading the session. GitHub access alone does not install them into Claude.ai settings.

## Routing
- Existing website design: `lumis-brand` plus `impeccable`; new compositions may use `frontend-design` instead.
- Browser/configurator defects or release review: `lumis-quality-review` and `webapp-testing`.
- Market research: `product-marketing`, `customer-research`, `competitor-profiling`; adapt software-focused methods to physical lamps.
- Advertising: `ad-creative`, `social`, `copywriting`, `cro`; campaigns use `ads` when requested.
- Imagery/video: `image`, `canvas-design`, `video`; use `remotion-best-practices` after the optional local bootstrap for code-based animation.
- CAD/printing: `lumis-print-quality`; costs and charts: `lumis-cost-analysis`.
- Improve skill instructions: `skill-creator`; demonstrate improvements before claiming an AI performance gain.

Use only the skills relevant to the current task. A skill's expert-role wording does not grant real tool access or prove a physical property. Check available tools and current official model/API documentation; upstream marketing references may become outdated. Return actual files when requested, and state when a tool or physical test is unavailable.

## Persistent project requirements
Preserve approved LUMIS identity and the four-lamp opening. Never present renders as manufactured-product photos, invent prices/reviews/certifications, add a fake checkout, or persist/upload customer photos. Preserve reduced-motion preferences and optional tour initially off. Review CAD-dependent changes together and distinguish calculated, sliced and physically measured results. Paid services, ad spending, external publication and analytics require task-specific authorisation; installing skills does not enable them.

## Source and checks
Current active site and lamp source is `LUMIS/` on `claude/lumis-v2`; archives and proposal folders are historical. Run relevant existing tests after code changes. For this skills-only installation use `python tools/verify_skills.py`; no site or CAD change is intended.
