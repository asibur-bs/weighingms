---
created: 2026-10-27T07:33:00Z
intent: 001-assisted-weighing-station
validation: APPROVE VALIDATION 2026-10-27T07:32:00Z
tests: 54/54 (47 Vitest + 7 Playwright)
---

# FINAL-EVIDENCE — WeighingMS training station

Training product only. Dummy OrgaTEX / Scale / Scanner / Printer. Not a SETEX plant contract.

Legend: **✓** present · **—** not an HTTP Dummy API (domain/session) · **Pass** demonstrated

How to re-run: `npm start` (Dummy `:8787`) + `npm run dev:web` (HMI `:5173`) · `npm test` · `npm run test:e2e`

Workbook package 01–34: `evidence/SUBMISSION-INDEX.md`

| Requirement | UI | API | Code | Test | Evidence | Result |
|-------------|:--:|:---:|:----:|:----:|----------|:------:|
| Batch queue | ✓ | ✓ | ✓ | ✓ | `GET /api/batches` · `web/src/App.tsx` S1 · `src/dummy-orgatex/routes.ts` · `tests/api/orgatex.test.ts` · `tests/e2e/station.spec.ts` · `evidence/STEP-19-batch-screen.png` | Pass |
| Batch selection | ✓ | ✓ | ✓ | ✓ | Touch row / scan lookup · `GET /api/batches/B-24187` · `POST /api/sessions` · `tests/e2e/station.spec.ts` (network assertions) · `evidence/STEP-19-batch-screen.png` | Pass |
| Recipe | ✓ | ✓ | ✓ | ✓ | Recipe rail five components · `GET /api/batches/B-24187/recipe` · `src/dummy-orgatex/seed.ts` B-24187 · `tests/api/orgatex.test.ts` · `evidence/STEP-20-weigh-screen.png` · `evidence/STEP-17-dummy-data.json` | Pass |
| Scale selection | ✓ | ✓ | ✓ | ✓ | Badge 3 kg / 32 kg · `GET /api/scales` · `src/weighing/domain/scale-map.ts` · `tests/e2e/station.spec.ts` happy path · `evidence/STEP-20-weigh-screen.png` | Pass |
| Live weight | ✓ | ✓ | ✓ | ✓ | Weighed now from Dummy Scale · `GET /api/scales/:id/weight` · `src/dummy-scale/routes.ts` · `tests/api/scale.test.ts` · `tests/e2e/station.spec.ts` | Pass |
| Tolerance | ✓ | — | ✓ | ✓ | Yellow RGB 93.4 off / 93.5–94.5 on / 94.6 off · session `GET .../evaluation` (not a Dummy vendor API) · `src/weighing/domain/tolerance.ts` ADR-001 · `tests/unit/tolerance.test.ts` · `tests/e2e/station.spec.ts` | Pass |
| Lot tracking | ✓ | ✓ | ✓ | ✓ | LOT on weigh head (seed 2026-0387 for Yellow RGB) · recipe + confirm record · `src/weighing/application/session-service.ts` · `tests/api/session.test.ts` | Pass |
| Container/tare | ✓ | ✓ | ✓ | ✓ | Container + tare on S2; Re-tare F2 · `POST /api/sessions/:id/tare` · `tests/e2e/failures.spec.ts` Re-tare · `evidence/STEP-20-weigh-screen.png` | Pass |
| Component progression | ✓ | ✓ | ✓ | ✓ | Blue → Red → Yellow → Salt → Soda · `POST .../confirm` + ADR-004 · `src/weighing/domain/progression.ts` · `tests/api/session-progression.test.ts` · `tests/e2e/station.spec.ts` · `evidence/STEP-20-weigh-screen.png` | Pass |
| Overshoot | ✓ | ✓ | ✓ | ✓ | OVER TOLERANCE; Confirm blocked; no remaining-target rewrite · ADR-005 · `src/weighing/domain/overshoot.ts` · `tests/e2e/station.spec.ts` 94.6 g · `evidence/STEP-24-overshoot-ui.png` | Pass |
| OrgaTEX write-back | ✓ | ✓ | ✓ | ✓ | S3 CONFIRMED only after 2xx · `POST /api/sessions/:id/complete` → Dummy `POST /api/batches/:id/consumption` ADR-003 · `tests/api/session-progression.test.ts` · `tests/e2e/station.spec.ts` | Pass |
| Ticket | ✓ | ✓ | ✓ | ✓ | Print preview prototype fields · `POST /api/tickets` · `src/dummy-printer/routes.ts` · `tests/api/tickets.test.ts` · `tests/e2e/station.spec.ts` · `evidence/STEP-27-ticket.png` | Pass |

## Failure and recovery (FR-20)

| Scenario | Expected | Evidence | Result |
|----------|----------|----------|:------:|
| Scale unavailable | Confirm blocked; visible failure | `tests/e2e/failures.spec.ts` · `evidence/STEP-30-failure-tests.md` | Pass |
| OrgaTEX unavailable | Queue cleared; strip UNAVAILABLE | `tests/e2e/failures.spec.ts` · `tests/api/orgatex.test.ts` | Pass |
| Printer unavailable | No silent print | `tests/e2e/failures.spec.ts` · `tests/api/tickets.test.ts` | Pass |
| Quit | Does not complete component/batch | `tests/e2e/failures.spec.ts` · `tests/api/session-progression.test.ts` | Pass |
| Incomplete batch | No complete/write-back success | Vitest incomplete 409 · UI has no S3 until 5/5 | Pass |

## Automated proof

| Suite | Command | Result |
|-------|---------|--------|
| Dummy + session | `npm test` | 47/47 |
| Operator HMI e2e | `npm run test:e2e` | 7/7 |
| Playwright report | `evidence/STEP-29-playwright-report/` | Pass |
| Happy-path video | `evidence/STEP-29-e2e-video.webm` | Pass |

## Workbook notes

- Tolerance API column is **—** because confirm math is the weighing session (milligrams), not a Dummy vendor protocol.
- STEP 28 side-by-side prototype comparison folder was not produced; S1–S3 were verified in-browser and by Playwright instead.
- Real printer language (Q18) and live OrgaTEX remain unresolved, as approved at Inception.

## Live demonstration (STEP 35)

2026-10-27 on the running product (`:5173` HMI + `:8787` Dummy). Batch B-24187, operator R. Karim. Not slides.

| Part | Demonstrated | Evidence |
|------|--------------|----------|
| 1 Batch | Queue from API; selected B-24187 | `evidence/STEP-35/STEP-35-part1-queue.png` |
| 2 Recipe | Five components | `evidence/STEP-35/STEP-35-part2-recipe.png` |
| 3 Scale | 3 kg on Yellow RGB; 32 kg on Sodium Sulphate | `evidence/STEP-35/STEP-35-part3-scale-3kg.png` · `STEP-35-part3-scale-32kg.png` |
| 4 Tolerance | 93.4 g Confirm blocked; 94.0 g Confirm enabled | `evidence/STEP-35/STEP-35-part4-blocked.png` · `STEP-35-part4-inband.png` |
| 5 Complete | 5 of 5, all in tolerance, OrgaTEX CONFIRMED | `evidence/STEP-35/STEP-35-part5-complete.png` |
| 6 Integration | `GET /api/batches/B-24187/consumption` 200, record id 5 | `evidence/STEP-35/part6-consumption.json` |
| 7 Ticket | Dummy Printer preview, five TGT/ACT rows | `evidence/STEP-35/STEP-35-part7-ticket-body.png` |
| 8 Automated test | Playwright 7/7 passed | `evidence/STEP-35/STEP-35-part8-playwright.png` |

Log: `evidence/STEP-35/STEP-35-demo.md`
