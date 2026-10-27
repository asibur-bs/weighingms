---
id: 004-orgatex-unavailable
unit: 001-orgatex-integration
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 001-orgatex-integration
implemented: true
requirements:
  - FR-20
---

# Story: 004-orgatex-unavailable

## User Story

**As a** operator
**I want** to see OrgaTEX Dummy failure
**So that** the station does not fake a queue or CONFIRMED write-back

## Acceptance Criteria

- [ ] Given Dummy OrgaTEX is unavailable, When GET /api/batches, Then an error status is returned
- [ ] Given Dummy OrgaTEX is unavailable, When POST consumption, Then not 2xx

## UI/UX impact

S1/S3 error, no silent success

## API dependencies

same Dummy routes in error mode

## Test expectations

Failure test: unavailable flag

## Requirements

FR-20

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 001-serve-batch-queue

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Partial network | error, not empty success |

## Out of Scope

- Full offline sync queue (unresolved A-03)
