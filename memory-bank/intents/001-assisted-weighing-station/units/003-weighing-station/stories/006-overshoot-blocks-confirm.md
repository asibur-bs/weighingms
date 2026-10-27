---
id: 006-overshoot-blocks-confirm
unit: 003-weighing-station
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 004-weighing-station
implemented: true
requirements:
  - FR-14
---

# Story: 006-overshoot-blocks-confirm

## User Story

**As a** operator
**I want** over-tolerance weight is refused
**So that** surplus is visible and remaining targets are unchanged

## Acceptance Criteria

- [ ] Given Yellow RGB 94.6 g, Then Confirm disabled and OVER state shown
- [ ] Then remaining component targets are not recalculated

## UI/UX impact

S2 over status; surplus display optional; no auto-recalc

## API dependencies

weight from 002

## Test expectations

Test: 94.6 no confirm; targets unchanged

## Requirements

FR-14

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 004-evaluate-tolerance-and-confirm

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Prototype surplus table | must not be applied as new targets |

## Out of Scope

- STEP 24 future alternative rules
