---
id: 002-tare-scale
unit: 002-scale-integration
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 002-scale-integration
implemented: true
requirements:
  - FR-07
---

# Story: 002-tare-scale

## User Story

**As a** operator via session
**I want** to tare the selected Dummy Scale
**So that** net weight used for confirm resets

## Acceptance Criteria

- [ ] Given a non-zero weight, When POST /api/scales/:id/tare, Then subsequent GET weight is 0 net
- [ ] Then tare is available for the confirm record

## UI/UX impact

S2 Re-tare F2

## API dependencies

POST /api/scales/:id/tare

## Test expectations

API test: tare then GET 0

## Requirements

FR-07

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
| Tare while unavailable | error |

## Out of Scope

- Physical scale protocol
