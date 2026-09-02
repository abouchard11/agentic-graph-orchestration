# Constraints from the IP stream — 2026-08-27 (bouchard-breaker session)

Additive note for the productization stream. Source of truth: `bouchard-breaker-ip/`
(RED-TEAM-2026-08-27.md, provisional-2026-08-27/). Do not duplicate content from there; link.

## 1. Launch sequencing — hard constraint

A $65 micro-entity provisional (the quarantine-lease interlock, NOT this repo's layer) is
packaged and awaiting Alex's filing. Until the **filing receipt exists**:

- No repo flips public. No launch essay. No "name TBD" announcement.
- After receipt + 48h: publication of already-public-legs material is cleared (TDCommons
  sequencing per council run 20260827-025657). This repo's layer (closers, linter, verifiers)
  is already-disclosed material and is then free to productize publicly.
- The interlock (verdict→hash quarantine→graph-wide lease death) stays out of ALL public
  positioning, demos, and copy, permanently until counsel says otherwise. It does not appear
  in this repo today — keep it that way.

## 2. The novelty ledger is stale — "shipped nothing" is now false

references/prior-art.md and the flagship pitch line "the 2026 papers validated the ideas but
shipped nothing; this is the ideas, running" predate the 2026-08-27 red team. Others HAVE
shipped pieces, publicly, pre-conception:

- `sheeki03/tirith` (June): content-addressed quarantine store, blind mover, single verdict — running Rust.
- `davegoldblatt/total-recall` (Feb, 201★): write-gated tiered memory for Claude Code — shipped.
- `adamabdo-xynora/mcp-capability-guard` (Aug 20): burned single-use warrants on MCP edges — shipped.
- Four arXiv papers Jun–Aug (2606.08021, 2606.28679, 2608.01710, 2608.08253).

Honest positioning that survives: not "the ideas, running" — it's **"the governed coupling,
running, with receipts, across four domains (product graph, fraud triage, memory, human
edge)."** The portfolio coherence is the differentiator; primacy claims are not defensible.

## 3. The flagship's memory claim is currently a stand-in — and fixing it just got cheap

"An unverified accusation never reaches memory" rests on midnight-reasoning, which KingPet
cites but does not install. As of tonight midnight-reasoning is **production-live**: real
Graphiti adapter (`scripts/graphiti_sidecar.py`), first real promote landed and recalled
(episode 7e37c5cb). Localizing it into KingPet is now wiring, not building — which argues for
moving roadmap item 4 ahead of items 2–3, so the flagship's most distinctive gate claim is
true before anyone sees the demo. Known limits that must not be demo-claimed until closed:
contradiction reconciliation untested, group isolation collapsed in v1 sidecar, lexical
60-episode recall (midnight-reasoning/KNOWN-GAPS.md).

## 4. Business context the roadmap should absorb

- Vendor sweep (live, 2026-08-27): no memory vendor sells write-time governance — white space
  real, buyer unproven. Falsifier: five discovery calls, script at
  `hq/outputs/memory-hygiene-discovery-script-2026-08-27.md`. No demos on discovery calls.
- ~55% estimate that a major vendor ships native governance within 9 months → the consulting
  window is now; the launch window follows the filing receipt.

## 5. Record moved out of the shipped ledger (2026-09-01)

`references/prior-art.md` ships to every install (midnight-agent-skills mirror, Kiel `.grok`),
so it no longer carries IP-process language or art that bears on the sealed component rather
than on this layer. Preserved here instead:

- 2026-08-27 this session disputed two references relayed from the red team — `sheeki03/tirith`
  (`crates/tirith-core/src/artifact/quarantine.rs`, public 2026-06-21) and
  `adamabdo-xynora/mcp-capability-guard` (first commit 2026-08-20T23:13:33Z) — and was wrong
  on both; verified at source the same day. Both already sit in `bouchard-breaker-ip/IDS-CANDIDATES.md`
  under the red team's judge-verified section. They are art for the sealed component's legs, not
  for this repo's closers/linter/memory companion, which is why they do not belong in the shipped
  ledger. Never filter material references here; route them to counsel via the IP repo.
- The corrected Total Recall identifier is `davegoldblatt/total-recall` (2026-02-05, 201★);
  two unrelated repos share the name.
