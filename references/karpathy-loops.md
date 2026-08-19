# Karpathy Agentic Engineering and Loops

You are no longer writing code. You are directing a team of tireless but fallible junior engineers.

write code → write tasks with success criteria → agent loops → human taste review.

## 7-Step Inner Loop

1. Stuff context — relevant project slice, recent diffs, docs.
2. Discuss plan — approaches with pros/cons before any code.
3. Request first draft — one approach, minimal implementation.
4. Inline learning — review the diff; ask about unfamiliar APIs.
5. Test / verify — run the defined verifier.
6. Commit — only what you understand and have verified.
7. Ask for next — let the agent suggest the next incremental step.

## Autoresearch / Closed Research Loop

- Constrain the editable surface.
- Give a single objective, cheap-to-evaluate metric.
- Fixed time or step budget per experiment.
- Propose → run → compare → keep or revert → repeat.
- Human aims the direction; the agent executes the search.

## Vibe-to-Agentic

Start free-form to discover the shape, then switch to criteria, verifiers, and incremental commits once the goal is clear.

## Skill Issue Framing

When an agent fails, treat it first as a skill issue in how it was directed (context, criteria, loop design, permissions) rather than a pure model limit.
