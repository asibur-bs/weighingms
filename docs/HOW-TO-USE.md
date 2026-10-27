# How to use WeighingMS

This is a **training** weighing station. It is not connected to a real dyehouse, scale, scanner, or printer. Dummy OrgaTEX sends the batch list; you type a dummy weight on screen in place of pouring powder onto a scale.

You will use **two terminals** and **one browser**. Follow the steps in order.

## 0. What you are doing

An operator weighs five recipe components for batch **B-24187** (shade Teal 4C, machine JET-04).

1. **Queue** — pick the batch.
2. **Weigh** — for each component, set a dummy weight that sits inside the green tolerance band, then confirm.
3. **Done** — print the ticket.

There is no hardware. The weigh screen has a **Training · dummy scale** box. That box is the scale.

## 1. Start the two programs

Open a terminal in the project folder (`weighingms`). First time only:

```bash
npm install
```

**Terminal 1** — Dummy APIs (OrgaTEX, scale, printer):

```bash
npm start
```

Wait until you see `WeighingMS Dummy APIs http://127.0.0.1:8787`. Leave this terminal running.

**Terminal 2** — Operator screen:

```bash
npm run dev:web
```

Wait until Vite is ready. Leave this terminal running.

**Browser** — open [http://127.0.0.1:5173/](http://127.0.0.1:5173/).

If the table is empty or the page cannot load, Terminal 1 is not running.

## 2. Queue screen — pick the training batch

You should see:

- Title **Scan a batch card to begin**
- Operator chip **R. Karim · Shift A**
- A table of batches
- Bottom strip: SCALE 3 kg, SCALE 32 kg, SCANNER, PRINTER, ORGATEX all green / READY or LINKED

**Click the row `B-24187`.**

(You can also type `B-24187` in **Batch code** and click **Lookup**.)

The weigh screen opens. The left rail lists five components. The first one, **Remazol Brill. Blue RSPL**, is marked WEIGHING.

## 3. Weigh screen — one component at a time

Look at three numbers:

| Label | Meaning |
|---|---|
| **Target** | How much this component should weigh |
| **Weighed now** | What the dummy scale currently reads (starts at 0) |
| **Still to weigh** | Target minus weighed now |

**OK · Confirm** stays grey until **Weighed now** is inside the tolerance band (shown under the bar).

Do this for every component:

1. The **Dummy net** box is already filled with the target. Leave it as-is for a clean run.
2. Click **Set dummy weight**.
3. Wait until **Weighed now** matches that number and the status line says **WITHIN TOLERANCE**.
4. Click **OK · Confirm**.
5. The rail marks that row ✓ and moves to the next component. Repeat.

Use these values if you retype them yourself:

| Step | Component (left rail) | Scale badge | Dummy net | Band |
|---|---|---|---|---|
| 1 | Remazol Brill. Blue RSPL | 3 kg precision | `1240` | 1234.0–1246.0 g |
| 2 | Remazol Red RB | 3 kg precision | `386` | 384.0–388.0 g |
| 3 | Remazol Yellow RGB | 3 kg precision | `94` | 93.5–94.5 g |
| 4 | Sodium Sulphate | 32 kg floor | `24` | 23.880–24.120 kg |
| 5 | Soda Ash | 32 kg floor | `9.6` | 9.552–9.648 kg |

After step 3 the scale badge must switch from **3 kg precision** to **32 kg floor**. That is automatic.

### Optional: see Confirm lock (Yellow RGB only)

Before you confirm Yellow RGB:

1. Type `93.4` → **Set dummy weight**. Confirm stays grey (below band).
2. Type `94.6` → **Set dummy weight**. Status is **OVER TOLERANCE**; Confirm stays grey.
3. Type `94` → **Set dummy weight**. Status is **WITHIN TOLERANCE**. Click **OK · Confirm**.

## 4. Done screen — print the ticket

After the fifth confirm you should see:

- **Batch B-24187 weighed**
- Components weighed **5 of 5**
- All within tolerance **YES**
- Written to OrgaTEX **CONFIRMED**

Click **Print ticket**. A paper-style preview appears on the right (FCI DYEING — WEIGHING TICKET).

Click **Next batch** to return to the queue.

## 5. If something goes wrong

| What you see | What to do |
|---|---|
| Page will not load | Start Terminal 2 (`npm run dev:web`) |
| Empty table / ORGATEX UNAVAILABLE | Start Terminal 1 (`npm start`) and refresh the browser |
| **OK · Confirm** grey | Dummy weight is outside the band, or you have not clicked **Set dummy weight** yet |
| **SCALE UNAVAILABLE** | Stop Terminal 1, start `npm start` again, refresh |
| Want a clean start | Stop Terminal 1, start `npm start` again, then refresh the browser |

Do not use **Quit** unless you want to abandon the batch and return to the queue. **Re-tare** zeros the dummy reading (Weighed now → 0). **Supervisor override** only shows AWAITING SUPERVISOR; it does not confirm for you.
