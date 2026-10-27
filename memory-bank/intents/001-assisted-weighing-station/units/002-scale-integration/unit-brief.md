---
unit: 002-scale-integration
intent: 001-assisted-weighing-station
phase: inception
status: complete
unit_type: backend
default_bolt_type: simple-construction-bolt
created: '2026-10-26T13:58:00Z'
updated: '2026-10-26T13:58:00Z'
---

# Unit Brief: Scale Integration (Dummy)

## Purpose

Dummy Scale API so live weight and tare come from a service, not from UI JavaScript variables.

## Scope

### In Scope
- GET `/api/scales`, status, weight; POST tare
- 3 kg precision and 32 kg floor
- Settable current weight for tests/demo
- Unavailable mode

### Out of Scope
- Tolerance math, confirm, recipe
- Real scale protocols

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-09 | Live weight | Must |

(Supports FR-07/FR-08 device I/O; those policies live in 003.)

## Story Summary
- **Total Stories**: 3
- **Must Have**: 3
### Stories
- [ ] **001-serve-scale-weight** - Must
- [ ] **002-tare-scale** - Must
- [ ] **003-scale-unavailable** - Must

## Dependencies

- Depends on: none
- Depended by: 003-weighing-station, 005-ui

## Success Criteria

- [ ] Weight GET returns Dummy state for the requested scale
- [ ] Tare zeroes net weight used by subsequent GET
- [ ] Unavailable → error, not a numeric 0 presented as a real reading

## Bolt Suggestions

| Bolt | Type | Objective |
|------|------|-----------|
| Dummy Scale API | simple-construction-bolt | FR-09 + tare/status |
