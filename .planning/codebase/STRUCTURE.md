# Codebase Structure

**Analysis Date:** 2026-08-27

This repo is distributed by copying its tree wholesale into a skills directory
(`~/.claude/skills/...`, a project's `.grok/skills/...`); there is no build step and no
`src/`. Every file's location is its final, installed location.

## Directory Layout

```
agentic-graph-orchestration/
├── SKILL.md                  # loaded-on-trigger skill definition — the procedure
├── CLAUDE.md                 # this repo's operating contract for Claude sessions
├── AGENTS.md                 # short generic-agent usage notes
├── README.md                 # human-facing pitch, stack position, install steps
├── LICENSE                   # Apache-2.0
├── package.json              # npm scripts: test, lint-graphs, sync-gates, run
├── .planning/                # STATE.md, ROADMAP.md, codebase/ (this document's home)
├── scripts/                  # the enforcement chain — see ARCHITECTURE.md
├── examples/                 # reference graphs + prose + copy-paste agent prompts
├── companions/gbrain/        # second skill: model does not own remember/forget/persist
└── references/               # top-level skill references (progressive disclosure)
```

## scripts/ — each script and its test

| File | Purpose |
|------|---------|
| `lint-graph.js` | Static gate: `lintGraph()` — irreversibility inference, ownership conflicts, verifier independence, loop rules, cycle/reachability. Canonical source of `IRREVERSIBLE_IDS`/`IRREVERSIBLE_ID_PATTERNS`. |
| `lint-graph.test.js` | Flat ids, compound-verb patterns, enforcement verbs, ownership/verifier/loop rejections; asserts all shipped example graphs pass. |
| `run-graph.js` | Runtime: `startRun` / `tick` / `closeNode` / `drive`. Imports `inferredIrreversibleId` from `lint-graph.js` rather than reimplementing it. |
| `run-graph.test.js` | Gating on human/policy, loop retries, `closeNode` rejecting the wrong closer or `"model"`. |
| `check-sentinel.js` | Fail-closed sha256 integrity check of installed gate copies (`GATE_RELPATHS` + byte/line `FLOORS`). Never writes files. |
| `check-sentinel.test.js` | In-sync, drift, missing, and floor-violation scenarios via temp fixture trees. |
| `sync-gates.js` | Deliberate release: copies the canonical tree to an install dir, then re-runs the sentinel against the result. |
| `sync-gates.test.js` | A synced install passes the sentinel; syncing a tree onto itself throws. |
| `preflight-sentinel.js` | `assertThisFile()` wrapper; `rejectIfDrifted()` exits 1 if the executing `lint-graph.js` doesn't match canonical. |
| `preflight-sentinel.test.js` | Canonical file matches itself; a truncated file fails the floor. |
| `preflight-register.js` | One-line side-effect import: runs `rejectIfDrifted` against `lint-graph.js` on require. |
| `lint.js` | Sentinel-gated CLI entrypoint: preflight, then `loadAndLint()` on the given graph path. Preferred over calling `lint-graph.js` directly. |
| `lint-with-sentinel.sh` | Shell wrapper: `check-sentinel.js` once, then `lint-graph.js` on every graph path given. |
| `graph-template.js` | Re-exports `run-graph.js`; keeps an older sequential `runGraph(nodes, order, hooks)` helper for pre-runtime callers. |

## examples/ — each example graph and what it demonstrates

| File | Demonstrates |
|------|--------------|
| `coding-loop.json` / `.md` | Smallest topology: `plan(human) → implement(model) → verify(script) → merge(human)`, with an `implement-verify` retry loop (max 3, `restarts: []`). The degenerate case other graphs sit on top of. |
| `marketplace-graph.json` / `.md` | 12-node marketplace graph: `intake → safety → assemble → offer → accept → draft → verify → revise → review → post → measure → pay`. `accept`/`post`/`pay`/`safety` held open. Reference product graph; `.md` includes a "what was wrong in the one-pass build" retro (accept/post were once auto-marked passed). |
| `grok-one-shot-product-build-prompt.md` | Reusable `{PLACEHOLDER}` prompt template for handing a large autonomous product build to Grok/Claude/Codex. |
| `cookbook.md` | Short recipes: add a third irreversible edge, persist a session learning via `lint-note.py`, copy the marketplace shape for a new product. |

## companions/gbrain/ — the memory-promotion companion skill

Second, independently loadable skill applying the same hard rule to memory: the model
drafts notes; `remember`/`forget`/`persist` are irreversible and need a `policy`/`human`
closer.

| Path | Purpose |
|------|---------|
| `SKILL.md` | Companion skill definition — workflow (recall → pick a lane → draft → verify → persist → forget), lanes/tiers summary, retrospective format. |
| `CHANGELOG.md` | Dated changelog for the companion skill. |
| `LICENSE` | Companion's own license file. |
| `scripts/lint-note.py` | Script-closer gate: validates note frontmatter (`tier`/`lane`/`closer`/`verifier`), rejects `closer: model`, secrets, and unverified "paid"/"posted" claims. One of the three `check-sentinel.js` `GATE_RELPATHS`. |
| `scripts/lint-note.test.py` | `unittest` tests run against the `examples/*.md` fixtures below. **Not wired into `npm test`** — run manually. |
| `examples/memory-loop.json` / `.md` | `recall → draft-note → verify-note → remember → forget` graph; lints against the parent skill's `lint-graph.js`. |
| `examples/good-verified.md` | Fixture note that passes `lint-note.py`. |
| `examples/bad-observed.md` | Fixture that fails: `tier: observed`, `closer: model`. |
| `examples/bad-paid-open.md` | Fixture that fails: claims a payout with no closed-node verifier. |
| `references/INDEX.md` | Knowledge-graph index for the companion — start here. |
| `references/lanes.md` | When to use Graphiti vs GBrain vs harness `MEMORY.md`. |
| `references/trust-tiers.md` | The `observed`/`verified`/`decided`/`irreversible` tiers and what each may persist. |
| `references/verbs.md` | Which store verb to call, after lane and tier are already chosen. |
| `evals/evals.json` | Scenario cases asserting the companion refuses to persist ungated claims. |
| `evals/triggers.json` | Should-this-skill-trigger cases for skill routing. |

## references/ — top-level skill references (progressive disclosure)

| File | Purpose |
|------|---------|
| `karpathy-loops.md` | Karpathy agentic-engineering frame (write tasks + verifiers, not code) and the 7-step inner loop. |
| `claude-graph.md` | Graph-engineering vocabulary — nodes/edges/anchors, why a script-held loop beats one long context. |
| `yc-personal-agi.md` | YC/Garry Tan "personal AGI" framing; positions GStack and GBrain relative to this skill. |
| `user-patterns.md` | Invariants already shipped in the author's other repos that this skill generalizes. |
| `prior-art.md` | Honesty check on novelty — prior art plus a 2026 academic-convergence section. Read before any novelty claim. |

## SKILL.md vs CLAUDE.md vs AGENTS.md Roles

Three files, non-overlapping jobs — do not merge or duplicate content between them:

- **`SKILL.md`** — the portable, agent-loadable skill definition, copied verbatim into
  `~/.claude/skills/agentic-graph-orchestration/`, a project's `.grok/skills/...`, or a
  Codex skills directory. Must stand alone with no repo-only context: mental model, hard
  rule, node-table procedure, lint-before-ship commands, anti-patterns, retrospective
  format. `companions/gbrain/SKILL.md` is the same kind of file at the companion's scope.
- **`CLAUDE.md`** — this repo's own operating contract for Claude Code sessions working
  *on* this repo (never installed elsewhere). States numbered invariants (one inference,
  checker never repairs, canonical location, private until told otherwise), product
  direction, the flagship demo pointer, and commands.
- **`AGENTS.md`** — a short, generic-agent-facing companion to `CLAUDE.md`: the same
  operational rules condensed (load `SKILL.md` first, lint before implementing, run the
  sentinel before trusting an installed copy, `restarts: []` on inner loops, never edit the
  skill from a retrospective) for any agent runtime that reads `AGENTS.md` by convention.

## Naming Conventions

**Scripts:** verb-first, hyphenated (`lint-graph.js`, `check-sentinel.js`); a script's test
sits beside it as `<name>.test.js` / `<name>.test.py`.
**Graphs:** `<product>-graph.json` for a full topology, `<name>.json` for a scoped one
(`coding-loop.json`, `memory-loop.json`); each `.json` has a same-named `.md` companion.
**Docs:** UPPERCASE for repo-level operating/status files (`CLAUDE.md`, `STATE.md`);
lowercase for content docs (`references/*.md`, `examples/*.md`).

## Where to Add New Code

**New irreversible verb:** add it to `IRREVERSIBLE_IDS` or a new
`IRREVERSIBLE_ID_PATTERNS` regex in `lint-graph.js`, add a rejection case to
`lint-graph.test.js`, run `npm test` (re-lints every example, since the runtime shares the
inference).
**New example graph:** add a `<name>.json` + `<name>.md` pair under `examples/` (or
`companions/gbrain/examples/`), add a `loadAndLint` assertion in `lint-graph.test.js`, and
add it to the `lint-graphs` chain in `package.json`.
**New gated file:** add its relative path to `GATE_RELPATHS` (and a `FLOORS` entry if
truncation is realistic) in `check-sentinel.js`.
**New reference doc:** drop a `.md` under `references/` (or the companion's `references/`)
and link it from `SKILL.md`'s "Reference files" list so it is actually discoverable.

## Special Directories

**`.planning/`:** operator-facing state (`STATE.md`, `ROADMAP.md`) plus generated codebase
maps (`codebase/`). `codebase/*.md` are generated; `STATE.md`/`ROADMAP.md` are hand-written.
Committed: yes.
**`companions/gbrain/`:** a second, independently distributable skill (own `SKILL.md`,
`LICENSE`, `CHANGELOG.md`) nested here because it pairs directly with the graph skill's
irreversibility rule. Generated: no. Committed: yes.

---

*Structure analysis: 2026-08-27*
