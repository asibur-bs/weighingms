---
id: 001-select-batch-screen
unit: 005-assisted-weighing-station-ui
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 006-assisted-weighing-station-ui
implemented: true
requirements:
  - FR-01
  - FR-02
  - FR-03
  - FR-22
---

# Story: 001-select-batch-screen

## User Story

**As a** operator
**I want** to see the queue and select B-24187 from API data
**So that** screen 1 matches the prototype flow

## Acceptance Criteria

- [ ] Given Dummy OrgaTEX up, When opening S1, Then GET /api/batches is issued and rows render
- [ ] When selecting B-24187, Then GET batch and GET recipe are issued and S2 opens
- [ ] There is no live const batches = [...] source

## UI/UX impact

S1 Select batch

## API dependencies

GET /api/batches, /:id, /recipe

## Test expectations

Playwright: select B-24187; network assertions

## Requirements

FR-01, FR-02, FR-03, FR-22

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- orgatex 001, 002

### Enables
- 002-weigh-screen

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| OrgaTEX down | visible failure |

## Out of Scope

- Meeting simulate buttons
