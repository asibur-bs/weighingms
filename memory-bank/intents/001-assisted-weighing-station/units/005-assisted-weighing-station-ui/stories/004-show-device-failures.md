---
id: 004-show-device-failures
unit: 005-assisted-weighing-station-ui
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 006-assisted-weighing-station-ui
implemented: true
requirements:
  - FR-20
  - FR-22
---

# Story: 004-show-device-failures

## User Story

**As a** operator
**I want** to see scale/OrgaTEX/printer failure
**So that** no silent success on S1–S3

## Acceptance Criteria

- [ ] Each Dummy unavailable state is visible on the HMI
- [ ] Confirm/write-back/print success paths are blocked accordingly

## UI/UX impact

status strip + inline errors

## API dependencies

error responses from 001/002/004

## Test expectations

Failure UI tests

## Requirements

FR-20, FR-22

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 001-select-batch-screen

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Scanner down | touch select still works |

## Out of Scope

- Plant-wide monitoring
