# Technology Stack

**Analysis Date:** 2026-08-27

## Languages

**Primary:**
- JavaScript (Node.js, CommonJS) — `scripts/*.js`, the entire linter/runtime/sentinel/sync toolchain
- Markdown-as-code — `SKILL.md`, `AGENTS.md`, `references/*.md` are executable agent instructions, not just docs (`AGENTS.md`: "This repo is a skill, not an app")

**Secondary:**
- Python 3 — `companions/gbrain/scripts/lint-note.py` (memory-note linter) + `lint-note.test.py`
- Bash — `scripts/lint-with-sentinel.sh` (sentinel-then-lint wrapper, `set -euo pipefail`)
- JSON — graph specs (`examples/*.json`, `companions/gbrain/examples/memory-loop.json`) are the executable artifact the linter/runtime consume, not config

## Runtime

**Environment:**
- Node.js, CommonJS only (`require`/`module.exports`; no `import`/`export`, no `"type": "module"` in `package.json`)
- No `engines` field in `package.json` — no minimum Node version is pinned. Local: Node v22.22.2, npm 10.9.7. Code sticks to long-stable APIs (`node:fs`, `node:path`, `node:crypto`, `node:os`, `node:child_process`, `node:assert/strict`, `node:test`), so any current Node 18+/20+/22 should run it.
- Python 3 for the GBrain companion only — no `.python-version` pin; `lint-note.py` uses `from __future__ import annotations` and stdlib only (`re`, `sys`, `pathlib`), compatible with 3.10+. Local: Python 3.14.5.

**Package Manager:**
- npm, but **zero dependencies** — verified: `package.json` has no `dependencies`/`devDependencies` key at all; no `node_modules/`; no `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml` anywhere in the tree. Every `require()` under `scripts/` resolves to either a `node:` builtin or a sibling file (grep-verified against `scripts/*.js`).
- Deliberate, not an oversight: the repo is installed by copying the tree wholesale (`cp -R SKILL.md references examples scripts companions ...` per `README.md`) into `~/.claude/skills/`, a project's `.grok/skills/`, or the `midnight-agent-skills` mirror. A dependency tree would break that copy-install model.
- Python has no package-manager footprint either — no `requirements.txt`, `pyproject.toml`, or `Pipfile`.

## Frameworks

**Core:**
- None. No web framework, no CLI framework (no yargs/commander), no build tool. Every script hand-rolls its own `for` loop over `process.argv` for flags (see `main()` in `scripts/check-sentinel.js`, `scripts/sync-gates.js`).

**Testing:**
- `node --test` (Node's built-in runner) on the JS side, assertions via `node:assert/strict`. No Jest/Mocha/Vitest/AVA.
- `unittest` (Python stdlib) for `companions/gbrain/scripts/lint-note.test.py`, run standalone: `python3 companions/gbrain/scripts/lint-note.test.py`. **Not wired into `npm test`** — it's the one test file the `test` npm script never executes; run it manually before trusting a GBrain-linter change.

**Build/Dev:**
- None. No transpiler, no bundler, no linter config (no `.eslintrc*`/`eslint.config.*`/`biome.json`), no formatter config (no `.prettierrc*`). Scripts run exactly as authored.

## Key Dependencies

**Critical:**
- None (npm). The one hard internal dependency: `scripts/run-graph.js` requires `scripts/lint-graph.js` for its irreversibility inference (`inferredIrreversibleId`) — `CLAUDE.md` invariant #2 ("One inference") forbids a second, weaker copy of that logic in the runtime.

**Infrastructure:**
- None — no DB client, no HTTP client, no cloud SDK. This repo has no server and no persistence layer; see `INTEGRATIONS.md` for where state actually lives (consumer repos, Graphiti).

## Configuration

**Environment variables:**
- `AGO_CANONICAL` — optional override `scripts/check-sentinel.js`'s `resolveCanonical()` uses instead of the default guess (`~/projects/agentic-graph-orchestration`).
- `AGO_ROOT` — read by *consumers*, not this repo, to locate the canonical runtime at require-time (see `INTEGRATIONS.md`, flagship consumer).
- `HOME` — used to build the default canonical-root guess when `AGO_CANONICAL` is unset.
- No `.env` file and no secrets anywhere in this repo — it has nothing to authenticate to.

**Build:**
- None. The `package.json` `scripts` block below is the entire build surface.

## How scripts are invoked

Entry points are `npm run` aliases over direct `node`/`python3`/`bash` calls, defined in `package.json`:

| npm script | Underlying command |
|---|---|
| `npm run check-sentinel` | `node scripts/check-sentinel.js` |
| `npm run lint-graphs` | `node scripts/check-sentinel.js && node scripts/lint.js examples/marketplace-graph.json && node scripts/lint.js examples/coding-loop.json && node scripts/lint.js companions/gbrain/examples/memory-loop.json` |
| `npm test` | `node --test scripts/lint-graph.test.js scripts/run-graph.test.js scripts/check-sentinel.test.js scripts/preflight-sentinel.test.js scripts/sync-gates.test.js && npm run lint-graphs` |
| `npm run sync-gates` | `node scripts/sync-gates.js` (needs `-- --to <install>`) |
| `npm run run` | `node scripts/run-graph.js` (needs `-- <graph.json>`) |

Not aliased but documented/used directly: `node scripts/lint.js <graph.json>` (sentinel-gated single-file lint), `bash scripts/lint-with-sentinel.sh <graph.json>...`, `python3 companions/gbrain/scripts/lint-note.py <note.md>`.

## Platform Requirements

**Development:**
- macOS/Linux shell (bash scripts assume POSIX `set -euo pipefail`); Node 18+/20+/22 and Python 3.10+ on `PATH`. No editorconfig, no IDE-specific tooling required.

**Production:**
- No production deployment of this repo itself — it is a library/skill consumed by other repos (see `INTEGRATIONS.md`). "Deploy" means `scripts/sync-gates.js` copying the tree into an install location, or the tree being copied into `~/.claude/skills/` / a project's `.grok/skills/`.

---

*Stack analysis: 2026-08-27*
