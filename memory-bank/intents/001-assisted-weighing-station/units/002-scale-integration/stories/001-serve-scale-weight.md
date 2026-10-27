---
id: 001-serve-scale-weight
unit: 002-scale-integration
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 002-scale-integration
implemented: true
requirements:
  - FR-09
---

# Story: 001-serve-scale-weight

## User Story

**As a** weighing session
**I want** to read Dummy Scale catalogue and live net weight
**So that** Weighed now is not a UI-only number

## Acceptance Criteria

- [ ] Given Dummy Scale is up, When GET /api/scales, Then 3 kg precision and 32 kg floor exist
- [ ] Given a set weight on scale-3kg, When GET /api/scales/scale-3kg/weight, Then that net weight is returned

## UI/UX impact

S2 Weighed now; strip READY

## API dependencies

GET /api/scales, GET /api/scales/:id/weight

## Test expectations

API test: seedable weight readback

## Requirements

FR-09

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- None

### Enables
- 002-tare-scale

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Unknown scale | 404 |

## Out of Scope

- Industrial 10 Hz stream
