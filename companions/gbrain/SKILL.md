---
name: gbrain-graph-companion
description: Pair GBrain (and Graphiti) with a closed-loop agent graph so memory writes are verified increments, not chat residue. Use when the user mentions GBrain, gbrain, remember this, memory sync, Graphiti vs GBrain, trust tiers, persist a learning, or when an agentic graph needs durable recall across sessions.
---

# GBrain Graph Companion

GBrain is Garry Tan's markdown brain — hybrid search, pages, facts, MCP verbs. This skill is **not** GBrain. It is the missing closer: **the model does not own `remember`.**

Pair it with `agentic-graph-orchestration`. That skill owns work topology. This one owns what is allowed to persist after the graph stops.

## Hard rule

**Memory is an irreversible edge.** `remember`, `forget`, and `persist` stay open until a verifier or a human closes them. Auto-capturing a session into GBrain so the next chat "knows everything" is a skill violation.

The model may draft a note. It may not promote that note to durable memory.

## Lanes (do not collapse)

| Lane | Canonical for | Not for |
|------|----------------|---------|
| **Graphiti** | Durable entities, episodes, cross-project facts. Scoped by `group_id`. | Chat leftovers, CLAUDE.md guidance, code-index search |
| **GBrain** | Markdown pages, retros, skill learnings, code-indexed search, CLAUDE.md guidance | Substituting for Graphiti entity truth |
| **Harness `MEMORY.md`** | Read-first hydration cache | Anything authoritative |

On conflict: live tree > Graphiti > GBrain page > harness cache.

Alex's existing fence stands: **do not substitute GBrain for Graphiti.** If Graphiti is up and the fact is an entity or episode, write Graphiti. If GBrain is down, do not invent a third store.

Details: `references/lanes.md`.

## Trust tiers

Every candidate note gets one tier before it may persist:

| Tier | Meaning | Who may persist |
|------|---------|-----------------|
| `observed` | Model saw it this session | Nobody. Stays in the transcript. |
| `verified` | Script, test, receipt, or independent checker confirmed | Script / policy |
| `decided` | Human or policy closed a graph node | Human / policy |
| `irreversible` | Money, accept, post, publish, delete, identity, legal | Never the model |

Details: `references/trust-tiers.md`.

## Procedure

### 1. Recall before you invent

If GBrain or Graphiti is available, search first.

```sh
gbrain think "what do we already know about X"
# or Graphiti search_nodes / search_memory_facts with the project group_id
```

Do not write a new page that restates a verified page.

### 2. Draft, then verify, then persist

Same loop as captions in Dozen:

```
recall → draft-note → verify-note → remember
```

- `draft-note` closer = model. Owns a scratch file, never the brain.
- `verify-note` closer = script. Checks tier, lane, secrets, and "is this already stored?"
- `remember` closer = policy or human. Irreversible.

Lint that graph (`examples/memory-loop.json`) with the parent linter before you wire it.

### 3. What may be remembered

Persist only:

- A verifier result (test passed, node closed, anomaly held)
- A human decision (bench refill, batch approved, pay released)
- A skill learning that is reusable next session (trigger + what failed + the gate)
- A pointer to a source (commit SHA, Stripe session id, issue number)

Never persist:

- Raw transcripts
- Secrets, tokens, customer PII
- Speculative plans marked as facts
- "The campaign paid" unless the pay node actually passed
- The same fact to Graphiti **and** GBrain without a reconciliation rule

### 4. Forget is also irreversible

`forget` / delete-page / delete-episode is a human or policy closer. The model may propose a retraction. It may not wipe the brain.

### 5. Session end

On SessionEnd / retro:

1. List candidate notes with tiers.
2. Persist only `verified` and `decided`.
3. Write at most one short learning page, not the whole transcript.
4. If nothing verified, write nothing.

## Verbs

When GBrain is installed, prefer its verbs. When it is not, write a markdown page the same way and stop — do not fake an MCP.

| Intent | GBrain | Graphiti | Fallback |
|--------|--------|----------|----------|
| Search | `gbrain think` / `gbrain search` | `search_nodes` + `search_memory_facts` | Read `references/` + repo docs |
| Draft | scratch file | — | `.scratch/note.md` |
| Persist | `gbrain capture` after verify | `add_memory` with `group_id` | Do not persist |
| Retract | `forget` after human | `delete_*` after human | Leave it |

Details: `references/verbs.md`.

## Companion contract

This skill does not replace `agentic-graph-orchestration`. Load that skill for topology. Load this one when a node wants to outlive the process.

If both are loaded:

- Graph nodes still cannot be closed by the model.
- A passed `pay` node may produce a `decided` memory. An open `pay` node may not.
- Inner loops still must set `restarts: []`. A bad note does not restart intake.

## Anti-patterns

- Dumping the session into GBrain so the next agent "has context."
- Using GBrain as a second Graphiti.
- Letting `remember` have `closer: model`.
- Writing "paid" or "posted" to memory while those graph nodes are still `running`.
- Trusting harness `MEMORY.md` over Graphiti.

## Output expectations

- Lane chosen first (Graphiti / GBrain / do not persist).
- Trust tier on every candidate note.
- A linted memory graph before the first `capture`.
- After persist: slug or episode id, tier, and the verifier that closed it.
