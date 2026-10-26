---
name: lumis-token-efficiency
description: "Reduce unnecessary context and repeated work in LUMIS tasks. Use when asked to save tokens, shorten agent workflows, avoid rereading large files, or resume work efficiently. Preserve required verification and complete the requested deliverable."
---

# LUMIS token efficiency

Use a task-sized workflow. Saving tokens means avoiding unnecessary input, output and repeated operations; it does not mean leaving the requested work unfinished. This skill cannot change the model's billing rules or guarantee a percentage saving.

## Read selectively
- Start from the concrete task, current branch and relevant diff. Use `rg --files` and targeted `rg -n` searches before reading files.
- Read only matching functions and the surrounding code needed to understand dependencies. Expand when the evidence requires it; do not guess from an isolated match.
- Treat archives, historical handoffs, generated standalone HTML, vendor code, STL/3MF, image data and lockfiles as opt-in. Prefer editable source. Inspect a generated asset only when it is the subject of the task or source checks cannot resolve the issue.
- Load only the skill instructions needed now. A skill inventory is not a request to read all 30+ skills. Do not repeatedly load unchanged guidance already present in the session.

## Keep tool output useful
- Bound output length and target paths. On a large log, save the complete output to a local file and return the relevant error plus enough context to diagnose it.
- Never print base64 images, entire bundles or full datasets into chat. Use local artifacts, compact tables and small representative samples.
- Batch independent searches or reads; keep dependent edits and checks sequential. Avoid expensive parallel work that duplicates context or competes for the same resources.
- Use a small script for repetitive extraction/calculation when this replaces many calls. Do not build a new framework for a one-off edit.

## Avoid rework
- Make the smallest coherent change and keep one authoritative source. Regenerate affected deliverables once the source is stable.
- Run checks appropriate to the affected behaviour and required repository rules. Broaden when a failure or dependency warrants it; do not rerun a passing unchanged suite without a reason.
- Never skip photo-privacy regressions, geometry dependencies or physical-validation caveats to meet a token target.
- Do not introduce subagents by default. Use them only when authorised and an independent task justifies the extra context and review overhead.

## Communicate and resume
- Keep progress updates brief: finding, next action, material uncertainty. Avoid repeating the plan or unchanged findings.
- Return the outcome, deliverable/link, verification and limitations. Scale explanation to the user's request; preserve necessary technical evidence.
- Before a session handoff, save a short task-specific note with current commit, modified files, decisions, checks/results and remaining work. Do not copy the full conversation or create a new note on every trivial edit.
- When resuming, verify the note against current Git state and continue from the unresolved step.

## Honest measurement
If the client exposes usage, compare input/output/cache usage for equivalent tasks and completion criteria. Otherwise say savings were not measured. Shorter answers alone do not prove lower total usage. Choose a cheaper model only if the user requests it and the client supports the choice; do not claim this skill switches models or activates prompt caching.
