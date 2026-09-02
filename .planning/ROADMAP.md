# ROADMAP — agentic-graph-orchestration (the product)

Drafted 2026-08-27 (GSD-lite: direct draft over /gsd-map-codebase intel — see
`.planning/codebase/`). Direction: governed / verifiable agent execution.
One line: *agents that cannot pay, ban, delete, or publish without a human closer —
with the linter that proves it.*

## Decisions on record

- 2026-08-27 · Productize the stack (over T&S SaaS, contest clone, or parking) — operator.
- 2026-08-27 · KingPet routes rejected; kingpet-integrity repo = flagship synthetic showcase.
- 2026-08-27 · "Copy is a human action" → deliberate, committed release step (`sync-gates.js`).
- 2026-09-01 · KingPet fork healed: origin's memory sidecar + local graph/demo merged; the
  08-30 "Phase 0 signed authorization" framing did not survive — real-data phases stay parked.
- Open · Product name (repo/group/slug stay `agentic-graph-orchestration` until decided).
- Open · Public vs. private (publishing is irreversible — operator gate; launch essay must
  honor `references/prior-art.md`, including the 2026 academic convergence).

## Phase 1 — midnight-reasoning localization — DONE 2026-09-01 (contract + memory leg)

**Why first:** the flagship's most distinctive claim — *an unverified accusation never
reaches memory* — is currently a labeled SYNTHETIC stand-in. Make the best claim true
before anyone sees the demo. The premise for deferring this is gone: midnight-reasoning
is now local at `~/projects/midnight-reasoning` with `src/policy.ts`, a `promotable()`
gate in `src/graphiti.ts`, a production Graphiti adapter, and AGENTS.md stating the
0.6-floor dual-polarity rule verbatim. This is wiring, not building.

**Goal:** the critic contract is installed code, not a citation from memory.
- Swap the kingpet `verify-briefs` stand-in for the real pass; demo runs green on it.
- Taxonomy decision: add a `critic` closer type to the linter (schema change: `CLOSERS`,
  loop-verifier rule) **or** document that `script` means "deterministic contract,
  whatever sits inside." Decide once, record here, test either way. (Concern #2.)
- **Do not demo-claim past `midnight-reasoning/KNOWN-GAPS.md`** — contradiction
  reconciliation untested, group isolation collapsed in the v1 sidecar, lexical recall
  limits. The demo's claim must be exactly what the gate actually enforces.
**Done when:** kingpet demo runs with the real critic; taxonomy decision + tests landed;
demo copy audited against KNOWN-GAPS.
**Landed:** `memory/` (KingPet `bab0972`…`7642b4e`) ports the contract; demo `remember` runs
it (`ProjectsKingPet` 09-01). Residual: LLM critic verdicts not invoked in the synthetic demo
(by design); taxonomy decision still open → carried to Phase 2 backlog.

## Phase 2 — Positioning & packaging (internal until the IP stream clears launch)

**Goal:** an outside developer understands and runs the product in ten minutes.
- Name decision (operator) + README rewrite, product-first: what it guarantees, the
  30-second demo (lint refuses a model-closed `pay` node), pointer to the flagship.
- Quickstart proven cold: clone → `npm test` → lint an example → watch a gate refuse.
- Positioning claim is the **coupling**, not primacy — see `references/prior-art.md`
  "Shipped implementations." Write-time memory governance ships elsewhere already.
- Visibility decision (public/private) explicitly taken, not defaulted. See
  `.planning/IP-CONSTRAINTS.md`: no public flip / launch essay / name announcement
  before a filing receipt exists. Drafting internally is unblocked; publishing is not.
**Done when:** a stranger-shaped test run (fresh clone, README only) reaches a refused
irreversible edge without help; name recorded here; publication still gated.

## Phase 3 — Second domain example (deploy/release graph)

**Goal:** the pattern reads general, not fraud-only.
- `examples/release-graph.json`: plan → implement → verify → merge (human) →
  deploy (human, inferred irreversible) → canary-verify (script) → announce (human).
- Walkthrough doc; README shows both flagships (enforcement + release).
**Done when:** lints clean, exercises ≥1 inference catch and one retry loop, referenced
from README.

## Phase 4 — Kiel wiring (external dependency: Grok)

**Goal:** gates close from Kiel's "What needs my decision?" queue.
- Install side is DONE (2026-09-02, Kiel `9993c2c`). What remains is the wiring: Kiel reads
  `decision-queue.json` (contract already emitted by the kingpet demo) and closes a node via
  a `closeNode` round-trip against `run-graph.js`.
**Done when:** a gate closed in Kiel closes the node in a live run; `.grok` sentinel green.

## Backlog (tracked in `.planning/codebase/CONCERNS.md` — numbers refer to it)

- **#3 single halted slot** (High — reproduces in the flagship: the critic branch stalls
  behind the unrelated `hold` gate in real halt-at-gate operation).
- **#1 doneWhen is prose** (High — ratchet, don't solve: checkable-evidence contract first).
- **#6 no resume path** after non-gate failures (Medium-High).
- **#4 model closers auto-pass without handlers** — gate behind an explicit simulate flag.
- **#9 human/policy loop verifiers can never fail** — one-line lint tightening + test.
- **#8 empty-set doneWhen** — SKILL.md convention: fail-closed-on-empty unless declared.
- ~~**#7 sync-gates `--prune`**~~ **CLOSED 2026-09-02** (`2be6a90`) — and it was not
  hypothetical: `.planning/IP-CONSTRAINTS.md` had been sitting in two installs since a
  pre-exclusion sync, invisible to copy-only sync. Pruned from both; only canonical holds it.
- **#10 `AGO_CANONICAL` portability** (settle before Phase 4 assumes the sentinel works off
  this machine — Kiel's commit message now documents the env var as the workaround).
- Test-coverage gaps from `.planning/codebase/TESTING.md`: stop ceilings, CLI wrappers,
  argv parsing, bash sentinel script, unreachable `closeNode` branch.
- ~~Phase 4 sharpener (concern #5)~~ **CLOSED 2026-09-02**: Kiel `9993c2c` tracks all 14 gate
  scripts, sentinel included; pushed to `phase-1/recovery`. A fresh Kiel clone now has drift
  protection. (Kiel's GitHub repo has been renamed to `abouchard11/runkiel`; the local remote
  still uses the old URL and redirects.)
