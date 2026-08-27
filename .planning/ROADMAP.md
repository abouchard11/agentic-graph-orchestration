# ROADMAP — agentic-graph-orchestration (the product)

Drafted 2026-08-27 (GSD-lite: direct draft over /gsd-map-codebase intel — see
`.planning/codebase/`). Direction: governed / verifiable agent execution.
One line: *agents that cannot pay, ban, delete, or publish without a human closer —
with the linter that proves it.*

## Decisions on record

- 2026-08-27 · Productize the stack (over T&S SaaS, contest clone, or parking) — operator.
- 2026-08-27 · KingPet routes rejected; kingpet-integrity repo = flagship synthetic showcase.
- 2026-08-27 · "Copy is a human action" → deliberate, committed release step (`sync-gates.js`).
- Open · Product name (repo/group/slug stay `agentic-graph-orchestration` until decided).
- Open · Public vs. private (publishing is irreversible — operator gate; launch essay must
  honor `references/prior-art.md`, including the 2026 academic convergence).

## Phase 1 — Positioning & packaging

**Goal:** an outside developer understands and runs the product in ten minutes.
- Name decision (operator) + README rewrite, product-first: what it guarantees, the
  30-second demo (lint refuses a model-closed `pay` node), pointer to the flagship.
- Quickstart proven cold: clone → `npm test` → lint an example → watch a gate refuse.
- Visibility decision (public/private) explicitly taken, not defaulted.
**Done when:** a stranger-shaped test run (fresh clone, README only) reaches a refused
irreversible edge without help; name + visibility recorded here.

## Phase 2 — midnight-reasoning localization

**Goal:** the critic contract is installed code, not memory.
- Locate/clone midnight-reasoning; install next to the stack; swap the kingpet
  `verify-briefs` SYNTHETIC stand-in for the real pass (0.6 floor, dual polarity).
- Taxonomy decision: add a `critic` closer type to the linter (schema change: `CLOSERS`,
  loop-verifier rule) **or** document that `script` means "deterministic contract,
  whatever sits inside." Decide once, record here, test either way.
**Done when:** kingpet demo runs with the real critic; taxonomy decision + tests landed.

## Phase 3 — Second domain example (deploy/release graph)

**Goal:** the pattern reads general, not fraud-only.
- `examples/release-graph.json`: plan → implement → verify → merge (human) →
  deploy (human, inferred irreversible) → canary-verify (script) → announce (human).
- Walkthrough doc; README shows both flagships (enforcement + release).
**Done when:** lints clean, exercises ≥1 inference catch and one retry loop, referenced
from README.

## Phase 4 — Kiel wiring (external dependency: Grok)

**Goal:** gates close from Kiel's "What needs my decision?" queue.
- One coordination conversation covers: Kiel reading `decision-queue.json` (contract
  already emitted by the kingpet demo), a closeNode round-trip, and syncing the
  git-tracked, currently-DRIFTED `.grok` install via `sync-gates.js`.
**Done when:** a gate closed in Kiel closes the node in a live run; `.grok` sentinel green.

## Backlog (tracked in `.planning/codebase/CONCERNS.md` — numbers refer to it)

- **#3 single halted slot** (High — reproduces in the flagship: the critic branch stalls
  behind the unrelated `hold` gate in real halt-at-gate operation).
- **#1 doneWhen is prose** (High — ratchet, don't solve: checkable-evidence contract first).
- **#6 no resume path** after non-gate failures (Medium-High).
- **#4 model closers auto-pass without handlers** — gate behind an explicit simulate flag.
- **#9 human/policy loop verifiers can never fail** — one-line lint tightening + test.
- **#8 empty-set doneWhen** — SKILL.md convention: fail-closed-on-empty unless declared.
- **#7 sync-gates `--prune`** (opt-in) · **#10 `AGO_CANONICAL` portability** (settle before
  Phase 4 assumes the sentinel works off this machine).
- Test-coverage gaps from `.planning/codebase/TESTING.md`: stop ceilings, CLI wrappers,
  argv parsing, bash sentinel script, unreachable `closeNode` branch.
- Phase 4 sharpener (concern #5): Kiel's `.grok` install tracks only 5 of 12 gate scripts —
  a fresh Kiel clone has no drift protection; the coordination PR must land the sentinel
  files themselves, not just the sync.
