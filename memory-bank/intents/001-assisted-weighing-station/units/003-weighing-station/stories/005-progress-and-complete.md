---
id: 005-progress-and-complete
unit: 003-weighing-station
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 004-weighing-station
implemented: true
requirements:
  - FR-15
  - FR-16
---

# Story: 005-progress-and-complete

## User Story

**As a** operator
**I want** to complete Blue→Red→Yellow→Salt→Soda then batch
**So that** incomplete batches cannot finish

## Acceptance Criteria

- [ ] Given invalid weight, When confirm, Then component stays not done
- [ ] Given valid confirm, Then next pending becomes active
- [ ] Given 4/5 done, Then batch complete/write-back is not allowed
- [ ] Given 5/5 done, Then batch may complete

## UI/UX impact

S2 rail states; S3 only after 5/5

## API dependencies

session + 001 POST later

## Test expectations

Test: cannot complete at 4/5

## Requirements

FR-15, FR-16

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 004-evaluate-tolerance-and-confirm

### Enables
- ticket 001-generate-ticket

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Select a done component | ignored |

## Out of Scope

- Parallel multi-component weigh
