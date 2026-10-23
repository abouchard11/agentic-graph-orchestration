<!-- refreshed: 2026-08-27 -->
# Architecture

**Analysis Date:** 2026-08-27

## System Overview

No server, no runtime process. A JSON work-topology spec must pass a static gate before it
may run; a runtime schedules it; an integrity layer keeps installed gate copies honest.

```
┌─────────────────────────────────────────────────────────────┐
│  Graph JSON — `examples/*.json`, `companions/gbrain/examples/*.json` │
│  name · goal · stop{} · nodes[] · loops[]                     │
└────────────────────────┬──────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  STATIC GATE `scripts/lint-graph.js` (lintGraph)               │
│  irreversibility inference · ownership · verifier · loop rules │
└────────────────────────┬──────────────────────────────────────┘
                          │ zero errors required
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  RUNTIME `scripts/run-graph.js` (startRun/tick/closeNode)      │
│  imports the linter's `inferredIrreversibleId` — one inference │
└────────────────────────┬──────────────────────────────────────┘
                          │ also gates installed copies of itself, via
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  INTEGRITY `scripts/check-sentinel.js` — sha256, fail-closed   │
└────────────────────────┬──────────────────────────────────────┘
                          │ repaired only by, never automatically
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  RELEASE `scripts/sync-gates.js` — deliberate, committed        │
└─────────────────────────────────────────────────────────────┘
```

## Conceptual Model: the Graph as a JSON Work Topology

Graph: `name`, `goal` (sentence ≥12 chars), `stop{maxWallMinutes|maxUsd|noProgressSteps}`
(≥1 set), non-empty `nodes[]`, optional `loops[]`.

**Node:** `id` (prose, e.g. `"accept"`, `"release-payout"`) · `dependsOn` (ids that must be
`passed` first) · `owns` (file paths/labels this node may mutate — two unordered nodes with
overlapping `owns` fail lint via `surfaceOverlap()`, `lint-graph.js:55-70`) · `closer` (see
below) · `doneWhen` (verifier sentence, ≥8 chars) · `irreversible` (optional explicit bool,
compounds with id-based inference) · `verifies` (optional — ids this node independently
checks; must depend on every target, never verify itself, never own a target's surface).

**Loop** (`graph.loops[]`): `id`, `nodes[]` (must exist), `maxAttempts` (positive int),
`restarts[]` (optional — must stay inside that loop's own `nodes[]`; an inner loop cannot
restart an outer node). Every loop needs at least one non-`model` node whose `verifies[]`
targets a node in the same loop, or lint rejects it as self-certifying.

## The Four Closer Types

| Closer | Who closes it | Runtime behavior |
|---|---|---|
| `model` | The agent, by producing output | Runs inline in `tick()`. Forbidden on any irreversible node — lint rejects statically; `run-graph.js` throws defensively if one reaches `tick()` anyway. |
| `human` | A person, via `closeNode(run, id, {closer:"human"})` | `tick()` sets status `"gate"`, records `run.halted`, returns — nothing else advances until closed. |
| `policy` | A codified non-model rule (escrow funded, banned-vertical check) | Same halt as `human`; only who may call `closeNode` differs. |
| `script` | A handler function passed to `tick(run, {handlers})` | Runs inline. No handler → fails closed: `{ ok: false, evidence: "no script handler. Fail-closed." }` (`run-graph.js:142-144`). |

Only `human`/`policy` halt the run. `closeNode()` enforces: node must be `"gate"`, supplied
`closer` must equal `node.closer` exactly, and `closer === "model"` is rejected outright
even if forced (`run-graph.js:190-195`).

## Enforcement Chain

**1. `lint-graph.js` — static gate.** Pure `lintGraph(graph) -> string[]`. Structural
checks (ids, `dependsOn`/`owns` shape, `doneWhen` length, `closer` enum, cycles,
reachability) plus the load-bearing rule: `inferredIrreversibleId(id)` (lines 49-53)
matches a flat `IRREVERSIBLE_IDS` set (`accept, post, pay, publish, transfer, delete,
merge, safety, deploy, remember, forget, persist, ban, enforce, clawback, revoke,
disqualify`) **or** an `IRREVERSIBLE_ID_PATTERNS` regex catching verb+object compounds a
flat list would miss — `release-payout`, `place-order`, `send-email`, `approve-transfer`,
`store-memory`, `suspend-account`, etc. (lines 33-45). Bare `hold`/`suspend`/`freeze` are
deliberately excluded — a hold is the designed-reversible action these graphs rely on; only
their consequential compounds are inferred. A forced-irreversible node (declared or
inferred) with `closer: "model"` is a hard error. Exports `IRREVERSIBLE_IDS`,
`IRREVERSIBLE_ID_PATTERNS`, `inferredIrreversibleId`, `surfaceOverlap` — exactly what the
runtime imports.

**2. `run-graph.js` — runtime.** `isIrreversible(node)` = `node.irreversible === true ||
inferredIrreversibleId(node.id)`, built on the linter's exported function — **one
inference, by design** (`CLAUDE.md` invariant #2). `startRun()` calls `lintGraph()` first
and throws on any error, so a failing graph can never start. `tick()`: check stop
conditions (wall time / spend / no-progress) → compute ready nodes → halt on
`human`/`policy`, else run the handler (or the `script` fail-closed default). `closeNode()`
is the only way to advance a gated node. `restartLoop()` re-queues only that loop's own
nodes; past `maxAttempts` the run halts for a human tie-breaker. `drive()` ticks to
completion, halt, or no state change.

**3. `check-sentinel.js` — fail-closed integrity of installed copies.** Born from a dated
incident recorded inline: "2026-08-25: a 101-line installed `lint-graph.js` passed a graph
the canonical 341-line linter rejects... This file is the gate." sha256-compares three
`GATE_RELPATHS` (`scripts/lint-graph.js`, `scripts/run-graph.js`,
`companions/gbrain/scripts/lint-note.py`) between a candidate and a resolved canonical root
(explicit arg → `AGO_CANONICAL` env → guessed path → self as last resort). `FLOORS`
(min bytes/lines) catch a truncated install even with no canonical reachable to hash
against. `assertThisFile()` lets a script check itself before doing real work — what
`preflight-sentinel.js` calls on every `require("./lint-graph")`. **Never writes
anything**; reports `in-sync | drift | missing` and exits 1 on anything else.

**4. `sync-gates.js` — deliberate release.** The only sanctioned repair. `syncGates()`
copies the whole tree (excluding `.git`, `node_modules`, `.DS_Store`, `.planning`) from
canonical to an install dir, then re-runs `checkSentinel()` against the result so a bad
sync is visible immediately. Refuses to sync a tree onto itself; never deletes extra files.
"The invariant was never 'a human must type cp' — it is that a drifted gate must not
quietly become in-sync." Never called automatically; the caller's commit in the consuming
repo is the release record (`CLAUDE.md` #3).

`lint.js` and `lint-with-sentinel.sh` wire 1–3 together: preflight the sentinel, then lint.

## GBrain Companion — Memory-Promotion Gate

`companions/gbrain/` applies the same rule to memory: the model drafts a note, but
`remember`/`forget`/`persist` are irreversible edges it cannot close.
`companions/gbrain/scripts/lint-note.py` is the script-closer verifier — parses YAML
frontmatter (`tier`/`lane`/`closer`/`verifier`), rejects anything but
`tier: verified|decided`, rejects `closer: model`, rejects secret-shaped strings, and
rejects "paid"/"posted" claims without a closed-node verifier. It is one of the three
`GATE_RELPATHS` files `check-sentinel.js` checks — a drifted memory gate is caught the same
way as a drifted graph gate. Its topology,
`companions/gbrain/examples/memory-loop.json` (`recall → draft-note → verify-note →
remember → forget`), lints against the same `lint-graph.js` — one linter, two domains.

## Architectural Constraints

- **One inference, two consumers.** `lint-graph.js` owns irreversibility; `run-graph.js`
  imports it. A second copy anywhere is a regression (`CLAUDE.md` #2).
- **No running process, no shared mutable state.** Every script is a stateless call over a
  JSON file or in-memory object; `run-graph.js` threads an explicit `run` via `cloneRun()`.
- **Fail-closed by default.** Unhandled `script` node fails. An unresolvable canonical root
  fails the sentinel. A graph failing `lintGraph()` makes `startRun()` throw pre-execution.
- **Checker/repair separation is load-bearing.** `check-sentinel.js` never writes;
  `sync-gates.js` never runs automatically (`CLAUDE.md` #3).
- **Canonical-then-mirrors distribution.** This repo is the source of truth; installs
  (`midnight-agent-skills` mirror, Hermes `.grok/skills/...`) sync via `sync-gates.js`,
  never hand-edited for gate logic (`CLAUDE.md` #4).

## Anti-Patterns

| Anti-pattern | Why it's wrong | Do this instead |
|---|---|---|
| Auto-closing `accept`/`post`/`remember` with `closer: model` to finish a demo in one handler | Hands the model authority over money, publication, or memory it must never hold — the mistake `marketplace-graph.md` documents | `closer: human` or `policy`; node stays `"gate"` until `closeNode()` is called |
| A second "is this dangerous?" check inside a runtime or caller | Two copies drift; the weaker one wins in practice | Import `inferredIrreversibleId`; extend `IRREVERSIBLE_IDS`/`_PATTERNS` in `lint-graph.js` |
| `restarts[]` pointing outside a loop's own `nodes[]` (e.g. restarting `intake`) | "A failed caption does not restart intake" — narrow retries must stay narrow | Keep `restarts[]` inside `loop.nodes`; lint rejects anything outside it |
| Hand-copying a gate file into an install | `check-sentinel.js` can't tell a careful copy from a stale one, and hand-copies can omit sibling files | `node scripts/sync-gates.js --to <install>`, then commit in the consuming repo |

## Cross-Cutting Concerns

**Validation:** centralized in `lintGraph()` — every consumer (runtime, tests, `npm run
lint-graphs`) calls the same function; there is no second validation path.
**Error handling:** exceptions for programmer errors (`startRun` throws on failed lint,
`closeNode` throws on wrong closer/state); structured `{ ok, evidence }` for expected
pass/fail results inside `tick()`.
**Logging:** `run.logs[]` — an in-memory, timestamped array appended on every state
transition; no external logging framework.

---

*Architecture analysis: 2026-08-27*
