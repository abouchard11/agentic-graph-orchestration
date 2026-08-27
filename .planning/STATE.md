# STATE — agentic-graph-orchestration

**As of:** 2026-08-27
**Direction:** productize as governed/verifiable agent execution (operator decision
2026-08-27; both KingPet commercial routes rejected). Flagship synthetic demo lives in
`~/projects/ProjectsKingPet` and runs end to end.

## Done this week

- Enforcement-verb irreversibility inference + shared runtime inference (`34e54ef`),
  mutation-proved against the kingpet graph.
- `sync-gates.js` deliberate release path; "copy is a human action" retired (`8c84e03`).
- Mirror synced + pushed (`midnight-agent-skills` `b755a90`).
- `references/prior-art.md` gained the 2026 academic-convergence section (Agentproof,
  Revisable by Design, GovMem et al.) — concepts published, nothing ships; our edge is
  the working product.

## Next step (reordered 2026-08-27 — see ROADMAP.md)

1. **Localize midnight-reasoning** (moved to first). It is now local at
   `~/projects/midnight-reasoning` with the 0.6-floor dual-polarity contract in code, so
   this is wiring; and until it lands, the flagship's headline gate claim is simulated.
2. **Positioning pass** — draft internally; publication gated on the IP stream's filing
   receipt (`.planning/IP-CONSTRAINTS.md`). Claim the coupling, not primacy.
3. **Second domain example** — a deploy/release graph, so the pattern isn't fraud-only.
4. **Kiel wiring** — blocked on Grok coordination regardless.

## Blocked / waiting

- Kiel `.grok` install sync — Grok coordination (also: only 5 of 12 gate scripts are
  tracked there, so a fresh Kiel clone has no drift protection — concern #5).
- Public launch — gated on filing receipt per `.planning/IP-CONSTRAINTS.md` (constraint
  relayed from the bouchard-breaker IP session; the underlying filing is not something
  this session can verify — treat as operator-owned).

## Cross-session note (2026-08-27, corrected)

`85b3970` was authored by a different session (bouchard-breaker/IP stream). Verified here:
additive only, one file, nothing clobbered, tree clean and in sync.

Its "novelty ledger is stale" call was **correct**. This session then disputed two of its
competitor citations and **that dispute was wrong** — both verified at source once the red-team
packet arrived: tirith's quarantine store is real at
`crates/tirith-core/src/artifact/quarantine.rs`, and `mcp-capability-guard` exists with a first
commit at 2026-08-20T23:13:33Z. Corrected in `references/prior-art.md`; the method lesson
(read code and the commits API, never a web-search summary, for new or zero-star repos) is
recorded there too.

## Memory-write hazard (2026-08-27) — affects every session

Graphiti `add_memory` returns "queued for processing" and can then **silently drop the write**.
Root cause per the IP stream, reproduced here: Gemini returns 503 under load, Graphiti calls the
LLM for entity extraction on every episode, and `graphiti_core/llm_client/gemini_client.py`
raises a bare exception, so the MCP layer logs nothing and still reports success. `get_status`
only probes Neo4j and stays green through it.

**All five of this session's memory writes were lost this way** — confirmed by `get_episodes`
returning nothing for this group. Rule: after any `add_memory`, read the episode back before
treating the fact as stored.
