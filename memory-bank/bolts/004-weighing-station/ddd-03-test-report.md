---
unit: 003-weighing-station
bolt: 004-weighing-station
stage: test
status: complete
updated: 2026-10-27T06:53:00Z
---

# Test Report - Weighing Station (progression and safety)

## Test Summary

- **Tests**: 44/44 passed (8 new session-progression API + 5 new domain + 31 regression)
- **Coverage**: not collected (contract + domain tests, not coverage-gated)

## Acceptance Criteria Validation

- ✅ **005-progress-and-complete**: invalid net stays not done; confirm advances next pending; `/active` skip is 409; done seq ignored; 4/5 complete 409; 5/5 posts Dummy consumption
- ✅ **006-overshoot-blocks-confirm**: Yellow RGB 94.6 g zone over, confirm 409, surplus 0.1 g, all five `target` values unchanged
- ✅ **007-quit-and-incomplete-safe**: Quit → pending not done; complete 409; Dummy down after 5/5 is 503, lifecycle stays `open`
- ✅ **008-operator-and-override**: empty operator confirm 409; override 201 log; 94.6 g still 409

## Unit Tests

`tests/unit/progression.test.ts` — next pending, 5/5 clears activeSeq, recipe_order vs ignored done, completionPermit, 94.6 g surplus 100 mg.

`tests/unit/tolerance.test.ts` — unchanged Yellow RGB band.

## Integration Tests

`tests/api/session-progression.test.ts` — Fastify inject: progression, 4/5 deny, 5/5 consumption GET, overshoot freeze, quit, override, Dummy OrgaTEX 503.

`tests/api/session.test.ts` — bolt 003 regression (Yellow reached by Blue then Red confirms).

## Security Tests

Anonymous confirm rejected (`missing_operator`). Override is a log, not a band bypass. No IdP in this lab.

## Performance Tests

Not applicable (localhost training API).

## Issues Found

None.

## Ready for Operations

- [x] All this bolt's acceptance criteria met
- [ ] Code coverage > 80% (not measured; not a lab gate)
- [x] No critical/high severity issues open
- [x] Performance targets N/A
- [x] 4/5 and Dummy-down cannot fake CONFIRMED write-back

Human `APPROVE TESTS` 2026-10-27T06:55:07Z. Bolt 004 complete. Unit 003-weighing-station complete.
