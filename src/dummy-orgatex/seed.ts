import type Database from "better-sqlite3";
import type { RecipeComponent } from "./types.ts";

interface SeedBatch {
  id: string;
  order: string;
  machine: string;
  fabric: string;
  shade: string;
  status: "WEIGHING" | "QUEUED";
  components: RecipeComponent[];
}

const B24187_RECIPE: RecipeComponent[] = [
  {
    seq: 1,
    name: "Remazol Brill. Blue RSPL",
    code: "DYE-1180",
    target: 1240.0,
    unit: "g",
    tol: 6.0,
    scale: "3 kg precision",
    lot: "2026-0341",
    container: "C-09",
    tare: 214,
    tareUnit: "g",
  },
  {
    seq: 2,
    name: "Remazol Red RB",
    code: "DYE-2204",
    target: 386.0,
    unit: "g",
    tol: 2.0,
    scale: "3 kg precision",
    lot: "2026-0298",
    container: "C-11",
    tare: 214,
    tareUnit: "g",
  },
  {
    seq: 3,
    name: "Remazol Yellow RGB",
    code: "DYE-4471",
    target: 94.0,
    unit: "g",
    tol: 0.5,
    scale: "3 kg precision",
    lot: "2026-0387",
    container: "C-12",
    tare: 214,
    tareUnit: "g",
  },
  {
    seq: 4,
    name: "Sodium Sulphate",
    code: "AUX-0101",
    target: 24.0,
    unit: "kg",
    tol: 0.12,
    scale: "32 kg floor",
    lot: "2026-0112",
    container: "D-03",
    tare: 1.85,
    tareUnit: "kg",
  },
  {
    seq: 5,
    name: "Soda Ash",
    code: "AUX-0107",
    target: 9.6,
    unit: "kg",
    tol: 0.048,
    scale: "32 kg floor",
    lot: "2026-0155",
    container: "D-05",
    tare: 1.85,
    tareUnit: "kg",
  },
];

function placeholderRecipe(batchId: string, count: number): RecipeComponent[] {
  return Array.from({ length: count }, (_, i) => ({
    seq: i + 1,
    name: `Training placeholder ${i + 1}`,
    code: `TRN-${batchId}-${String(i + 1).padStart(2, "0")}`,
    target: 1,
    unit: "g",
    tol: 0.1,
    scale: "3 kg precision",
    lot: "TRAIN",
    container: `T-${String(i + 1).padStart(2, "0")}`,
    tare: 0,
    tareUnit: "g",
  }));
}

const SEED_BATCHES: SeedBatch[] = [
  {
    id: "B-24187",
    order: "SO-9931",
    machine: "JET-04",
    fabric: "100% CTN knit · 480 kg",
    shade: "Teal 4C",
    status: "WEIGHING",
    components: B24187_RECIPE,
  },
  {
    id: "B-24188",
    order: "SO-9931",
    machine: "JET-07",
    fabric: "100% CTN knit · 520 kg",
    shade: "Teal 4C",
    status: "QUEUED",
    components: placeholderRecipe("B-24188", 5),
  },
  {
    id: "B-24190",
    order: "SO-9944",
    machine: "JET-02",
    fabric: "CVC fleece · 310 kg",
    shade: "Navy 12",
    status: "QUEUED",
    components: placeholderRecipe("B-24190", 7),
  },
  {
    id: "B-24191",
    order: "SO-9947",
    machine: "WINCH-01",
    fabric: "Viscose jersey · 190 kg",
    shade: "Rose 08",
    status: "QUEUED",
    components: placeholderRecipe("B-24191", 4),
  },
];

/** Insert training batches if missing. Does not overwrite existing rows. */
export function seedDummyOrgatex(db: Database.Database): void {
  const insertBatch = db.prepare(
    `INSERT OR IGNORE INTO batches (id, order_no, machine, fabric, shade, status)
     VALUES (@id, @order_no, @machine, @fabric, @shade, @status)`,
  );
  const insertComponent = db.prepare(
    `INSERT OR IGNORE INTO recipe_components
     (batch_id, seq, name, code, target, unit, tol, scale, lot, container, tare, tare_unit)
     VALUES (@batch_id, @seq, @name, @code, @target, @unit, @tol, @scale, @lot, @container, @tare, @tare_unit)`,
  );
  const insertScan = db.prepare(
    `INSERT OR IGNORE INTO scanner_codes (code, batch_id) VALUES (?, ?)`,
  );

  const tx = db.transaction(() => {
    for (const batch of SEED_BATCHES) {
      insertBatch.run({
        id: batch.id,
        order_no: batch.order,
        machine: batch.machine,
        fabric: batch.fabric,
        shade: batch.shade,
        status: batch.status,
      });
      for (const c of batch.components) {
        insertComponent.run({
          batch_id: batch.id,
          seq: c.seq,
          name: c.name,
          code: c.code,
          target: c.target,
          unit: c.unit,
          tol: c.tol,
          scale: c.scale,
          lot: c.lot,
          container: c.container,
          tare: c.tare,
          tare_unit: c.tareUnit,
        });
      }
      insertScan.run(batch.id, batch.id);
    }
    db.prepare(
      `INSERT OR IGNORE INTO dummy_flags (name, value) VALUES ('orgatex_unavailable', 0)`,
    ).run();
  });
  tx();
}
