---
stage: test
bolt: 002-scale-integration
created: 2026-10-26T14:37:00Z
---

# Test Report: 002-scale-integration

### Summary

- **Tests**: 15/15 passed (6 Dummy Scale + 9 Dummy OrgaTEX regression)
- **Coverage**: not collected (contract tests, not coverage-gated)

### Test Files

- [x] `tests/api/scale.test.ts` - Fastify inject tests for catalogue, seedable net, unknown id, tare-to-zero, unavailable weight, unavailable tare
- [x] `tests/api/orgatex.test.ts` - existing Dummy OrgaTEX suite still passing

### Acceptance Criteria Validation

- ✅ **GET /api/scales lists scale-3kg and scale-32kg**: 200
- ✅ **Seeded net on scale-3kg is returned by GET weight**: 94.2 g
- ✅ **Unknown scale id → 404**
- ✅ **POST tare then GET weight net is 0**
- ✅ **Unavailable GET weight is not 2xx and is not a valid numeric reading**: 503, no `net`
- ✅ **Tare while unavailable is not 2xx**: 503
- ✅ **No UI hard-coded live weight**: no React UI in this bolt
- ✅ **Vitest scale contract tests pass**: 6/6; full suite 15/15

### Issues Found

None.

### Notes

Bolt is not marked complete until human `APPROVE TESTS`. Dummy Printer remains bolt 005.
