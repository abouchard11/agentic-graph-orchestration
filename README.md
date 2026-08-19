# Agentic Graph Orchestration

A skill (and a working product graph) for building **closed-loop multi-agent systems**.

Drop `SKILL.md` into Claude Code, Codex, or Grok skills. The agent is then required to:

1. Write success criteria and a verifier **before** spawning work.
2. Model the job as a graph of nodes, edges, and anchors — not a monologue.
3. Keep loops closed (keep / revert / retry on evidence).
4. Never let the model own irreversible gates (accept, post, pay, publish, safety).

## Install

```sh
# Claude Code / compatible agents
mkdir -p ~/.claude/skills/agentic-graph-orchestration
cp -R SKILL.md references examples scripts ~/.claude/skills/agentic-graph-orchestration/
```

Or clone this repo into your project's `.claude/skills/` or `.grok/skills/`.

## What is novel, and what is not

**Not novel as isolated ideas.** Graph engineering, loop engineering, Karpathy's 7-step inner loop, Claude Code dynamic workflows, Superpowers, GStack, and several graph-skill repos already exist. LangGraph / CrewAI / ADK already orchestrate agents.

**The useful synthesis here:**

- A **skill** that forces topology + verifier-first discipline across Claude / Codex / Grok.
- A **hard rule** that external edges (accept, post, pay) stay open until a human or an explicit policy closes them.
- A **reference product** (`examples/dozen-graph.md`) — an influencer-marketplace graph with fail-closed FTC / fake-engagement / banned-vertical gates — not another coding-agent hello world.

If you want 25k stars later, the path is not "another SKILL.md." It is this repo as the **canonical closed-loop graph cookbook** plus one product people can click. Keep it private until the cookbook and the demo are both sharp.

## Layout

```
SKILL.md                  # loaded on trigger
references/               # progressive disclosure
examples/dozen-graph.md   # live product topology
scripts/graph-template.js # script-held orchestration skeleton
```

## License

MIT. See `LICENSE`.
