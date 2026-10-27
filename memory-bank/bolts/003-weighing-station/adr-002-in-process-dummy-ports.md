---
bolt: 003-weighing-station
created: 2026-10-26T14:46:00Z
status: accepted
superseded_by: null
---

# ADR-002: In-process Dummy OrgaTEX and Scale ports

## Context

The session domain must read recipes and live net weight without owning Dummy HTTP contracts. WeighingMS already hosts Dummy OrgaTEX and Dummy Scale in one local Fastify process. The session API could call those Dummies over HTTP (loopback) or through in-process ports.

## Decision

Use **hexagonal ports** (`OrgatexRecipePort`, `ScalePort`) with **in-process adapters** to the Dummy modules in the same Node process. The HMI later uses HTTP `/api/sessions*` and Dummy `/api/batches` / `/api/scales`; the domain does not HTTP-call itself.

## Rationale

In-process adapters keep Vitest fast (no listen), preserve Dummy APIs as the UI-facing contracts, and avoid inventing a second SETEX-like client.

### Alternatives Considered

1. **HTTP-to-self** (fetch localhost Dummy routes) — true network boundary, slower tests, port coupling, still not a real OrgaTEX client.
2. **UI reads Dummy APIs and posts numbers into session** — leaks live weight into UI-owned state; contradicts “net is not a UI-only number”.
3. **In-process ports (chosen)** — Dummy HTTP remains for the HMI; session use-cases talk ports.

## Consequences

### Positive

- Domain tests inject fake ports.
- One process, one SQLite file.
- Dummy HTTP contracts stay unchanged for bolt 006.

### Negative

- Adapters must stay in sync with Dummy route behaviour (503 unavailable, tare zeros net).
- Not a rehearsal of plant-network latency.

### Risks

- Accidental reuse of Dummy SQL inside domain — mitigated by ports only; domain never imports Dummy tables.

## Related

- **Stories**: 001-start-session-from-batch, 003-select-scale-and-tare, 004-evaluate-tolerance-and-confirm
- **Standards**: tech-stack Dummy HTTP; system-context Dummy vs conceptual plant
- **Previous ADRs**: ADR-001
