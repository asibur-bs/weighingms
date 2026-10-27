---
unit: 005-assisted-weighing-station-ui
intent: 001-assisted-weighing-station
phase: inception
status: complete
unit_type: frontend
default_bolt_type: simple-construction-bolt
created: '2026-10-26T13:58:00Z'
updated: '2026-10-26T13:58:00Z'
---

# Unit Brief: Assisted Weighing Station UI

## Purpose

Reproduce the functional experience of screens 1–3. Consume APIs. Do not copy prototype JavaScript. Do not hard-code the batch table as the live source.

## Scope

### In Scope
- S1 Select batch, S2 Weigh, S3 Confirm & print
- Bind to Dummy/session APIs
- Show tolerance states, scale switch, progression, failures
- Playwright happy path later

### Out of Scope
- Dummy server implementation
- Domain tolerance engine (owned by 003)

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-22 | No UI-hard-coded scenario data | Must |

Presents FR-01..FR-21; does not own Dummy contracts.

## Story Summary
- **Total Stories**: 4
- **Must Have**: 4
### Stories
- [x] **001-select-batch-screen** - Must
- [x] **002-weigh-screen** - Must
- [x] **003-confirm-print-screen** - Must
- [x] **004-show-device-failures** - Must

## Dependencies

Depends on 001, 002, 003, 004.

## Technical Context

Vite + React, localhost. Labels from prototype. Data from HTTP.

## Success Criteria

- [x] Network tab shows GET /api/batches on S1
- [x] Yellow RGB 3 kg; Sodium Sulphate 32 kg
- [x] Confirm disabled outside tolerance
- [x] No `const batches = [...]` as live source

## Bolt Suggestions

| Bolt | Type | Objective |
|------|------|-----------|
| Operator HMI | simple-construction-bolt | S1–S3 wired to APIs |
