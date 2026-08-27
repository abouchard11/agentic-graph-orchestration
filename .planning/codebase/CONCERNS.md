# Codebase Concerns

**Analysis Date:** 2026-08-27

This skill's whole pitch is "the model does not own irreversible edges, and a
verifier decides pass/fail" (`SKILL.md:26`). Nearly every concern below lives at
the exact seam that promise depends on — doneWhen semantics, the closer
taxonomy, and halt/gate scheduling — where the guarantee is either self-reported
by a handler or not yet exercised by the runtime. `.planning/ROADMAP.md:56`
already backlogs five of these from this file; keep it current so that link
stays real.

## 1. `doneWhen` is prose, never machine-checked

**What:** The linter only checks that `doneWhen` is a non-empty string ≥8
characters. The runtime trusts whatever `{ok, evidence}` a handler function
returns with no cross-check that `evidence` corresponds to anything real. The
linter verifies graph topology (deps, cycles, ownership, closer legality); it
has no opinion on whether a node's claimed completion is true.
**Where:** `scripts/lint-graph.js:131-133` (length-only check); `scripts/run-graph.js:150-154` (`if (result.ok)` trusts the handler outright).
**Severity:** High — this is the trust boundary the entire verifier-first pitch rests on.
**Fix:** Don't attempt NLP verification of prose. Narrow the contract instead: require `script`-closer nodes to return `evidence` as a path/URI the runtime can `fs.stat`, and have the linter warn (not block) when `doneWhen` contains no checkable noun. Ratchet, don't solve it in one pass.

## 2. Closer taxonomy has no `critic` type

**What:** `CLOSERS` is `{model, human, policy, script}`. An LLM-as-judge node (a midnight-reasoning pass) has no legal home, so it gets declared `closer:"script"` — conflating "who has authority to close a node" with "what code actually executes." The project has already named this: it's an open roadmap item, not a surprise.
**Where:** `scripts/lint-graph.js:47`; `graphs/kingpet-triage.json:56-61` (`verify-briefs`, closer `script`, doneWhen: "Every brief carries a critic verdict from the midnight-reasoning pass..."); tracked at `.planning/ROADMAP.md:32-34` (Phase 2) and `.planning/STATE.md:22-23` ("the kingpet critic is a labeled stand-in").
**Severity:** Medium — honest-by-comment, wrong-by-schema; contained to one node today.
**Fix:** The roadmap already lists both options: add `critic` to `CLOSERS` plus its own loop-verifier rule, or formally define `script` to mean "deterministic contract, whatever sits inside." The second is one SKILL.md line and a lint-message tweak — do that first, add the type later only if a second critic node needs different lint rules than `script` gets.

## 3. Single global halted slot — one gate at a time, `nodes[]`-order dependence

**What:** `run.halted` is one object, not a per-branch set. `tick()` returns the instant it hits the first ready human/policy node in `graph.nodes` array order; every other ready node — including ones with no relation to that gate — sits `queued` untouched, and the *next* tick short-circuits before `readyNodes()` even runs.
**Where:** `scripts/run-graph.js:106-110` (short-circuit while any non-stop halt is open); `:122-136` (first-hit-wins loop, `return next` on the first human/policy ready node).
**Concrete instance (not hypothetical):** in `graphs/kingpet-triage.json`, `triage-brief` (model, line 48) and `hold` (policy, line 64) both become ready off `score-accounts`. `triage-brief` runs inline in that tick because it comes first in the array; `hold` then halts the whole run. `verify-briefs` (script, the critic-check branch, line 56 — depends only on `triage-brief`, nothing to do with `hold`) becomes ready only *after* that tick, and the following tick is already frozen on `hold`. An unrelated critic-verification branch is blocked by a policy gate it has no dependency on.
**Severity:** High — reproduces in the project's own flagship demo, not a contrived case.
**Fix:** Replace the singleton with `halted` keyed by node id (a set of concurrently open gates); gate only nodes downstream of an open gate in `readyNodes()`. Already backlogged at `.planning/ROADMAP.md:56`.

## 4. Model closers with no handler auto-pass as "model increment"

**What:** When `tick()` finds no handler for a ready node, `script`-closer nodes fail closed (`{ok:false, evidence:"...no script handler. Fail-closed."}`) but `model`-closer nodes default to an unconditional pass (`{ok:true, evidence:"$id: model increment"}`). The two closers have opposite silent defaults.
**Where:** `scripts/run-graph.js:138-146`.
**Severity:** Medium — correct and useful for the documented simulation path (`drive(graph)` with no handlers, exercised by `run-graph.test.js`), but a real driver that wires every `script` handler and simply forgets one `model` handler gets a silent, evidenced-looking pass instead of a crash.
**Fix:** Gate the auto-pass behind an explicit `drive(graph, {simulate:true})`-style opt-in so a "real" run without it fails closed on missing model handlers too, or at minimum emit a `console.warn` with a distinct marker so it's grep-able in production logs.

## 5. Downstream `.grok` (Kiel) install is git-tracked and currently drifted — and its own safety net isn't committed yet

**What:** `hermes-command-center` (remote `github.com/abouchard11/kiel.git`) vendors this skill at `.grok/skills/agentic-graph-orchestration/`. Running this repo's sentinel against that install today reports **DRIFT**: `lint-graph.js` is 353 lines there vs. 363 canonical (hash mismatch), and `run-graph.js` matches on line count (232/232) but *not* on hash — a content-only edit the line-count floor alone would miss. Separately, the sentinel/preflight subsystem itself (`check-sentinel.js`, `preflight-sentinel.js`, `lint.js`, and their tests) exists only as uncommitted files on disk in that install — `git ls-files` shows only 5 of the 12 on-disk scripts are tracked in Kiel's history. A fresh clone of Kiel today ships with zero drift protection, which is the exact failure mode the sentinel exists to prevent (see `scripts/check-sentinel.js:5-8`).
**Where:** external repo `~/projects/hermes-command-center/.grok/skills/agentic-graph-orchestration/`; verified via `node scripts/check-sentinel.js --candidate <path>` run from this repo; tracked at `.planning/STATE.md:26-28,32`.
**Severity:** Medium — contained (the sentinel correctly refuses to call it in-sync), but blocks the Phase 4 Kiel-wiring roadmap item, and the untracked sentinel files mean the safety net doesn't exist on Kiel's remote yet.
**Fix:** Already the recorded plan — one coordination pass that runs `sync-gates.js --to <kiel-checkout>` and lands the result, including the previously-uncommitted sentinel scripts, as a real PR rather than a local-only copy.

## 6. Halted runs have no resume path for failed (non-gate) nodes

**What:** Once a node exhausts its loop's `maxAttempts`, `tick()` sets `halted:{closer:"stop", ...}`; every later `tick()` call returns the same run forever (`scripts/run-graph.js:96`). `closeNode()` refuses any node whose status isn't `"gate"`, and a failed node's status is `"failed"` — never `"gate"` — so it can't be reopened through the public API. The exported surface (`startRun, tick, closeNode, drive, isIrreversible`) has no `resume`/`retryFailed`/`clearHalt`. The CLI adds nothing on top: `node scripts/run-graph.js <file>` builds a fresh in-memory run, prints one summary line, and exits — there is no on-disk run-state file to restart from, even for a gate halt.
**Where:** `scripts/run-graph.js:96`, `:163-171` (stop halt on exhausted retries), `:182-189` (`closeNode` gate-only guard), `:217-229` (CLI has no persistence), `:231` (export list).
**Severity:** Medium-High for any non-trivial run — a graph that fails late must restart from node zero, redoing every already-passed upstream node.
**Fix:** Expose what `restartLoop()` already does internally: a `retryFailedNode(run, nodeId)` that resets one `"failed"` status to `"queued"` and clears `halted`, plus a `serializeRun`/`hydrateRun` pair (the `run` object is already plain-JSON via `cloneRun()`). Backlogged at `.planning/ROADMAP.md:56`.

## 7. `sync-gates.js` is copy-only — no delete of stale extra files in installs

**What:** `syncTree()` walks the canonical tree and copies/overwrites; it never enumerates the install to remove files absent from canonical. This is explicitly deliberate, per the file's own header comment.
**Where:** `scripts/sync-gates.js:9` ("Extra files in the install are left alone (no deletes)"), `:18-38` (`syncTree`).
**Severity:** Low-Medium — safe by default (never destroys install-local customization), but a deprecated/renamed gate file that a security fix intentionally removed upstream lingers forever in every install and stays importable/executable there.
**Fix:** Add an opt-in `--prune` flag that deletes install files whose relative path is tracked-but-now-absent in canonical (diffed against a manifest, not a blind directory wipe). Keep the current behavior as the default. Backlogged at `.planning/ROADMAP.md:56`.

## 8. Empty-set `doneWhen` semantics are undefined — vacuous "for every X" checks are driver-dependent

**What:** Neither the linter nor the runtime has any concept of quantifier scope. `doneWhen` strings phrased as "every flagged account has..." or "for every entry pending payout..." are vacuously true when the referenced set is empty, and whether a handler treats "nothing to check" as pass or as a red flag (e.g., a broken upstream detector silently producing zero flags) is entirely up to whoever writes that handler.
**Where:** `scripts/lint-graph.js:131` (doneWhen is only length-checked, never parsed); `graphs/kingpet-triage.json:46` (`score-accounts`: "Every flagged account has...") and `:91` (`verify-payout-clearance`: "For every entry pending payout, a clearance record proves zero open holds...").
**Severity:** Medium — real, not hypothetical: it sits in the project's own flagship demo doneWhen text, and a vacuous pass on `verify-payout-clearance` would mask a broken ingestion pipeline instead of flagging it.
**Fix:** No cheap framework-level fix exists (would need a doneWhen mini-grammar). Interim: a documented convention in `SKILL.md` — "for every X" handlers default to fail-closed-on-empty unless the node declares `allowEmptySet: true` — not code. Backlogged at `.planning/ROADMAP.md:56`.

## 9. A human/policy closer can never fail a retry loop (question)

**What:** The loop-verifier lint rule (`hasIndependentVerifier`) accepts any non-model closer — including `human`/`policy` — as a loop's independent verifier. But `restartLoop()` is only reached from the `result.ok === false` branch of the handler path, which human/policy nodes never enter (they go straight to `"gate"`, and `closeNode()` unconditionally sets `"passed"` — there is no reject/fail option). A graph the linter accepts can hit a runtime path that can never actually retry.
**Where:** `scripts/lint-graph.js:252-259` (excludes only `closer === "model"`); `scripts/run-graph.js:182-202` (`closeNode` always passes, never fails).
**Severity:** Low-Medium — not yet hit in practice; no shipped example graph uses a human/policy loop verifier (`kingpet-triage.json`'s only loop verifier, `verify-briefs`, is `script`). Flagging as a question because I have not found a graph author actually tripping on this.
**Fix:** Narrow the lint rule to require `closer === "script"` (or a future `critic`) specifically for loop verifiers — one line in `lint-graph.js:254` — rather than adding a reject path to `closeNode()`.

## 10. Sentinel canonical-root resolution is a hardcoded local-path guess (question)

**What:** `resolveCanonical()` finds canonical only via an explicit arg, the `AGO_CANONICAL` env var, or a guess at `~/projects/agentic-graph-orchestration` — a path specific to this operator's machine. Anywhere else without `AGO_CANONICAL` set (CI, a teammate's machine, Kiel's own CI) falls through to comparing the candidate against itself (a no-op) or reporting "missing."
**Where:** `scripts/check-sentinel.js:57-75`.
**Severity:** Low — worth settling before Phase 4 (Kiel wiring) assumes the sentinel "just works" in someone else's environment. No evidence yet that a self-comparison has produced a false in-sync report anywhere.
**Fix:** Document `AGO_CANONICAL` as required wherever `lint.js`/`check-sentinel.js` run off this laptop; consider failing loud instead of falling back to self-comparison when canonical can't be resolved.

---

*Concerns audit: 2026-08-27*
