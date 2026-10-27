---
stage: test
bolt: 006-assisted-weighing-station-ui
created: 2026-10-27T07:20:00Z
---

# Test Report: 006-assisted-weighing-station-ui

### Summary

- **Tests**: 54/54 passed (7 Playwright + 47 Vitest)
- **Coverage**: not collected (e2e + API contract, not coverage-gated)

### Test Files

- [x] `tests/e2e/station.spec.ts` - S1 network assertions; B-24187 five-component path; Yellow RGB band; ticket fields
- [x] `tests/e2e/failures.spec.ts` - OrgaTEX / scale / printer unavailable; re-tare; quit
- [x] existing Dummy OrgaTEX / Scale / session / ticket Vitest suites still passing

### Acceptance Criteria Validation

- ✅ **S1 from GET /api/batches**: Playwright records `/api/batches`, `/api/batches/B-24187`, `/api/batches/B-24187/recipe`; no live hard-coded table
- ✅ **S2 scale switch**: Yellow RGB 3 kg / g; Sodium Sulphate 32 kg / kg
- ✅ **Yellow RGB Confirm**: 93.4 disabled; 93.5 enabled; 94.0 enabled; 94.6 disabled
- ✅ **Progress Blue → Red → Yellow → Salt → Soda → S3 5 of 5**
- ✅ **S3 CONFIRMED only after complete**: write-back label CONFIRMED; Print shows stored ticket fields
- ✅ **Device failures visible**: OrgaTEX / scale / printer 503 paths block the matching success action
- ✅ **Existing `npm test`**: 47/47

### Issues Found

None in this run. Playwright `request` and page `fetch` both go through the Vite `/api` proxy to Dummy `:8787`.

### Notes

- Commands: `npm test` then `npm run test:e2e`
- HTML report: `evidence/STEP-29-playwright-report/`
- Happy-path video: `evidence/STEP-29-e2e-video.webm` (Playwright records WebM; local ffmpeg has no mp4 muxer)
- Failure matrix: `evidence/STEP-30-failure-tests.md`
Human `APPROVE TESTS` 2026-10-27T07:22:55Z. Bolt 006 complete. Unit 005 and intent 001 construction complete.
