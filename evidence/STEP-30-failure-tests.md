# STEP 30 — Failure and recovery tests

Bolt: `006-assisted-weighing-station-ui`  
Command: `npx playwright test` (7 passed) plus existing `npm test` (47 passed)

| Scenario | Expected | Actual | Pass |
|----------|----------|--------|------|
| Scale unavailable | Confirm blocked; visible failure | Error banner + Confirm disabled + SCALE UNAVAILABLE status | Pass |
| OrgaTEX unavailable | Defined behaviour; no silent queue | Strip UNAVAILABLE; banner; queue rows cleared | Pass |
| Printer unavailable | Defined behaviour; no silent print | Print 503; banner; no ticket preview; strip UNAVAILABLE | Pass |
| Over tolerance | Cannot confirm | Yellow RGB 94.6 g: Confirm disabled; OVER TOLERANCE; surplus panel | Pass |
| Under tolerance | Cannot confirm | Yellow RGB 93.4 g: Confirm disabled; DISPENSE remaining | Pass |
| Re-tare | Weight reset | 50.0 g → Re-tare → 0.0 g; still on S2 | Pass |
| Quit | Safe exit | Returns to S1; S3 not shown; batch not completed | Pass |
| Incomplete batch | Cannot complete | Quit leaves session abandoned; S3/write-back not shown (API 409 covered in Vitest) | Pass |

Invalid weight is covered by Dummy Scale 503 (unavailable) rather than a NaN payload.
