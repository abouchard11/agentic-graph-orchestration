# Testing Patterns

**Analysis Date:** 2026-08-27

## Test Runner

- Node's built-in `node --test` (no Jest, Mocha, Vitest, or Ava). Assertions via `node:assert/strict`.
- No test-runner config file; no `.nvmrc`/`engines` field pinning a version (developed against Node v22.x).
- No coverage tool wired in — no `c8`, no `--experimental-test-coverage` flag on the `test` script.

## Run Commands

```bash
npm test                                   # 5 test files + lint-graphs (sentinel + 3 example graphs)
node --test scripts/lint-graph.test.js     # one file
node --test scripts/*.test.js              # all *.test.js, skips the example-graph lint pass
```

`npm test` = `node --test scripts/lint-graph.test.js scripts/run-graph.test.js scripts/check-sentinel.test.js scripts/preflight-sentinel.test.js scripts/sync-gates.test.js && npm run lint-graphs`. `lint-graphs` runs `check-sentinel.js` then `lint.js` against `examples/dozen-graph.json`, `examples/coding-loop.json`, and `companions/gbrain/examples/memory-loop.json`. A green `npm test` therefore proves three things in one command: unit tests pass, this checkout's gates are not drifted from canonical, and the shipped example graphs still lint clean.

## Test File Layout

Five `*.test.js` files, one per production script, co-located in `scripts/` — no separate `test/` or `__tests__/` directory.

| File | Lines | Exercises |
|---|---|---|
| `lint-graph.test.js` | 353 | `lintGraph` / `loadAndLint` — every linter rule |
| `run-graph.test.js` | 133 | `startRun` / `tick` / `closeNode` / `drive` / `isIrreversible` |
| `check-sentinel.test.js` | 92 | `checkSentinel` / `assertThisFile` / `statFile` |
| `preflight-sentinel.test.js` | 21 | `preflightSentinel` (the self-check `lint.js` runs first) |
| `sync-gates.test.js` | 23 | `syncGates` |

## What Each File Covers

**`lint-graph.test.js`** — asserts clean (`[]`) on all 3 real example graphs, then goes negative: model-closer rejection on `remember` and `accept`; compound irreversible ids (`release-payout`, `place-order`, `send-email`, `approve_transfer`, `store-memory`, `deploy-production`); enforcement verbs (`ban`, `ban-accounts`, `enforce`, `clawback`, `revoke-prize`, `disqualify-entry`, `suspend-account`, `freeze-funds`, `withhold-payout`); the narrow-inference negative set (`banner-rotation`, `enforcement-report`, `revoked-list`, bare `suspend`, bare `hold` — must stay `[]`); malformed `irreversible` values; missing `doneWhen`; a loop restarting outside its own nodes; a self-verifying retry loop; duplicate loop ids; dependency cycles and unreachable nodes; parallel-ownership conflicts (exact-path and prefix-path); sequential revision of the same surface (allowed); self-verification (rejected).

**`run-graph.test.js`** — drives the real `coding-loop.json` and `dozen-graph.json` fixtures, not synthetic graphs. Confirms: an unlintable graph refuses `startRun`; `plan` gates on a human closer before `implement` can run; `merge` still gates after `implement`+`verify` pass; a `model` closer attempting to close `merge` throws; a human close finishes the loop; one verify failure retries `implement`+`verify` only — not `plan` — incrementing `loopAttempts`; the `dozen` graph's `safety` (policy) and `accept` (human) gates resist model handlers; and `isIrreversible()` matches `lint-graph.js`'s id classification exactly, both positive and negative cases.

**`check-sentinel.test.js`** — builds disposable "gate tree" fixtures under `os.tmpdir()` via a `writeGateTree()` helper (never touches the real canonical tree). Asserts identical trees hash-match as `in-sync`; a hash-matching copy passes `assertThisFile`; a synthetic 101-line stale copy reproduces the 2026-08-25 incident and is caught by the byte/line floor AND the hash mismatch independently; a candidate missing gate files reports `state: "missing"`.

**`preflight-sentinel.test.js`** — asserts the real checkout's `lint-graph.js` matches itself (a sanity check against the actual canonical file, not just a fixture), and that a hand-written 101-line stale file fails the floor.

**`sync-gates.test.js`** — copies the real canonical tree into a tmpdir and asserts the sentinel then reports `in-sync` against what it just copied (round-trip proof that sync and sentinel agree), and that `syncGates` refuses to copy a tree onto itself.

## House Philosophy — Prove a Gate CAN Fail Before Trusting Its Green

CLAUDE.md invariant #1 requires mutation-proof discipline: a gate change ships with a test that failed before the fix, not just a test that passes after it. The suite is built to demonstrate both directions — reject the guilty case, exonerate the similar-looking innocent one:

- **Model-closer mutation tests** (`"model cannot close remember"`, `"model cannot close accept"`) construct the exact cheat — a `model` closer on a named irreversible node — and assert the specific `/irreversible/` message fires, not just "some error occurred."
- **Enforcement-verb and compound-id tests** sweep lists of realistic attack shapes (`ban-accounts`, `clawback-votes`, `release-payout`, `send-email`, `deploy-production`...) table-driven in a `for` loop, landed in the same commit (`34e54ef`) as the regex they prove.
- **Narrow-inference negative tests are the other half of the same mutation.** `banner-rotation`, `enforcement-report`, `revoked-list`, bare `suspend`, and bare `hold` must return `[]`. Without this test, a broadened regex could silently swallow legitimate node ids and nobody would notice until a real graph broke — proving the gate stays quiet on the innocent case is as load-bearing as proving it fires on the guilty one.
- **`check-sentinel.test.js` re-enacts its own postmortem.** The "101-line installed copy" fixture is not a generic drift test — it's the 2026-08-25 incident (documented at `check-sentinel.js:5`) turned into a repeatable regression test, with the floor check and the hash check asserted as independent, redundant catches.
- **Runtime/linter agreement is tested directly.** `"runtime irreversibility matches the linter — compounds included"` runs the same id lists through `isIrreversible()` (runtime) that `lint-graph.test.js` runs through `lintGraph()` (linter) — this is how invariant #2 ("one inference") gets enforced by CI, not just by code review.

## Fixtures & Mocking

No fixture library, no mocking library (no sinon/`jest.fn()` equivalent anywhere). `check-sentinel.test.js` has one hand-rolled helper, `writeGateTree()`, building a throwaway skill-root directory under `os.mkdtempSync`; `sync-gates.test.js` cleans its tmpdir in a `finally` block. Graph fixtures in `lint-graph.test.js` are inlined per-test object literals, not shared across tests — each test constructs the minimal graph that exercises one rule. `run-graph.test.js` passes plain functions as `drive()`/`tick()` handlers, which is the runtime's real extension point, not a mock of one.

## Coverage Gaps

- **Runtime stop ceilings are untested.** `run-graph.js`'s `stopReason()` has three branches (`maxWallMinutes`, `maxUsd`, `noProgressSteps` exhaustion) and `tick()`'s loop-exhaustion "Max attempts. Human tie-breaker." halt — no test drives a run far enough to hit `halted.closer === "stop"`; the one verify-failure test recovers inside `maxAttempts: 3`, never exhausting it.
- **Thin CLI wrappers are untested.** `scripts/lint.js` (composes `preflight-sentinel` + `loadAndLint` + `process.exit`), `scripts/graph-template.js` (legacy `runGraph`/`runVerifier` re-export shim), and `scripts/preflight-register.js` (one-line side-effect require) are not required by any `*.test.js` file and are absent from the `npm test` file list.
- **`main(argv)` argv-parsing is untested.** `check-sentinel.js` and `sync-gates.js` each have a `main()` handling `--json`, `--help`/`-h`, unknown-flag, and missing-required-arg branches; tests call the underlying `checkSentinel`/`syncGates` functions directly and never `main()` itself.
- **`scripts/lint-with-sentinel.sh` (bash) has zero automated test coverage** — manual-invocation only, no equivalent of the JS sentinel-then-lint sequence tests.
- **One unreachable branch.** `closeNode()`'s `if (closer === "model") throw ...` in `run-graph.js` can't currently be reached via the public API (only human/policy-closer nodes ever reach `status === "gate"`) — flag it before relying on it if the runtime ever lets other closers reach `"gate"`.

---

*Testing analysis: 2026-08-27*
