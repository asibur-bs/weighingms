---
unit: 003-weighing-station
intent: 001-assisted-weighing-station
phase: inception
status: complete
unit_type: backend
default_bolt_type: ddd-construction-bolt
created: '2026-10-26T13:58:00Z'
updated: '2026-10-26T13:58:00Z'
---

# Unit Brief: Weighing Station (domain)

## Purpose

The weighing-session bounded context: one operator, one batch, one active component, tolerance, confirm, progression, completion, safe failure. This is not “the Weigh screen”.

## Scope

### In Scope
- Session start from selected batch/recipe
- Component identity, lot, container, tare policy, scale selection rule
- Target, remaining, tolerance evaluation, confirm record
- Overshoot detect+block (no auto-recalc)
- Progression Blue→…→Soda; complete only at 5/5
- Operator on every confirm
- Orchestrate Dummy failures into operator-safe states
- Override request log (no silent confirm)

### Out of Scope
- Dummy HTTP adapters (001, 002, 004)
- Pixel layout of S1–S3 (005)
- Recipe authoring

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-04 | Component identification | Must |
| FR-05 | Dyestuff lot | Must |
| FR-06 | Container | Must |
| FR-07 | Tare | Must |
| FR-08 | Scale selection | Must |
| FR-10 | Target quantity | Must |
| FR-11 | Remaining quantity | Must |
| FR-12 | Tolerance | Must |
| FR-13 | Confirmation | Must |
| FR-14 | Overshoot | Must |
| FR-15 | Component progression | Must |
| FR-16 | Batch completion | Must |
| FR-19 | Operator traceability | Must |
| FR-20 | Failures | Must |
| FR-21 | Supervisor override | Should |

## Domain Concepts

| Entity | Description |
|--------|-------------|
| WeighingSession | Operator + batch + component states |
| ComponentWeighing | Target, tol, actual, lot, container, tare, scale |
| ToleranceDecision | under / in / over |
| OverrideRequest | Logged, does not auto-confirm |

## Story Summary
- **Total Stories**: 8
- **Must Have**: 7
- **Should Have**: 1
### Stories
- [ ] **001-start-session-from-batch** - Must
- [ ] **002-identify-component-lot-container** - Must
- [ ] **003-select-scale-and-tare** - Must
- [ ] **004-evaluate-tolerance-and-confirm** - Must
- [ ] **005-progress-and-complete** - Must
- [ ] **006-overshoot-blocks-confirm** - Must
- [ ] **007-quit-and-incomplete-safe** - Must
- [ ] **008-operator-and-override** - Should

## Dependencies

| Unit | Reason |
|------|--------|
| 001-orgatex-integration | Recipe and consumption POST |
| 002-scale-integration | Live weight and tare |

Depended by: 004-ticket-printing, 005-ui

## Technical Context

DDD bolt: model session/tolerance before coding. Decimal/fixed-point for quantities. SQLite for confirmed records.

## Success Criteria

- [ ] Yellow RGB 93.4/93.5/94.0/94.5/94.6 confirm rules
- [ ] Cannot complete component without valid weight
- [ ] Cannot complete batch before 5/5
- [ ] Overshoot does not change remaining targets
- [ ] Scale/OrgaTEX down → cannot fake confirm/write-back

## Bolt Suggestions

| Bolt | Type | Objective |
|------|------|-----------|
| Weighing session domain | ddd-construction-bolt | FR-04..FR-16, FR-19..FR-21 |
