---
intent: 001-assisted-weighing-station
phase: inception
status: complete
created: '2026-10-26T13:37:00Z'
updated: '2026-10-26T14:06:00Z'
approved_at: '2026-10-26T13:54:00Z'
inception_completed_at: '2026-10-26T14:06:00Z'
sources:
  - docs/brief.md
  - docs/customize-weighing-station.html
  - memory-bank/intents/001-assisted-weighing-station/intent.md
---

# Requirements: Assisted Dyestuff Weighing Station

### Inception Progress
- [x] Intent created (Checkpoint 1 approved 2026-10-26T13:51:00Z)
- [x] Requirements gathered (Checkpoint 2 approved 2026-10-26T13:54:00Z)
- [ ] Artifacts reviewed (Context + Units + Stories + Bolts)
- [ ] Ready for Construction

## Intent Overview

WeighingMS is a guided operator weighing station. OrgaTEX remains the production system that owns batches and recipes. WeighingMS does not replace OrgaTEX and does not automate dispensing.

This training product must reproduce the functional experience of `docs/customize-weighing-station.html` and consume Dummy APIs rather than hard-coded UI data.

How to read this document:

| Section | Meaning |
|---------|---------|
| Confirmed requirements | What this training product must do. Testable. Traced to brief and/or UI. |
| Training-only dummy behaviour | How Dummy APIs stand in for missing real systems. Not a claim about OrgaTEX. |
| Assumptions | Positively stated guesses from the brief or prototype. Not FCI-agreed. |
| Unresolved questions | Must not be silently invented. |

Do **not** invent real OrgaTEX, scale, scanner, or printer vendor contracts.

## Confirmed requirements

Each item: Description, Acceptance Criteria, Priority, Trace.

### FR-01: Batch queue

- **Description**: Display the station batch queue obtained from Dummy OrgaTEX. The training queue includes B-24187, B-24188, B-24190, B-24191 with order, machine, fabric/lot, shade, component count, and status.
- **Acceptance Criteria**:
  - Queue data is loaded from `GET /api/batches`, not from a UI constant array.
  - The four training batches are visible with batch, order, machine, shade, component count, status.
  - Selecting refresh/open of screen 1 issues the GET.
- **Priority**: Must
- **Trace**: Brief FR-01, FR-04; UI view `v-queue`; workbook item 1

### FR-02: Batch selection

- **Description**: The operator selects a batch by touching a queue row. Training also allows a Dummy Scanner stand-in to select the same batch. Selecting B-24187 is the primary demonstration path.
- **Acceptance Criteria**:
  - Touching B-24187 requests `GET /api/batches/B-24187`.
  - A batch not in a selectable/released/queued/weighing training state is rejected with a visible reason.
  - Selected batch context (order, machine, shade) is shown on subsequent screens.
- **Priority**: Must
- **Trace**: Brief FR-02, FR-03, FR-04; UI queue rows; workbook item 2

### FR-03: Recipe loading

- **Description**: On selecting a batch, load its recipe and component list from Dummy OrgaTEX.
- **Acceptance Criteria**:
  - Selection of B-24187 requests `GET /api/batches/B-24187/recipe`.
  - Recipe shows five components in order: Remazol Brill. Blue RSPL, Remazol Red RB, Remazol Yellow RGB, Sodium Sulphate, Soda Ash.
  - Component count displayed matches the recipe length (5 for B-24187).
- **Priority**: Must
- **Trace**: Brief FR-05, FR-06; UI recipe rail; workbook item 3

### FR-04: Component identification

- **Description**: The active component is identified by name and material code. Training may accept Dummy Scanner identity or an explicit confirm-identity action. One component is active at a time.
- **Acceptance Criteria**:
  - Active component name and code are visible (e.g. Remazol Yellow RGB / DYE-4471).
  - Identity shown matches the recipe component, not a free-typed unmatched material.
  - Completed components cannot be re-opened as the active weigh target unless a defined restart action exists.
- **Priority**: Must
- **Trace**: Brief FR-06, FR-09; UI weigh-head; workbook item 4

### FR-05: Dyestuff lot

- **Description**: Capture and display the dyestuff/auxiliary lot being consumed for the active component.
- **Acceptance Criteria**:
  - Lot is visible on the weigh screen (training seed for Yellow RGB: LOT 2026-0387).
  - Confirmed weighing record includes the lot.
  - Missing lot blocks confirmation.
- **Priority**: Must
- **Trace**: Brief FR-10, FR-25; UI meta line; workbook item 5

### FR-06: Container

- **Description**: Identify the container receiving the component and show its identifier on the weigh screen.
- **Acceptance Criteria**:
  - Container id is visible (training seed for Yellow RGB: C-12).
  - Confirmed weighing record includes container id.
  - Missing container id blocks confirmation.
- **Priority**: Must
- **Trace**: Brief FR-11; UI meta line Q29; workbook item 6

### FR-07: Tare

- **Description**: Apply container tare so live net weight is used for target/tolerance. Operator can Re-tare.
- **Acceptance Criteria**:
  - Tare value is displayed (training seed Yellow RGB: 214 g).
  - Re-tare resets the current net weight readout used for confirmation to 0.
  - Confirmed weighing record includes tare and the scale used to tare.
- **Priority**: Must
- **Trace**: Brief FR-11, FR-19; UI Re-tare F2; workbook item 7

### FR-08: Scale selection

- **Description**: Select the scale from the component's training scale assignment. Yellow RGB uses 3 kg precision; Sodium Sulphate uses 32 kg floor. Units follow the scale/component (g vs kg).
- **Acceptance Criteria**:
  - Active Yellow RGB shows "3 kg precision" and gram units.
  - Activating Sodium Sulphate shows "32 kg floor" and kilogram units.
  - Scale id used for weight reads is the selected scale, via Dummy Scale API.
  - Status strip shows selected scale readiness.
- **Priority**: Must
- **Trace**: Brief FR-07, FR-08; UI scale badge and notes; workbook items 8, 21
- **Note**: Real auto-selection threshold (brief Q15 / A-06) is unresolved. Training uses the per-component scale in the seeded recipe.

### FR-09: Live weight

- **Description**: Show current net weight from the Dummy Scale API for the selected scale.
- **Acceptance Criteria**:
  - Weigh screen "Weighed now" is populated from `GET /api/scales/:scaleId/weight` (or the approved equivalent), not from UI-local random numbers with no API.
  - Displayed unit matches the active component.
  - When Dummy Scale is unavailable, live weight is not silently faked; failure FR-20 applies.
- **Priority**: Must
- **Trace**: Brief FR-13, FR-14; UI live cell Q16; workbook item 9
- **Note**: Continuous ≥10 Hz industrial streaming (A-05) is unresolved. Training may poll Dummy Scale at a human-visible interval.

### FR-10: Target quantity

- **Description**: Display the recipe target for the active component.
- **Acceptance Criteria**:
  - Yellow RGB target displays 94.0 g.
  - Target comes from the loaded recipe, not a hard-coded screen literal independent of the API recipe.
- **Priority**: Must
- **Trace**: Brief FR-14; UI Target cell; workbook item 10

### FR-11: Remaining quantity

- **Description**: Display still-to-weigh as max(0, target − weighed now).
- **Acceptance Criteria**:
  - At 0.0 g on Yellow RGB, remaining is 94.0 g.
  - At 94.0 g, remaining is 0.0 g.
  - Remaining never displays a negative quantity.
- **Priority**: Must
- **Trace**: Brief FR-14; UI Still to weigh; workbook item 11

### FR-12: Tolerance

- **Description**: Evaluate net weight against target ± tolerance. For Yellow RGB: target 94.0 g, tolerance ±0.5 g (band 93.5–94.5 g).
- **Acceptance Criteria** (Yellow RGB):
  - 93.4 g → below tolerance; Confirm disabled.
  - 93.5 g → boundary; Confirm enabled.
  - 94.0 g → target; Confirm enabled.
  - 94.5 g → upper boundary; Confirm enabled.
  - 94.6 g → over; Confirm disabled.
  - UI shows the tolerance band and a distinct below / in / over state.
  - Automated tests cover these five points.
- **Priority**: Must
- **Trace**: Brief FR-15–FR-18; UI Yellow RGB `tol: 0.5`; workbook item 12, STEP 22

### FR-13: Confirmation

- **Description**: Confirm is enabled only while weight is within tolerance (unless a later approved override rule says otherwise). On confirm, record the traceability set.
- **Acceptance Criteria**:
  - Confirm disabled outside tolerance.
  - Confirm enabled inside tolerance, including exact boundaries.
  - On confirm, persist: actualWeight, operator, component, lot, container, tare, scale, timestamp.
  - Confirming a valid component marks it complete and is not undoable by a second accidental OK without an explicit restart action.
- **Priority**: Must
- **Trace**: Brief FR-18, FR-25; UI OK · Confirm; workbook items 13, 25

### FR-14: Overshoot

- **Description**: Detect weight above upper tolerance. Do **not** silently recalculate remaining recipe components. Training recovery is: component stays unconfirmed; operator uses Re-tare / restart / defined recovery. Automatic shade-ratio recalculation is out of training scope unless a later explicit decision approves it.
- **Acceptance Criteria**:
  - Over-tolerance weight disables Confirm.
  - UI indicates OVER TOLERANCE / surplus magnitude.
  - Remaining component targets are not changed automatically.
  - A recorded training decision document will exist before Construction implements any other surplus rule (workbook STEP 24).
- **Priority**: Must
- **Trace**: Brief FR-20–FR-24 (partial; A-08 unconfirmed); UI surplus panel is a proposal only; workbook item 14, STEP 24
- **Classification**: Confirmed *detection and block*; surplus compensation algorithm is unresolved (see Unresolved).

### FR-15: Component progression

- **Description**: Components complete in recipe sequence. A component cannot be marked complete unless its weight is valid. Batch cannot complete until all components are complete.
- **Acceptance Criteria**:
  - Sequence for B-24187: Blue RSPL → Red RB → Yellow RGB → Sodium Sulphate → Soda Ash.
  - Invalid weight cannot mark the component complete.
  - After a valid confirm, the next pending component becomes active (or the completion screen if none remain).
  - 4/5 complete cannot open batch-complete / write-back.
- **Priority**: Must
- **Trace**: Brief FR-06, FR-18; UI comps rail; workbook item 15, STEP 23

### FR-16: Batch completion

- **Description**: When 5/5 components are complete, the station enters Confirm & print. Batch cannot complete if any component is incomplete.
- **Acceptance Criteria**:
  - Completion screen shows 5 of 5 for B-24187.
  - Incomplete batch has no Complete/Write-back success path.
  - Quit / abandon from an in-progress component does not complete the batch.
- **Priority**: Must
- **Trace**: Brief FR-26; UI view `v-done`; workbook item 16

### FR-17: OrgaTEX write-back

- **Description**: On batch completion, post actual consumption to Dummy OrgaTEX. This is a training write-back, not a real SETEX contract.
- **Acceptance Criteria**:
  - Completing B-24187 sends `POST /api/batches/B-24187/consumption`.
  - Success is 2xx and a stored consumption record is inspectable.
  - UI shows write-back CONFIRMED only after Dummy OrgaTEX accepts the POST.
  - Payload includes per-component actuals plus operator and timestamp.
  - Dummy OrgaTEX unavailability does not report CONFIRMED.
- **Priority**: Must
- **Trace**: Brief FR-26, IR-05 (training substitute); UI "Written to OrgaTEX"; workbook item 17, STEP 26

### FR-18: Ticket generation

- **Description**: After successful completion, generate a weighing ticket through Dummy Printer API. Ticket content follows the prototype fields (training layout).
- **Acceptance Criteria**:
  - Generate issues `POST /api/tickets`.
  - Ticket includes: Batch, Order, Machine, Shade, Date, Operator, Components with Target and Actual, barcode/batch id.
  - Print / print-preview is available on screen 3.
  - Dummy Printer unavailability does not silently invent a successful print.
- **Priority**: Must
- **Trace**: Brief FR-27; UI ticket block; workbook item 18, STEP 27
- **Note**: Real printer language and FCI label spec (Q18 / A-04) remain unresolved.

### FR-19: Operator traceability

- **Description**: Every session has an identified operator. Confirmed weighings, write-back, and tickets record that operator.
- **Acceptance Criteria**:
  - Operator identity is visible on the HMI (training seed may be R. Karim / Shift A).
  - Confirmation record, consumption POST, and ticket all include the same operator id.
  - There is no anonymous confirm path.
- **Priority**: Must
- **Trace**: Brief FR-25, FR-34, BR-19; UI op-chip Q37; workbook item 19
- **Note**: Real individual login vs shared station identity (Q37) is unresolved. Training uses session operator ID per approved tech-stack.

### FR-20: Scale / scanner / printer / OrgaTEX failure

- **Description**: Device and Dummy API failures are visible and safe. The operator cannot confirm a weighing without a usable scale weight. Batch cannot complete with a fake write-back. Print cannot claim success if Dummy Printer failed.
- **Acceptance Criteria**:
  - Scale unavailable → live weight not treated as valid; Confirm disabled; visible failure.
  - OrgaTEX unavailable → queue/recipe load or write-back fails with defined visible behaviour; no silent CONFIRMED write-back.
  - Printer unavailable → defined visible behaviour; no silent successful print.
  - Scanner unavailable → batch/material identification can still use touch selection where that path is defined; failure is visible if scan is required for the current action.
  - Invalid / under / over weight → cannot confirm (FR-12, FR-14).
  - Re-tare → net weight used for confirm resets.
  - Quit → leaves the current weighing without marking the component complete.
  - Incomplete batch → cannot complete / write-back.
- **Priority**: Must
- **Trace**: Brief FR-12, FR-30–FR-33 (training-reduced); UI status strip; workbook item 20, STEP 30

### FR-21: Supervisor override (training-limited)

- **Description**: UI exposes Supervisor Override. Training records an override request. Authorised override of tolerance is not implemented as a silent auto-confirm until a later explicit rule is approved.
- **Acceptance Criteria**:
  - Override control is visible on the weigh screen.
  - Activating it is logged (operator, component, timestamp, reason/status).
  - It does not, by default, confirm an over-tolerance weight.
- **Priority**: Should
- **Trace**: Brief FR-18, FR-35, FR-36; UI Supervisor override Q33

### FR-22: UI must not embed scenario tables as the system of record

- **Description**: Screens consume Dummy APIs. Hard-coded `const batches = [...]` (or equivalent) as the live data source is forbidden.
- **Acceptance Criteria**: Network (or in-process HTTP) calls to `/api/batches`, recipe, scales, consumption, tickets occur on the demonstration path.
- **Priority**: Must
- **Trace**: Workbook Rule 5; STEP 19

## Non-functional requirements (training)

Do not treat brief production NFRs (99% availability, IP54, 200 ms industrial lag) as confirmed FCI obligations for this lab.

### NFR-01: Local demonstration

- **Metric**: Application runs on localhost from the approved TypeScript / Vite / Fastify / SQLite stack.
- **Priority**: Must

### NFR-02: Testability

- **Metric**: Tolerance band (FR-12) has automated tests. Happy-path B-24187 has a Playwright path (workbook STEP 29).
- **Priority**: Must

### NFR-03: Quantity arithmetic

- **Metric**: Weight arithmetic uses decimal/fixed-point, not IEEE float as the source of truth for confirm decisions (brief NFR-16, adopted as training rule).
- **Priority**: Must

### NFR-04: Operator HMI usability (training)

- **Metric**: Three screens exist with the prototype labels: Select batch, Weigh, Confirm & print. Primary confirm/re-tare/quit actions are reachable without opening a developer console.
- **Priority**: Must
- **Trace**: UI; brief NFR-07 reduced for lab

### NFR-05: Durability of a confirmed weighing (training)

- **Metric**: A confirmed component remains recorded in SQLite after process restart of Dummy APIs.
- **Priority**: Should
- **Trace**: Brief NFR-05 reduced for lab

## Training-only dummy behaviour

These are product behaviours of Dummy APIs. They are **not** SETEX/OrgaTEX or device vendor contracts.

| Dummy | Behaviour |
|-------|-----------|
| Dummy OrgaTEX | Serves seeded batches and recipes. Accepts POST consumption and stores the record. Returns 2xx on success and an error status when the dummy is set unavailable. |
| Dummy Scale | Catalogue includes 3 kg precision and 32 kg floor. GET weight returns the current training weight for that scale. POST tare zeroes net weight. Can be set unavailable. |
| Dummy Scanner | Optional: accepting a scanned batch/material code maps to the same selection as touch. May be simulated by posting a code to a dummy endpoint. |
| Dummy Printer | POST `/api/tickets` stores ticket payload and returns 2xx, or error when unavailable. Preview may render stored ticket JSON/HTML. |
| Seed | Batch B-24187 / SO-9931 / JET-04 / Teal 4C; five components with prototype targets, tols, lots, containers, tares, scales. |

## Assumptions

| ID | Assumption | Risk if invalid | Mitigation |
|----|------------|-----------------|------------|
| TA-01 | Dummy HTTP contracts in tech-stack.md are sufficient for the lab | Construction blocked on invented vendor APIs | Keep Dummy routes stable; never label them as real OrgaTEX |
| TA-02 | Prototype field labels are the training UX vocabulary | Operators/FCI use different terms | Trace labels to HTML; rename only if Intent is revised |
| TA-03 | One component at a time against an OrgaTEX-owned queue | Workflow is actually parallel multi-component | Unresolved at FCI; training follows prototype |
| TA-04 | Session operator ID satisfies traceability for the lab | Real plant requires badge SSO | Unresolved Q37; do not build Auth0 |
| A-01…A-15 | Brief assumptions remain unconfirmed | Treating them as fact | Listed as unresolved / not implemented as production claims |

## Unresolved questions

Do not invent answers during Construction.

| Topic | Why it is open | Training stance |
|-------|----------------|-----------------|
| Real OrgaTEX API | Brief Q6–Q13, A-01, A-02 | Dummy OrgaTEX only |
| Continuous vs stabilised weight | Brief Q16, A-05 | Dummy poll/read is enough to demonstrate live weight |
| Scale models, protocol, auto-select threshold | Brief Q15, A-06 | Seeded per-component scale |
| Tolerance origin (OrgaTEX vs local rule) | Brief Q24, A-07 | Seeded per-component absolute tolerance from prototype |
| Surplus compensation meaning | Brief Q25–Q26, A-08 | Detect + block; no auto-recalc until STEP 24 decision |
| Container identity / one vs many components per container | Brief Q29 | Seeded container ids |
| Override authority | Brief Q33 | Control visible; no silent confirm |
| Ticket printer language/layout | Brief Q18, A-04 | Prototype ticket fields |
| Operator login mechanism | Brief Q37 | Session operator ID |
| Offline sync with real OrgaTEX | Brief Q13, A-03 | Dummy unavailability is a visible failure; full offline sync is out of training Must scope |
| 41 brief open questions / A-01…A-15 generally | Brief preamble | Remain unknown |

## Constraints

### Technical (intent-specific)

- UI must call Dummy APIs.
- Do not copy the prototype's JavaScript as the application implementation.
- Do not invent SETEX REST/OPC-UA/DB contracts.

### Business

- WeighingMS does not replace OrgaTEX.
- Dispensing stays manual.
- Training stack is localhost TypeScript / Fastify / SQLite as approved.

## Open Questions (owner)

| Question | Owner | Resolution |
|----------|-------|------------|
| Surplus handling training rule | Human, STEP 24 | Pending |
| Whether Dummy Scanner is a required path vs touch-only | Human, if UI analysis demands it | Pending; touch selection is Must |
| Full offline queue/sync | Out of training Must unless later approved | Unresolved |

## Requirement quality checklist (for Checkpoint 2)

- [ ] Each Must FR is understandable
- [ ] Each Must FR is testable
- [ ] Each Must FR traces to brief and/or UI
- [ ] Dummy vs real contracts are distinguished
- [ ] Overshoot is not silently copied from the prototype recalculation
