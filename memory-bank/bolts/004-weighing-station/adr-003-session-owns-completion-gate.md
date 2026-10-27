---
bolt: 004-weighing-station
created: 2026-10-26T15:03:00Z
status: accepted
superseded_by: null
---

# ADR-003: Session owns the 5/5 write-back gate

## Context

Dummy OrgaTEX (unit 001) already accepts `POST /api/batches/:id/consumption` and stores whatever body it is given. It does **not** know whether the weighing session finished 5/5. FR-16 and FR-17 require write-back only after all components are confirmed. If Dummy enforced 5/5, weighing rules would leak into the OrgaTEX stand-in. If the HMI posted consumption itself, CONFIRMED could appear without a session permit.

## Decision

The **weighing session** grants `CompletionPermit` (all components `done`, lifecycle not `abandoned`). Application then calls in-process `OrgatexConsumptionPort` (ADR-002). Dummy 2xx → session `completed`. Dummy 503 → session stays `open` with 5/5 done; no fake CONFIRMED. 4/5 and quit never call the port.

## Rationale

Weighing completeness is a session invariant. Dummy OrgaTEX remains a training store, not a second domain.

### Alternatives Considered

1. **Dummy OrgaTEX rejects 4/5** — duplicates session rules in unit 001; Dummy would need live session state.
2. **HMI POSTs consumption when the rail looks done** — UI becomes system of record; contradicts Dummy/session APIs.
3. **Session gate + Dummy store (chosen)** — one permit, existing Dummy contract, retry after 503.

## Consequences

### Positive

- 4/5 cannot write-back even if someone calls Dummy HTTP directly from a test that skips the session (HMI must use `/complete`).
- Unit 001 contracts stay unchanged.
- OrgaTEX unavailable is visible and retryable.

### Negative

- Direct Dummy consumption POST can still store a record (unit 001 behaviour). Training HMI must not use that path for completion.

### Risks

- Implementer “simplifies” by posting consumption from confirm of the last component — mitigated: only `POST /complete` may call the consumption port.

## Related

- **Stories**: 005-progress-and-complete, 007-quit-and-incomplete-safe
- **Standards**: FR-16, FR-17, FR-20; tech-stack Dummy consumption POST
- **Previous ADRs**: ADR-002
