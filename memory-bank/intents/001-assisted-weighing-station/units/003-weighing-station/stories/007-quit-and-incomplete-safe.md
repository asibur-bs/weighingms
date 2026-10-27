---
id: 007-quit-and-incomplete-safe
unit: 003-weighing-station
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 004-weighing-station
implemented: true
requirements:
  - FR-16
  - FR-20
---

# Story: 007-quit-and-incomplete-safe

## User Story

**As a** operator
**I want** to quit or leave a batch unfinished
**So that** nothing is marked complete incorrectly

## Acceptance Criteria

- [ ] When Quit, Then active component is not marked done
- [ ] When batch incomplete, Then consumption POST is not allowed

## UI/UX impact

S2 Quit F4; no S3 success

## API dependencies

none extra

## Test expectations

Test: quit then component still pending

## Requirements

FR-16, FR-20

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 001-start-session-from-batch

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Quit vs Re-tare | Re-tare zeros weight; Quit does not complete |

## Out of Scope

- Resume-after-power-loss NFR beyond persist confirms
