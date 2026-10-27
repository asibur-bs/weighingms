# WeighingMS

Training-time **Assisted Dyestuff Weighing Station**. Dummy OrgaTEX, scale, scanner, and printer. Not a SETEX plant contract. WeighingMS does not replace OrgaTEX.

Sources: `docs/brief.md`, `docs/customize-weighing-station.html`. Built with specs.md AI-DLC (Inception → Construction). Validation approved 2026-10-27.

## Run

Requires Node.js and npm. `better-sqlite3` needs native compile on first install.

```bash
npm install
npm start          # Dummy APIs  http://127.0.0.1:8787
npm run dev:web    # Operator HMI http://127.0.0.1:5173
```

Open **http://127.0.0.1:5173/**. Click training batch **B-24187**. There is no hardware scale — on the weigh screen use **Set dummy weight**, then **OK · Confirm**, for each of the five components.

Newcomer walkthrough (click-by-click): [`docs/HOW-TO-USE.md`](docs/HOW-TO-USE.md).

```bash
npm test           # Vitest 47
npm run test:e2e   # Playwright 7 (starts both servers if needed)
```

## Layout

```
docs/            Product brief and UI/UX prototype
memory-bank/     AI-DLC intent, requirements, units, bolts, ADRs
src/             Fastify Dummy host + weighing session
web/             Vite + React HMI (S1 queue, S2 weigh, S3 confirm/print)
tests/           Vitest unit/API + Playwright e2e (`tests/e2e/`)
playwright/      How to run and read the e2e suite
evidence/        Workbook STEP artifacts and live demo
FINAL-EVIDENCE.md
```

## Evidence

- Requirement matrix: [`FINAL-EVIDENCE.md`](FINAL-EVIDENCE.md)
- Package index (01–34): [`evidence/SUBMISSION-INDEX.md`](evidence/SUBMISSION-INDEX.md)
- Live B-24187 demo: [`evidence/STEP-35/STEP-35-demo.md`](evidence/STEP-35/STEP-35-demo.md)

Unresolved on purpose (Inception): live OrgaTEX, real printer language (Q18).
