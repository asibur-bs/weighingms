# Playwright e2e

Operator HMI suite for WeighingMS. Specs live next to the API tests:

- `tests/e2e/station.spec.ts` — S1 queue from API; training dummy-weight panel; B-24187 five confirms, 3 kg → 32 kg, ticket
- `tests/e2e/failures.spec.ts` — OrgaTEX / scale / printer unavailable; Re-tare; Quit
- `tests/e2e/helpers.ts`

Config: `playwright.config.ts` (`testDir: tests/e2e`). HTML report: `evidence/STEP-29-playwright-report/`.

```bash
npm run test:e2e
npx playwright show-report evidence/STEP-29-playwright-report
```

Last captured result: **7/7 passed** (2026-10-27). Screenshot: `evidence/STEP-35/STEP-35-part8-playwright.png`.
