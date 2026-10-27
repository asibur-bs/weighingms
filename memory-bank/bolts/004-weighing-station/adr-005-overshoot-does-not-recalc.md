---
bolt: 004-weighing-station
created: 2026-10-26T15:03:00Z
status: accepted
superseded_by: null
---

# ADR-005: Overshoot never rewrites remaining targets

## Context

The supplied HTML prototype can show a surplus panel and imply remaining recipe quantities should change after an over-tolerance weigh. FR-14 and workbook STEP 24 leave surplus *compensation* unresolved. Training recovery is detect+block: component stays unconfirmed; operator uses Re-tare / restart. Copying the prototype table into `target_mg` would silently invent a shade-ratio rule.

## Decision

When zone is `over` (Yellow RGB 94.6 g = 94600 mg vs upper 94500 mg): confirm is 409 `zone_over`; surplus may be returned on evaluation for display; **`target_mg` and `tolerance_mg` on every component are immutable**. No UPDATE of remaining targets. Override (FR-21) logs a request and still does not confirm.

## Rationale

Confirmed requirement is detection and block only. Milligram integers (ADR-001) make “unchanged targets” an exact assertion.

### Alternatives Considered

1. **Apply prototype surplus table as new targets** — looks like the HTML; invents STEP 24; remaining Salt/Soda would change without an approved rule.
2. **Auto-split surplus onto later components by ratio** — real plant idea (brief A-08); not approved for training.
3. **Detect+block, freeze targets (chosen)** — matches FR-14; surplus optional for UI; STEP 24 can supersede this ADR later.

## Consequences

### Positive

- Tests can assert remaining `target_mg` after 94.6 g equals seed.
- HMI cannot “fix” overshoot by posting new targets.
- STEP 24 still has a place to land.

### Negative

- Prototype surplus UI must not be treated as live recipe edits.

### Risks

- Later bolt copies HTML JavaScript compensation — mitigated: this ADR + “read when” on any remaining-quantity change.

## Related

- **Stories**: 006-overshoot-blocks-confirm, 008-operator-and-override
- **Standards**: FR-14, FR-21; unresolved STEP 24 surplus compensation
- **Previous ADRs**: ADR-001
