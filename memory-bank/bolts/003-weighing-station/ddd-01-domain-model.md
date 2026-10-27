---
unit: 003-weighing-station
bolt: 003-weighing-station
stage: model
status: complete
updated: 2026-10-26T14:40:00Z
created: 2026-10-26T14:40:00Z
---

# Static Model - Weighing Station

## Bounded Context

**Weighing session.** One operator, one batch, one active component. This context owns session lifecycle, identity/lot/container, scale assignment, remaining, tolerance decision, and confirm records.

It **does not** own Dummy OrgaTEX recipes, Dummy Scale live weight, tickets, or HMI layout.

This bolt (003) covers start → identify → select scale/tare → evaluate and confirm Yellow RGB. Progression 5/5, overshoot-without-recalc, quit, and override log are the same aggregate in bolt 004 — named here so the boundary is not split into two session roots.

## Domain Entities

- **WeighingSession**: `id`, `batchId`, `operatorId`, `startedAt`, ordered `ComponentWeighing` list, `activeIndex`. Rules: cannot start without a recipe; one active incomplete component; operator required on the session; confirm is not anonymous.
- **ComponentWeighing**: `seq`, `name`, `code`, `state` (pending | active | done), `lot`, `container`, `recipeTare`, `tareUnit`, `scaleId`, `unit`, `target`, `tolerance`, `actual` (null until confirm). Rules: identity must match recipe code; missing lot or container blocks confirm; done cannot become active in this bolt (no restart yet).
- **ConfirmRecord**: `sessionId`, `componentSeq`, `actualWeight`, `operatorId`, `lot`, `container`, `tare`, `scaleId`, `timestamp`. Rules: written only after a valid confirm; immutable after write.

## Value Objects

- **Quantity**: `amount` + `unit` (`g` or `kg`). Decimal/fixed-point only. Same unit as the component/scale. Never mix g and kg in one comparison.
- **ToleranceBand**: `target`, `tolerance` → inclusive `[target − tolerance, target + tolerance]`. Yellow RGB training: 94.0 g ± 0.5 g → 93.5–94.5 g inclusive.
- **ToleranceZone**: `under` | `in` | `over`. Derived, not stored as a mutable flag the UI can set.
- **ScaleAssignment**: `scaleId` (`scale-3kg` | `scale-32kg`), `unit`. From recipe seed: Yellow RGB → 3 kg / g; Sodium Sulphate and Soda Ash → 32 kg / kg. No auto-threshold (Q15 unresolved).
- **OperatorId**: non-empty training identity (e.g. R. Karim). Required to start and to confirm.
- **LiveNetWeight**: `net` + `unit` + `scaleId` read from Dummy Scale. Invalid if scale unavailable — not treated as 0.

## Aggregates

- **WeighingSession (root)**
  - Members: ComponentWeighing list, current ScaleAssignment, last known LiveNetWeight (not the system of record for mass — Dummy Scale is), ConfirmRecords produced by this session.
  - Invariants:
    1. At most one `active` component.
    2. Confirm only if zone is `in`, lot and container present, code matches recipe, operator present, live net valid on the assigned scale.
    3. Remaining = max(0, target − live net) in component unit.
    4. Confirm persists the traceability set and marks that component `done`.
    5. Out-of-band net (`under` or `over`) cannot complete the component.
    6. Recipe targets are not rewritten on over-tolerance (bolt 004 restates; this bolt already forbids confirm).

## Domain Events

- **SessionStarted**: recipe loaded, first incomplete component active, operator attached.
- **ScaleSelected**: active component’s seeded scale id applied.
- **ScaleTared**: Dummy Scale tare accepted; net used for confirm is 0.
- **ToleranceEvaluated**: zone computed from live net vs band (does not persist a confirm).
- **ComponentConfirmed**: ConfirmRecord written; component `done`.
- **ConfirmRejected**: reason: missing lot/container/operator, identity mismatch, invalid weight, or zone not `in`.

## Domain Services

- **SessionFactory**: `startFromRecipe(batch, recipe, operator)` — maps Dummy OrgaTEX recipe into ComponentWeighing; first incomplete becomes active. Depends on recipe read (unit 001).
- **ToleranceService**: `zone(net, band)` — five Yellow RGB points: 93.4 under; 93.5/94.0/94.5 in; 94.6 over. Decimal compare, inclusive bounds.
- **RemainingService**: `remaining(target, net)` = max(0, target − net).
- **ScaleMappingService**: recipe scale label → `scale-3kg` / `scale-32kg`. Depends on Dummy Scale catalogue (unit 002) at the edge, not inside the formula.

Live weight fetch and POST tare are **application/infrastructure** adapters to Dummy Scale, not domain arithmetic.

## Repository Interfaces

- **WeighingSessionRepository**: Entity WeighingSession — `save`, `getById`, `getActiveByBatch`.
- **ConfirmRecordRepository**: Entity ConfirmRecord — `append`, `listBySession`.

No recipe repository in this context — recipe is inbound from Dummy OrgaTEX.

## Ubiquitous Language

- **Session**: the operator’s current weighing of one batch.
- **Active component**: the only component that may be confirmed now.
- **Net / Weighed now**: Dummy Scale net for the selected scale, used for remaining and tolerance.
- **Target**: recipe quantity; read-only in this context.
- **Remaining / Still to weigh**: max(0, target − net).
- **Tolerance / in band**: inclusive target ± tolerance.
- **Confirm**: persist actual and mark component done; only when in band.
- **Re-tare**: ask Dummy Scale to zero net; does not change recipe container tare shown from seed (Yellow RGB 214 g).
- **Scale assignment**: which Dummy Scale to read, from the recipe, not from UI guess.

## Stories covered

1. **001-start-session-from-batch** — SessionFactory + operator + first incomplete active.
2. **002-identify-component-lot-container** — lot/container on ComponentWeighing; missing blocks ConfirmRejected.
3. **003-select-scale-and-tare** — ScaleAssignment from seed; Re-tare → net 0 for confirm.
4. **004-evaluate-tolerance-and-confirm** — ToleranceBand/Zone; five Yellow RGB points; ConfirmRecord traceability set.

Out of this bolt (same context, bolt 004): progress to next / 5/5 complete, overshoot does not recalc recipe, quit, override log.
