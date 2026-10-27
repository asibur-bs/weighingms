# STEP 35 — Final demonstration (live product)

Date: 2026-10-27  
Station: WeighingMS HMI `http://127.0.0.1:5173/` · Dummy host `http://127.0.0.1:8787/`  
Scenario: batch **B-24187** · order SO-9931 · machine JET-04 · shade Teal 4C · operator R. Karim  
Not slides. Screenshots and API traces below were taken from the running app.

## Part 1 — Batch

Queue loaded from Dummy OrgaTEX (`GET /api/batches`), not UI constants. Selected B-24187 (WEIGHING, 5 components).

Evidence: `STEP-35-part1-queue.png`

## Part 2 — Recipe

Weigh screen showed the five-component rail from `GET /api/batches/B-24187/recipe`:

1. Remazol Brill. Blue RSPL — 1240.0 g ±6.0 · 3 kg
2. Remazol Red RB — 386.0 g ±2.0 · 3 kg
3. Remazol Yellow RGB — 94.0 g ±0.5 · 3 kg
4. Sodium Sulphate — 24.000 kg ±0.120 · 32 kg
5. Soda Ash — 9.600 kg ±0.048 · 32 kg

Evidence: `STEP-35-part2-recipe.png`

## Part 3 — Scale

Yellow RGB used the **3 kg** precision scale (`SCALE 3 kg · READY`).  
After Yellow RGB, Sodium Sulphate switched to the **32 kg** floor scale (`SCALE 32 kg · READY`).

Evidence: `STEP-35-part3-scale-3kg.png`, `STEP-35-part3-scale-32kg.png`

## Part 4 — Tolerance

Yellow RGB target 94.0 g ±0.5 g (band 93.5–94.5 g).

- Invalid: 93.4 g → Confirm disabled (below band).
- In band: 94.0 g → WITHIN TOLERANCE, Confirm enabled.

Evidence: `STEP-35-part4-blocked.png`, `STEP-35-part4-inband.png`

## Part 5 — Complete

All five components confirmed. S3: **Batch B-24187 weighed** · Components weighed **5 of 5** · All within tolerance **YES** · Written to OrgaTEX **CONFIRMED**.

Evidence: `STEP-35-part5-complete.png`

## Part 6 — Integration

Session complete wrote consumption to Dummy OrgaTEX. Stored record inspected:

```
GET /api/batches/B-24187/consumption  →  200
id 5 · operator R. Karim · timestamp 2026-10-27T07:36:23.791Z
DYE-1180 1240 · DYE-2204 386 · DYE-4471 94 · AUX-0101 24 · AUX-0107 9.6
```

Evidence: `part6-consumption.json`

## Part 7 — Ticket

Print ticket (F1) called Dummy Printer `POST /api/tickets` for the completed session. Preview on S3:

- Header: FCI DYEING — WEIGHING TICKET · B-24187 · SO-9931 · JET-04 · Teal 4C · 2026-10-27 · R. Karim
- Five TGT/ACT rows matching the consumption actuals
- ALL WITHIN TOLERANCE · barcode B-24187
- Device strip: both scales READY, scanner LINKED, printer READY, OrgaTEX LINKED

Evidence: `STEP-35-part7-ticket.png`, `STEP-35-part7-ticket-body.png`, `part7-ticket.txt`

## Part 8 — Automated test

Playwright HTML report served from `evidence/STEP-29-playwright-report/` at `http://127.0.0.1:9323/`.

**All 7 · Passed 7 · Failed 0 · Flaky 0 · Skipped 0** · chromium · 2026-10-27 1:20:36 PM · 19.6s

- `failures.spec.ts` — OrgaTEX down, scale down, printer down, Re-tare, Quit
- `station.spec.ts` — S1 queue from API; B-24187 happy path (five confirms, scale switch, ticket)

Evidence: `STEP-35-part8-playwright.png` · full report `../STEP-29-playwright-report/`
