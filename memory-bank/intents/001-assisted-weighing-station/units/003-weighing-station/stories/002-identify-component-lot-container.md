---
id: 002-identify-component-lot-container
unit: 003-weighing-station
intent: 001-assisted-weighing-station
status: complete
priority: must
created: '2026-10-26T14:00:00Z'
assigned_bolt: 003-weighing-station
implemented: true
requirements:
  - FR-04
  - FR-05
  - FR-06
---

# Story: 002-identify-component-lot-container

## User Story

**As a** operator
**I want** lot and container captured on the active component
**So that** confirm has traceability

## Acceptance Criteria

- [ ] Given Yellow RGB active, Then name DYE-4471, lot 2026-0387, container C-12 are on the session
- [ ] Given missing lot or container, When confirm attempted, Then confirm is rejected

## UI/UX impact

S2 meta line

## API dependencies

recipe fields from Dummy OrgaTEX

## Test expectations

Unit test: missing lot blocks confirm

## Requirements

FR-04, FR-05, FR-06

## Technical Notes

Training Dummy contracts only. Do not invent real OrgaTEX/device protocols. Do not create implementation tasks in this story.

## Dependencies

### Requires
- 001-start-session-from-batch

### Enables
- 004-evaluate-tolerance-and-confirm

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Wrong material vs recipe | cannot confirm |

## Out of Scope

- Physical barcode symbology
