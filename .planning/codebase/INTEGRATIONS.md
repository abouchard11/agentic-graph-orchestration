# External Integrations

**Analysis Date:** 2026-08-27

## Overview

This repo has no runtime external services — no API calls, no database, no auth provider, no hosting. Its "integrations" are **downstream install trees that must stay byte-identical to canonical on three gate files**, plus one memory system it is documented in. Ownership is directional (`README.md` "Stack" diagram, `CLAUDE.md` invariant #4): this repo is the source; consumers read it and do not edit it back.

## Install / Mirror Topology

```
agentic-graph-orchestration (canonical, THIS REPO — ~/projects/agentic-graph-orchestration)
    │  scripts/sync-gates.js --to <install>   (deliberate, committed release step)
    ├──> midnight-agent-skills/skills/agentic-graph-orchestration   (packaging mirror → consumed by midnight-reasoning → hermes-command-center)
    └──> hermes-command-center/.grok/skills/agentic-graph-orchestration   (Hermes/Grok install, git-tracked inside Hermes's own repo — coordinate before syncing)
```

- **Canonical root:** `~/projects/agentic-graph-orchestration`. `scripts/check-sentinel.js`'s `resolveCanonical()` defaults here, or to `$AGO_CANONICAL` if set.
- **midnight-agent-skills mirror** (`~/projects/midnight-agent-skills/skills/agentic-graph-orchestration`, own repo, `github.com/abouchard11/midnight-agent-skills`) — verified **IN-SYNC** during this analysis: `node scripts/check-sentinel.js --candidate <mirror-path>` returned `sentinel IN-SYNC` with all 3 gate files hash-matching canonical (`lint-graph.js` 363 lines/`53a72781…`, `run-graph.js` 232 lines/`0934bb2b…`, `lint-note.py` 93 lines/`08d3b0d1…`). Per `README.md`, this mirror feeds `midnight-reasoning` (critic library) which feeds `hermes-command-center` (operator UI); this repo does not talk to those two directly.
- **Hermes `.grok/skills` install** (`~/projects/hermes-command-center/.grok/skills/agentic-graph-orchestration`) — 58 files git-tracked *inside the Hermes repo itself* (confirmed via `git ls-files .grok`), not its own repo. Grok's copy, not ours — `AGENTS.md`/`CLAUDE.md` both say coordinate before touching it. Verified **DRIFTED** during this analysis: `lint-graph.js` is 353 lines/`efd3ae2a…` there vs. 363 lines/`53a72781…` canonical; `run-graph.js` differs in hash despite matching line count (232/232). `.planning/STATE.md` already tracks this as a blocked item pending one coordination conversation with Grok.

## Sentinel Hash-Gating (`scripts/check-sentinel.js`)

Fail-closed comparator, never a copier. Gates exactly three files (`GATE_RELPATHS`):

```
scripts/lint-graph.js
scripts/run-graph.js
companions/gbrain/scripts/lint-note.py
```

- SHA-256 of each candidate file vs. the same relpath under the resolved canonical root; any mismatch → `state: "drift"`.
- `FLOORS` (byte/line minimums — `lint-graph.js` ≥10,000 bytes/≥280 lines, `run-graph.js` ≥4,000 bytes/≥120 lines) catch a truncated install even with no canonical tree reachable to hash against. Set from a real incident: 2026-08-25, a 101-line installed `lint-graph.js` passed a graph the 341-line canonical rejected.
- `scripts/lint.js` and `scripts/preflight-sentinel.js`/`preflight-register.js` call `assertThisFile()` before every lint run — a script refuses to `require()` a `lint-graph.js` that doesn't hash-match canonical (exit 1).
- CLI: `node scripts/check-sentinel.js [--canonical DIR] [--candidate DIR] [--json]`. Exit 0 = in-sync, 1 = drift/missing.
- Read-only by design — file header: "This checker never copies files."

## Release Flow (`scripts/sync-gates.js`)

- `node scripts/sync-gates.js --to <install-dir> [--from <canonical-dir>]` — recursively copies the canonical tree (excludes `.git`, `node_modules`, `.DS_Store`, `.planning`) onto the target, additive only (never deletes extra files at destination), then re-runs `checkSentinel()` against the result and reports it.
- Deliberately not triggered automatically on drift — `CLAUDE.md` invariant #3: "The checker never repairs... deliberately, with a commit as the release record." A human runs this, then commits the mirror repo separately (e.g. `midnight-agent-skills` commit `b755a90`, per `.planning/STATE.md`).
- Refuses to sync a tree onto itself (`fromRoot === toRoot` throws).

## Flagship Consumer: KingPet Triage Demo

`~/projects/ProjectsKingPet/graphs/run-triage-demo.js` — the live reference integration, not a hypothetical:

- Resolves this repo via `AGO_ROOT` env var, defaulting to `path.join(os.homedir(), "projects", "agentic-graph-orchestration")` — the exact canonical path above. No copy of the runtime lives inside ProjectsKingPet; it `require()`s `run-graph.js` and `preflight-sentinel.js` straight out of `AGO_ROOT` at run time.
- Calls `require(path.join(AGO, "scripts", "preflight-sentinel")).rejectIfDrifted(...)` before importing `run-graph.js` — a drifted canonical blocks the demo the same way a drifted install would.
- Drives `graphs/kingpet-triage.json` (14-node graph per this repo's `CLAUDE.md`) through `startRun`/`tick`/`closeNode`, with real `handlers` for script nodes (`ingest-logs` shells out to `sandbox/kingpet_sandbox.py`, plus `detect-signals`, `score-accounts`, `triage-brief`, `verify-briefs`, `verify-payout-clearance`, `measure`) and `gateActions` for human/policy closers (`hold`, `human-review`, `enforce`, `release-payout`, `remember`, `authorization`).
- `--demo-close` auto-closes gates with labeled `SYNTHETIC` evidence so the topology completes end to end; without it, the run halts at the first human/policy node and emits `graphs/out/decision-queue.json` — the "Kiel-shaped decision queue" this repo's `CLAUDE.md`/`.planning/STATE.md` reference.
- The only known cross-repo runtime caller of `run-graph.js` (the mirror/Hermes copies are static file trees until something `require()`s them).

## Memory: Graphiti Group `agentic-graph-orchestration`

- Registered 2026-08-27 (this repo's `CLAUDE.md`). This repo's product direction, invariants, and demo status are the canonical content of that group.
- Cross-echoed (not duplicated as source of truth) into two other groups per `CLAUDE.md`: `midnightdev` (product direction + demo status) and `midnight-ip` (novelty verdict — the analysis backing `references/prior-art.md`).
- No code in this repo calls the Graphiti API/MCP. The only appearance of the word in code is the string literal `"graphiti"` as an allowed lane value inside `companions/gbrain/scripts/lint-note.py`'s `ALLOWED_LANES` set — the relationship is process/documentation: agents working here are instructed (`CLAUDE.md` "Memory") to search group_id `agentic-graph-orchestration` before re-deriving context and to persist decisions there via the same MCP tool calls used across other projects.

## GBrain Companion Relationship

- `companions/gbrain/` is a second, paired skill inside this tree (own `SKILL.md`, `CHANGELOG.md`, `LICENSE`, `references/`, `examples/`, `scripts/lint-note.py`), packaged and synced as a unit with the parent skill — both mirror trees carry a sibling `gbrain-graph-companion` skill alongside `agentic-graph-orchestration`.
- Division of ownership (both `SKILL.md` files agree): this repo owns work topology (nodes/edges/closers); GBrain owns what may outlive the process (persisted notes). Graphiti stays canonical for entities/episodes; GBrain holds pages; a harness `MEMORY.md` is a read-first cache only, never authoritative.
- The only code coupling is the sentinel: `companions/gbrain/scripts/lint-note.py` is one of the three `GATE_RELPATHS`, so GBrain's note-linter ships through the identical `sync-gates.js` deliberate-copy flow as `lint-graph.js`/`run-graph.js` — not a separate pipeline.
- `lint-note.py` has no integration surface of its own (stdlib `re`/`sys`/`pathlib` only). It lints a note's YAML frontmatter (`tier`, `lane`, `closer`, `verifier`) and body for secret patterns and unverified irreversible claims before a human/policy closer may call `gbrain capture` or Graphiti `add_memory` (`companions/gbrain/SKILL.md` workflow step 5) — those store-writing calls happen in the consuming agent session, not in this repo.

## Environment Configuration

- `AGO_CANONICAL` (optional, this repo) — override canonical root for sentinel checks.
- `AGO_ROOT` (optional, consumer-side, e.g. `run-triage-demo.js`) — override where a consumer finds this repo's runtime; defaults to `~/projects/agentic-graph-orchestration`.
- No secrets, no `.env`, no API keys anywhere in this repo.

---

*Integration audit: 2026-08-27*
