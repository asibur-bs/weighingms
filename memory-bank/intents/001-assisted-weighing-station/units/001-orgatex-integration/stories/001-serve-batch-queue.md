---
id: 001-serve-batch-queue
unit: 001-orgatex-integration
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 001-orgatex-integration
implemented: true
requirements:
  - FR-01
---

# Story: 001-serve-batch-queue

## User Story

**As a** Dummy OrgaTEX consumer
**I want** to GET the station batch queue
**So that** the HMI can show work without hard-coded rows

## Acceptance Criteria

- [ ] Given Dummy OrgaTEX is up, When GET /api/batches, Then B-24187, B-24188, B-24190, B-24191 are returned with order, machine, shade, component count, status
- [ ] Given the endpoint is called, When inspecting the payload, Then it is JSON from the Dummy store not from a UI module

## UI/UX impact

S1 table is filled from this response

## API dependencies

GET /api/batches

## Test expectations

Contract test: four batches present; status codes 200

## Requirements

FR-01

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- None

### Enables
- 002-serve-batch-and-recipe

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Dummy empty | 200 with empty list, not 500 |

## Out of Scope

- Real SETEX API
