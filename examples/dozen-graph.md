# Dozen — reference product graph

Agent-first marketplace: brands paste a brief; agents assemble 6–16 micros (1k–50k followers). The model drafts. It does not own FTC, fake-engagement, accept, post, or pay.

## Node table

| Node | Depends on | Owns | Done when |
|------|------------|------|-----------|
| intake | — | parsed brief | Budget ≥ $200, niche + platform present |
| safety | intake | policy | Fail-closed banned verticals |
| assemble | safety | slot list | 6–16 micros, fee math, fake-risk cap |
| offer | assemble | payouts | Payout inside each creator's rate band |
| accept | offer | slot.status | ≥60% accept **or explicit** bench refill |
| draft | accept | captions | Drafts exist only for accepted seats |
| verify | draft | verifier[] | FTC + must-say + avoid |
| revise | verify | same captions | ≤2 selective retries on this subgraph only |
| review | revise | brand taste | Brand sees only the batch |
| post | review | live URLs | Disclosure still present on every accepted slot |
| measure | post | ER | Not anomalous vs baseline |
| pay | measure | escrow | Posted + no open dispute |

## Closed loops

- **Inner:** draft → verify → revise (max 2). Intake and assemble are not restarted.
- **Outer:** accept stays `running` until the threshold or an explicit refill. Post stays `running` until every accepted slot posts.

## What was wrong in the one-pass build

Accept and post were auto-marked passed so the demo could finish in one handler. That violated the skill. They are now real nodes.
