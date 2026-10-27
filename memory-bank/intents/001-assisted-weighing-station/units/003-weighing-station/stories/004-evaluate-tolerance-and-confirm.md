---
id: 004-evaluate-tolerance-and-confirm
unit: 003-weighing-station
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 003-weighing-station
implemented: true
requirements:
  - FR-10
  - FR-11
  - FR-12
  - FR-13
---

# Story: 004-evaluate-tolerance-and-confirm

## User Story

**As a** operator
**I want** to confirm only inside tolerance
**So that** out-of-band weights never complete a component

## Acceptance Criteria

- [ ] Given Yellow RGB 94.0 ±0.5 g: 93.4 cannot confirm; 93.5, 94.0, 94.5 can; 94.6 cannot
- [ ] When confirm in band, Then record actualWeight, operator, component, lot, container, tare, scale, timestamp
- [ ] Arithmetic uses decimal/fixed-point

## UI/UX impact

S2 OK Confirm enabled only in band

## API dependencies

live weight from 002

## Test expectations

Automated tests for five Yellow RGB points

## Requirements

FR-10, FR-11, FR-12, FR-13

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 002, 003

### Enables
- 005-progress-components-and-complete-batch

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| near 90% target | Confirm still off |

## Out of Scope

- FCI production tolerance origin
