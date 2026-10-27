---
id: 003-scale-unavailable
unit: 002-scale-integration
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 002-scale-integration
implemented: true
requirements:
  - FR-20
---

# Story: 003-scale-unavailable

## User Story

**As a** operator
**I want** to see scale failure
**So that** Confirm cannot use a fake weight

## Acceptance Criteria

- [ ] Given Dummy Scale unavailable, When GET weight, Then error not a valid numeric reading
- [ ] Then session must treat weight as invalid

## UI/UX impact

S2 Confirm disabled; strip failure

## API dependencies

GET weight error

## Test expectations

Failure test

## Requirements

FR-20

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 001-serve-scale-weight

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Timeout | same as unavailable |

## Out of Scope

- Hardware diagnostics
