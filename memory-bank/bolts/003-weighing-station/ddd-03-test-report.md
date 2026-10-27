---
unit: 003-weighing-station
bolt: 003-weighing-station
stage: test
status: complete
updated: 2026-10-26T14:52:00Z
---

# Test Report - Weighing Station

## Test Summary

- **Tests**: 31/31 passed (8 new session API + 8 new domain + 15 Dummy regression)
- **Coverage**: not collected (contract + domain tests, not coverage-gated)

## Acceptance Criteria Validation

- ✅ **001-start-session-from-batch**: B-24187 starts; first incomplete (Blue RSPL) active; operator attached
- ✅ **002-identify-component-lot-container**: Yellow RGB lot 2026-0387 / C-12; empty lot → 409 missing_lot
- ✅ **003-select-scale-and-tare**: Yellow RGB scale-3kg / g; Sodium Sulphate scale-32kg / kg; tare net 0
- ✅ **004-evaluate-tolerance-and-confirm**: 93.4/94.6 cannot confirm; 93.5/94.0/94.5 in band; 94.0 confirm persists actual

## Unit Tests

`tests/unit/tolerance.test.ts` — milligram band for five Yellow RGB points; remaining never negative; confirmReasons for missing lot/container/operator, identity mismatch, invalid weight.

## Integration Tests

`tests/api/session.test.ts` — Fastify inject against Dummy seed: start, activate seq 3, five-point evaluation, confirm/reject, tare, missing lot via store, scale 503.

## Security Tests

Training operatorId required on start (400 if empty). No IdP in this lab.

## Performance Tests

Not applicable (localhost training API).

## Issues Found

None.

## Ready for Operations

- [x] All this bolt's acceptance criteria met
- [ ] Code coverage > 80% (not measured; not a lab gate)
- [x] No critical/high severity issues open
- [x] Performance targets N/A
- [x] Scale-down cannot fake confirm

Human `APPROVE TESTS` 2026-10-26T14:55:32Z. Bolt 003 complete. Unit 003 remains open for bolt 004.
