---
id: 002-weigh-screen
unit: 005-assisted-weighing-station-ui
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 006-assisted-weighing-station-ui
implemented: true
requirements:
  - FR-04..FR-16
  - FR-19
  - FR-22
---

# Story: 002-weigh-screen

## User Story

**As a** operator
**I want** to weigh with live Dummy weight, scale switch, tolerance, confirm
**So that** screen 2 matches the prototype functional experience

## Acceptance Criteria

- [ ] Yellow RGB shows 3 kg and g; Sodium Sulphate shows 32 kg and kg
- [ ] Weighed now comes from Dummy Scale GET
- [ ] Confirm disabled outside Yellow RGB 93.5–94.5 g and enabled inside
- [ ] Re-tare zeros net; Quit does not complete component
- [ ] Progress Blue→Red→Yellow→Salt→Soda

## UI/UX impact

S2 Weigh all components

## API dependencies

GET scales/weight, POST tare, session confirm APIs

## Test expectations

Playwright + unit-driven UI states

## Requirements

FR-04..FR-16, FR-19, FR-22

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 001-select-batch-screen, weighing stories

### Enables
- 003-confirm-print-screen

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Scale down | Confirm off |

## Out of Scope

- Copying prototype JS
