---
id: 003-select-scale-and-tare
unit: 003-weighing-station
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 003-weighing-station
implemented: true
requirements:
  - FR-07
  - FR-08
---

# Story: 003-select-scale-and-tare

## User Story

**As a** operator
**I want** the component's seeded scale and tare applied
**So that** 3 kg vs 32 kg and net weight are correct

## Acceptance Criteria

- [ ] Given Yellow RGB, Then selected scale is 3 kg precision and unit g
- [ ] Given Sodium Sulphate, Then selected scale is 32 kg floor and unit kg
- [ ] When re-tare, Then net weight used for confirm is 0

## UI/UX impact

S2 scale badge and units

## API dependencies

002 Dummy Scale

## Test expectations

Test: switching component switches scale id

## Requirements

FR-07, FR-08

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 001-start-session-from-batch

### Enables
- 004-evaluate-tolerance-and-confirm

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Boundary target near both scales | use seeded assignment |

## Out of Scope

- Real auto-select threshold Q15
