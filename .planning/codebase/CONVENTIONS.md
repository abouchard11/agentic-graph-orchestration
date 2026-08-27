# Coding Conventions

**Analysis Date:** 2026-08-27

## Scope

Applies to `scripts/*.js` — the only source code in this repo. `examples/`, `references/`, and `companions/gbrain/` (Python) follow different rules and are out of scope here.

## Runtime & Dependencies

- Node stdlib only — `package.json` declares zero `dependencies`/`devDependencies`. No npm package is imported anywhere in `scripts/`.
- Every built-in import uses the `node:` prefix: `require("node:fs")`, `require("node:path")`, `require("node:crypto")`, `require("node:test")`, `require("node:assert/strict")`, `require("node:os")`. Never bare `require("fs")`.
- CommonJS throughout (`require` / `module.exports`) — no ESM, no bundler, no build step. Files run directly: `node scripts/<file>.js`.

## Naming

- Filenames: kebab-case (`lint-graph.js`, `check-sentinel.js`, `sync-gates.js`, `preflight-sentinel.js`, `run-graph.js`).
- Tests: co-located, `<name>.test.js` next to `<name>.js` — no separate `test/` directory.
- Functions/variables: camelCase (`lintGraph`, `loadAndLint`, `inferredIrreversibleId`, `surfaceOverlap`, `checkSentinel`, `syncGates`, `findDependencyCycles`).
- Module-level lookup tables/sets: SCREAMING_SNAKE_CASE (`IRREVERSIBLE_IDS`, `IRREVERSIBLE_ID_PATTERNS`, `CLOSERS`, `GATE_RELPATHS`, `FLOORS`, `EXCLUDE`, `SKILL_ROOT`).
- Graph-domain node ids (data, not code) are kebab-case verb-object compounds (`release-payout`, `place-order`, `send-email`) matched by regex in `lint-graph.js`.
- Double-quoted strings, semicolons, 2-space indent throughout — no exceptions found.

## Function Design

- Small, single-purpose, pure where possible: `surfaceOverlap`, `normalizeSurface`, `sha256Buffer`, `statFile`, `findDependencyCycles`, `reachableFromRoots`, `dependencyAncestors` each do one job on plain data in, plain data out.
- Orchestrators (`lintGraph`, `checkSentinel`) stay data-in/data-out with no I/O inside them; file reads (`fs.readFileSync`, `JSON.parse`) are isolated to thin wrappers (`loadAndLint`, the CLI `main()`s) so core logic is unit-testable without touching disk.
- Options objects with destructured defaults once a function needs more than ~2 params: `checkSentinel(opts = {})`, `tick(run, opts = {})`, `main(argv)`.

## Module Shape

Every file that exports ends with a single `module.exports = { ... }` block at the bottom — never scattered `exports.x =` assignments. Order within a file: helper functions, then the `if (require.main === module)` CLI guard, then `module.exports` last (e.g. `scripts/sync-gates.js:82-86`).

## CLI Entry Points

- Directly-runnable scripts guard CLI behavior with `if (require.main === module) { ... }`, so the same file works both as a library (`require(...)`) and a script (`node scripts/x.js`) — `lint-graph.js:340`, `run-graph.js:217`, `check-sentinel.js:267`, `sync-gates.js:82`.
- Argv parsing is a hand-written `for` loop over flags (`--to`, `--from`, `--candidate`, `--canonical`, `--json`, `--help`/`-h`) — no argv-parsing library. Unknown or missing-required args print to stderr and return exit code 2; a gate/lint failure returns 1; success is an implicit 0.
- `main(argv)` returns an integer rather than calling `process.exit` itself; the module-guard line does `process.exit(main(process.argv))`, keeping `main` callable/testable without spawning a subprocess.
- Shebang `#!/usr/bin/env node` appears on scripts meant to be executed directly (`lint-graph.js`, `run-graph.js`, `check-sentinel.js`, `sync-gates.js`, `preflight-sentinel.js`); it's omitted on files only ever invoked via `node` or `require` (`lint.js`, `preflight-register.js`, `graph-template.js`).

## Comment Style

- File-header comments state a contract, not a description — `check-sentinel.js:1-12` opens with "Comparing trees after the fact is a dashboard. This file is the gate."
- **Dated incident notes** justify a rule with the regression that caused it: `check-sentinel.js:5` — "2026-08-25: a 101-line installed lint-graph.js passed a graph the canonical 341-line linter rejects" — reused again at `:26` to explain the `FLOORS` byte/line constants. Follow this pattern when adding a new guard rail: cite the date and the symptom, not just the fix.
- Inline comments explain *why a boundary sits where it does*, anticipating the reader's likely wrong guess: `lint-graph.js:29-32` (why irreversible-id inference is regex-narrow, not fuzzy), `lint-graph.js:40-43` (why bare `suspend`/`freeze`/`hold` stay excluded from inference — "a hold is the designed-reversible action this family of graphs relies on"), `run-graph.js:7-8` (why irreversibility is imported rather than reimplemented — "a runtime with its own weaker copy of this rule is a gate that drifts").
- No JSDoc `@param`/`@returns` blocks anywhere — types are conveyed by parameter names, tests, and prose comments only.

## Error/Validation Pattern

`lintGraph` never throws or short-circuits on the first problem: it builds `const errors = []`, pushes one human-readable string per violation (`` `${node.id}: missing doneWhen verifier` ``), and keeps validating the rest of the graph. Only a structurally-unusable input returns early (`if (!graph || typeof graph !== "object") return ["graph must be an object"]`). Callers decide what "failure" means — the CLI treats any non-empty array as FAIL; tests assert on array contents or `assert.deepEqual(errors, [])` for the clean case. Runtime code (`run-graph.js`) inverts this once a graph is *running*: illegal states throw immediately (`unknown node ${nodeId}`, `"model cannot close a gated node"`). Validation accumulates errors; execution throws exceptions — don't mix the two styles inside one function.

## Repo-Process Conventions (CLAUDE.md / AGENTS.md — binding, not just style)

- **Gates ship with a test that failed first.** Invariant #1: any change to `lint-graph.js`, `run-graph.js`, or `companions/gbrain/scripts/lint-note.py` ships with a test that FAILED before the change (or an equivalent mutation demo), plus a fully green `npm test`. This is mutation-proof discipline, not "add a test after." Evidence it's followed: `check-sentinel.test.js` landed in the same commit family as `check-sentinel.js` itself (`2153c24`); the enforcement-verb inference commit (`34e54ef`) shipped its regex alongside the negative tests proving it doesn't over-match.
- **The checker never repairs.** Invariant #3: `check-sentinel.js` only reports drift (exit 1, writes nothing to disk); `sync-gates.js` is the only file that ever copies, and only on a deliberate human-run command (`node scripts/sync-gates.js --to <install>`), leaving a commit as the release record. Never wire drift detection to an automatic fix.
- **One shared irreversible inference.** Invariant #2: `IRREVERSIBLE_IDS`/`IRREVERSIBLE_ID_PATTERNS` live only in `lint-graph.js`; `run-graph.js` imports `inferredIrreversibleId` rather than re-declaring the rule (`run-graph.js:5-12`). Never add a second copy of this classification logic anywhere in the codebase — a runtime with its own weaker rule is a gate that silently drifts from the linter it's supposed to match.

---

*Convention analysis: 2026-08-27*
