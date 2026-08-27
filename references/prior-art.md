# Prior art (read this before claiming novelty)

This skill is a synthesis. Isolated pieces already exist. Cite them.

## Coding-agent skill packs (the 100k-star class)

- **Superpowers (obra)** — test-driven, spec-driven Claude Code framework. Subagents get fresh context. The current default "how to work" pack.
- **GStack (garrytan/gstack)** — Garry Tan's virtual engineering team. Slash commands for CEO / EM / designer / QA / security / release. Personal AGI as an org chart.
- **Community Karpathy guidelines** (forrestchang / multica-ai) — four behavioral rules from Karpathy's Jan 2026 post. Think, simplify, surgical edits, stay on goal.
- **Anthropic skills + Skill Creator** — the format this repo uses (YAML frontmatter, progressive disclosure).

## Graph / loop engineering skills (the 0–6 star class)

- [VineeTagarwaL-code/graph-engineering](https://github.com/VineeTagarwaL-code/graph-engineering) — Claude skill for dependency graphs, fan-out, verification retry, human approval gates. Closest cousin. 6 stars as of Aug 2026.
- [NITISH-R-G/graph-engineering-skills](https://github.com/NITISH-R-G/graph-engineering-skills) — eight skills on verifier design, autonomy ladders, reviewer nodes.
- [mlopscommunity/graph-engineering-skill](https://github.com/mlopscommunity/graph-engineering-skill) — "design agent work as a graph, not a line."
- [uninhibited-scholar/obsidian-loop-wiki](https://github.com/uninhibited-scholar/obsidian-loop-wiki) — loop engineering + a no-dependency checker that resists Goodhart gaming.

## Runtimes

LangGraph, CrewAI, Google ADK, Temporal+LLM workers. These *run* graphs. This repo is not a runtime.

## Academic convergence (2026 — found via web sweep 2026-08-27)

The core concepts are now published research.

- **Agentproof** (arXiv 2603.20356) — static verification of agent workflow graphs as a
  mandatory CI gate; checks reachability of destructive tools and human-review-before-
  sensitive-action. The closest thing to `lint-graph.js` in the literature.
- **AgentFlow** (arXiv 2607.01640) — agent dependency graphs for static analysis.
- **Revisable by Design** (arXiv 2604.23283) — action taxonomy: Idempotent / Reversible /
  Compensable / Irreversible; "flexibility is bounded by reversibility."
- **The Controllability Trap** (arXiv 2603.03515) — an "Irreversibility Budget": quantified
  cumulative-consequence limit before mandatory human re-authorization.
- **GovMem, "When Not to Write Memory"** (arXiv 2607.02579) — memory-write governance:
  promote / reject / needs-review with confidence floors. The published twin of the GBrain
  companion's promotion gate.
- **BPMN 2.0 (2011)** is the deep ancestor of closer typing: User / Manual / Script /
  Service / Business-Rule task types. `closer: model` is the post-LLM addition.

## Memory stores

- **GBrain (garrytan/gbrain)** — markdown brain, hybrid search, MCP verbs. This repo does not fork it. The companion skill adds a closer GBrain does not enforce: the model cannot own `remember`.
- **GStack memory-sync** — push curated `~/.gstack/` state to private git. Complementary cadence, not a store of product truth.
- **Graphiti** — entity/episode graph. Canonical here for people, companies, and project facts. GBrain is not a substitute.

## Shipped implementations (verified 2026-08-27 — supersedes two earlier claims)

An earlier draft of this file said the 2026 concepts had no shipping implementations.
**That is false and is retracted.** Then a same-day "correction" in this file disputed two
competitor citations relayed from the IP stream. **That dispute was itself wrong and is
also retracted.** Both were verified at source; the IP stream was right and this file was
wrong. Corrected record:

- **`sheeki03/tirith` — `crates/tirith-core/src/artifact/quarantine.rs`** (public,
  2026-06-21). Its own module doc opens "Content-addressed quarantine store." Blob store
  keyed by lowercase-hex SHA-256 (`<root>/blobs/sha256/<digest>`), written once and
  immutable (`0o400`); an artifact is copied and **re-hashed after copy and again at
  install**; the store "does no resolving, no inspection, and no policy evaluation" — a
  blind mover — with inspection and verdict living in later stages of the D1→D3→D4
  pipeline. Every property previously disputed here is in the source.
  *This file earlier called tirith "terminal security, not a memory quarantine store."
  That was wrong: it is terminal security **and** it contains a content-addressed
  quarantine store. Judging the repo by its README was the error.*
- **`adamabdo-xynora/mcp-capability-guard`** — public, **first commit 2026-08-20T23:13:33Z**
  (verified via the commits API; repo created 02:34Z the next day). Description: single-use
  capability tokens bound to one exact mutation, burn-on-mismatch, human confirmation for
  destructive writes, a store-level floor no consent overrides, token-fingerprinting audit
  log. *This file earlier said it "was not found." It exists; it has zero stars, which is
  precisely why a web search could not see it.*
- **Total Recall** — write-gated memory for Claude Code (Show HN thread; public 2026-02-05
  per the IP stream). Write-time memory governance ships and predates this work.
- **OWASP `www-project-agent-memory-guard`** — `MemoryGuard.write` gate with YAML policy
  actions allow / redact / quarantine / block.

**Method lesson, recorded so it is not repeated:** absence from web search is not absence.
Web indexes lag or ignore new and zero-star repositories, and READMEs describe products,
not their internals. Verify against the code and the commit API — read files, not
descriptions. A negative asserted from a search summary is not a negative.

**These references are material.** They are candidates for a practitioner's 37 CFR 1.56
disclosure consideration. Omitting known material art is a graver problem than citing it;
route them to counsel rather than filtering them here. (Not legal advice.)

**Positioning that survives the evidence:** not primacy. The defensible claim is the
*coupling* — typed closers + static gate + runtime + integrity sentinel + memory
promotion, running together with receipts across multiple domains. Individual legs have
shipped elsewhere; the composition and the discipline are the product.

## What this repo adds on top

1. **External edges stay open.** Human-approval-gates in coding skills are "ask before merge." Here, accept / post / pay are first-class product nodes that the model cannot mark passed.
2. **A linter.** `scripts/lint-graph.js` fails a graph that lets the model own an irreversible edge. Most skill repos are prose. (Since 2026: the *concept* is published — see Agentproof above — so the honest claim is shipping, not invention: a working, mutation-tested, sentinel-hardened gate you can run today, not a paper.)
3. **A product graph, not a coding graph.** Dozen is a marketplace with FTC, fake-engagement, and payout verifiers. The worked example is not "plan → implement → test."
4. **A memory companion with the same hard rule.** `remember` / `forget` are irreversible. Graphiti stays the entity store. GBrain holds pages. Harness `MEMORY.md` is a cache. (Weakest novelty leg — Total Recall and OWASP agent-memory-guard both ship write-time gates; see "Shipped implementations" above. What is ours is the *coupling* of the memory gate to the same closer/verifier contract the rest of the graph runs on.)

If a later public launch essay skips this file, it is dishonest.
