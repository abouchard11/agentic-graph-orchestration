# STATE — agentic-graph-orchestration

**As of:** 2026-09-01
**Direction:** productize as governed/verifiable agent execution (operator decision
2026-08-27). Flagship synthetic demo: `~/projects/ProjectsKingPet`, runs end to end
through the real memory gate.

## Done

- 08-27 · Enforcement-verb irreversibility inference + one shared inference for linter and
  runtime (`34e54ef`), mutation-proved. `sync-gates.js` deliberate release path (`8c84e03`).
  Codebase map + roadmap (`a58e0de`). Prior-art ledger corrected at source (`8bc8c0c`).
- 08-30 · (KingPet, origin) `memory/` — faithful port of midnight-reasoning's promotion
  contract: one floor, two independent decisions, promote human/policy-closed, missing
  store throws.
- 09-01 · KingPet fork healed (`d81844c`); demo's `remember` node runs the real gate;
  `verify-briefs` reads the floor from `memory/policy.py`. **Phase 1 done** for the
  contract and memory leg. Residual, by design: the demo's critic *verdicts* are
  deterministic stand-ins — midnight-reasoning's LLM critic pass is not invoked in a
  synthetic demo. Wire it when a real model-closed brief writer exists.

## Next step

1. **Positioning pass** (Phase 2) — draft internally. Publication gated on the IP filing
   receipt (`.planning/IP-CONSTRAINTS.md`; `bouchard-breaker-ip` is still pre-filing as of
   09-01). Claim the coupling, not primacy (`references/prior-art.md`).
2. Taxonomy decision (concern #2): `critic` closer type vs. documented `script` semantics.
3. Second domain example — deploy/release graph.
4. Kiel wiring — blocked on Grok coordination.

## 2026-09-02 — leak found and closed

`.planning/IP-CONSTRAINTS.md` (operator IP notes naming the sealed component) was found in
two installs — Kiel `.grok` and `~/.claude/skills-backburner` — left by a sync that predated
the `.planning` exclusion. Copy-only sync could never remove it, and a routine `git add` of
the Kiel install would have committed it into a repo another agent reads. Neither copy was
ever tracked or pushed: the Kiel one was untracked, the backburner one gitignored, and the
`midnight-agent-skills` mirror plus all six Hermes profile installs were clean. Fixed at the
mechanism (`--prune`, `2be6a90`, tests written first), pruned from both installs, verified by
a full-filesystem scan that only canonical holds the file. Also: `references/prior-art.md`
had shipped with IP-process language until `414e90e` — the Kiel install carried that stale
copy until today's re-sync.

## Blocked / waiting
- Public launch — gated on filing receipt; none on disk.
- Memory hazard note: another session (08-29) built `write-episode.py` for direct
  Neo4j-verified writes and recorded intent to tighten the read-back rule; the global
  CLAUDE.md still says `get_episodes`. Operator's call.
