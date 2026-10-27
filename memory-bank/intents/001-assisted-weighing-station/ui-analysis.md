---
intent: 001-assisted-weighing-station
source: docs/customize-weighing-station.html
created: 2026-10-26T13:54:00Z
status: extracted
---

# UI/UX analysis — customize-weighing-station.html

Do not redesign. This extracts what the prototype already contains so Construction can reproduce the functional experience.

The HTML itself says it is **not a specification**. Values, layout, and surplus behaviour are proposals. Training requirements already decided: Dummy APIs, no auto-recalc on overshoot.

## 1. Screen inventory

| ID | Prototype view | Title | DOM | Purpose |
|----|----------------|-------|-----|---------|
| S1 | `queue` | 1 · Select batch | `#v-queue` | Scan or touch-select a batch from OrgaTEX queue |
| S2 | `weigh` | 2 · Weigh | `#v-weigh` | Guided weigh of the active component |
| S3 | `done` | 3 · Confirm & print | `#v-done` | Batch complete, OrgaTEX write-back, ticket |

Chrome shared across S1–S3:

- Top bar: WeighingMS STATION 01, batch/order/machine crumb, operator chip
- Bottom strip: scale 3 kg, scale 32 kg, scanner, printer, OrgaTEX link, language EN, clock

Meeting-only chrome (not part of the station product): Screen segment buttons, Simulate dispense/overshoot/Reset, question-pin toggle.

## 2. UI components

**S1 Select batch**

- Scan prompt (“Scan a batch card to begin” / touch a row)
- Queue table: Batch, Order, Machine, Fabric/lot, Shade, Comp., Status
- Status tags: WEIGHING, QUEUED
- Selected-row highlight (B-24187)

**S2 Weigh**

- Recipe rail: shade, batch, N of 5 components weighed, component list
- Component row: swatch, name, code, scale hint, target qty, state (✓ actual / WEIGHING / PENDING)
- Weigh head: material name, code · LOT · CONTAINER · TARE
- Scale badge: selected scale + “automatic”
- Readout cells: Weighed now, Still to weigh, Target
- Progress bar with tolerance band and target line
- Status line (DISPENSE / WITHIN TOLERANCE / OVER TOLERANCE)
- Surplus panel (proposal — not approved training rule)
- Actions: OK · Confirm (F1), Re-tare (F2), Quit (F4), Supervisor override

**S3 Confirm & print**

- Summary: components 5 of 5, all within tolerance, total dispensed, elapsed, operator, Written to OrgaTEX CONFIRMED
- Actions: Print ticket (F1), Next batch (F3)
- Ticket: FCI DYEING — WEIGHING TICKET with batch/order/machine/shade/date/operator, component TGT/ACT, barcode, batch id

## 3. User actions

| Action | Where | Prototype behaviour |
|--------|-------|---------------------|
| Touch queue row | S1 | (Displayed; selection wiring is meeting-chrome `showView`) |
| Scan batch card | S1 | Prompted; not implemented as a real scanner |
| Select pending component | S2 rail | `select(i)` — done components ignored; active switches; weight reset |
| Simulate dispense | Meeting chrome | Animate weight to target + 0.4×tol (lands in band) |
| Simulate overshoot | Meeting chrome | Animate to target + 4.8×tol (over) |
| Reset / Re-tare | S2 | `now = 0` |
| Quit | S2 | Same as reset in prototype (training: must not complete component) |
| OK · Confirm | S2 | Only if zone === ok; stores actual; next pending or S3 |
| Supervisor override | S2 | Status text only: AWAITING SUPERVISOR |
| Print ticket | S3 | Button present; no printer call |
| Next batch | S3 | Button present; no navigation logic |

## 4. Application states

**View state:** `queue` | `weigh` | `done`

**Component state:** `pending` | `active` | `done`

**Weight zone:** `under` | `near` (≥90% of target) | `ok` (in ±tol) | `over` (> target+tol)

**Device strip:** READY / LINKED (static in prototype)

**Override:** none | requested (status text only)

## 5. Data displayed

From prototype seed for B-24187:

| Field | Example |
|-------|---------|
| Batch / order / machine | B-24187 / SO-9931 / JET-04 |
| Shade | Teal 4C |
| Operator | R. Karim · Shift A |
| Components | 5 |
| Blue RSPL | 1240.0 g ±6.0, 3 kg, done 1241.5 g, lot 2026-0341, C-09, tare 214 |
| Red RB | 386.0 g ±2.0, 3 kg, done 385.4 g, lot 2026-0298, C-11, tare 214 |
| Yellow RGB | 94.0 g ±0.5, 3 kg, active, lot 2026-0387, C-12, tare 214 |
| Sodium Sulphate | 24.000 kg ±0.120, 32 kg floor, pending, D-03, tare 1.850 |
| Soda Ash | 9.600 kg ±0.048, 32 kg floor, pending, D-05, tare 1.850 |

Ticket also shows TGT/ACT pairs and “ALL WITHIN TOLERANCE”.

## 6. Data required (must come from Dummy APIs in the product)

- Batch queue list
- Batch header
- Recipe components: name, code, sequence, target, unit, tolerance, scale id, lot, container, tare
- Live net weight from selected scale
- Scale status
- Operator identity
- Consumption write-back result
- Ticket payload / print result
- Device availability (scale, scanner, printer, OrgaTEX)

## 7. State transitions

```
[S1 queue]
   select B-24187 + load recipe
        → [S2 weigh, first incomplete component active, now=0]

[S2 weigh]
   weight under/near     → Confirm disabled; DISPENSE remaining
   weight in ±tol        → Confirm enabled; WITHIN TOLERANCE
   weight over           → Confirm disabled; OVER TOLERANCE; surplus panel ON
   Re-tare / Reset       → now=0; stay on component
   Quit (product rule)   → do not mark complete (prototype only resets weight)
   Confirm (zone=ok)     → component done; next pending active
   no pending left       → [S3 done]
   select other pending  → that component active; now=0
   select done           → ignored

[S3 done]
   Print ticket          → Dummy Printer
   Next batch            → [S1 queue]
```

## 8. Validation behaviour

Embedded in `zone(v)` / `paint()`:

- `over` if v > target + tol
- `ok` if v >= target − tol (and not over)
- `near` if v >= 0.9 × target (visual only; Confirm still disabled unless ok)
- else `under`
- `$("btn-ok").disabled = (z !== "ok")`
- Remaining = max(0, target − now)
- g formatted to 1 decimal; kg to 3 decimals
- Done components not selectable

Yellow RGB demonstration band: 93.5–94.5 g.

## 9. Integration points (conceptual vs prototype)

| Point | Prototype | Product (training) |
|-------|-----------|---------------------|
| OrgaTEX queue | Hard-coded table | GET /api/batches |
| Batch + recipe | Hard-coded `components` | GET batch + GET recipe |
| Scale weight | JS variable `now` | GET /api/scales/:id/weight |
| Tare | Reset `now` | POST tare + local net |
| Write-back | Static “CONFIRMED” text | POST /api/batches/:id/consumption |
| Printer | Static ticket HTML | POST /api/tickets |
| Scanner | Prompt copy only | Dummy scan or touch |
| Device strip | Static READY/LINKED | Dummy status |

## 10. Business rules in JavaScript

From `docs/customize-weighing-station.html` `<script>`:

1. Five-component recipe with per-component target, unit, tol, scale, max, lot, container, tare.
2. One active component; done cannot be reselected.
3. Confirm allowed only in `ok` zone.
4. Confirm stores `actual = now`, marks `done`, activates next `pending`, or `showView("done")`.
5. Scale and units are properties of the component (Yellow RGB → 3 kg/g; sulphate → 32 kg/kg).
6. Overshoot shows surplus panel; Confirm stays disabled. Panel copy **proposes** remaining-component recalculation — not executed in JS.
7. Simulate dispense lands inside tolerance (target + 0.4×tol). Simulate overshoot lands over (target + 4.8×tol).
8. Re-tare/Reset/Quit all call `reset()` (weight to 0). Product requirements distinguish Quit from Re-tare.
9. Override does not confirm; it only changes status text.
10. `near` is cosmetic (90% of target), not a confirm-enabling state.

## 11. Assumptions represented by the prototype

- Weight can be read continuously (live cell + progress bar).
- Surplus compensation means recalculating remaining components (stated as a proposal).
- One operator weighs one component at a time against an OrgaTEX-owned queue.
- Two scales: 3 kg precision and 32 kg floor; auto-selected from component.
- English UI; operator R. Karim; station 01.
- Ticket layout invented (“Label content is invented”).
- Queue times and OrgaTEX “LINKED” are decoration.
- Meeting simulation buttons stand in for real pouring/scale stream.

## 12. Questions the prototype cannot answer

Mapped to pins / brief: Q6–Q13 OrgaTEX; Q15 scale protocol and auto-select threshold; Q16 continuous vs stabilised; Q18 printer; Q24 tolerance source; Q25–Q26 surplus meaning; Q29 container model; Q33 override authority; Q35 language; Q37 operator login.

Also cannot answer: real API payloads, failure/retry, incomplete-batch lock, reprint, offline sync, scanner symbology, 21-key hardware.

## Construction implications (already in approved requirements)

- Reproduce S1–S3 functional experience; do not copy this JavaScript.
- Drive data from Dummy APIs.
- Keep Yellow RGB 94.0 ± 0.5 g and 3 kg / 32 kg switch.
- Do not implement surplus recalculation unless STEP 24 explicitly approves it.
