import type Database from "better-sqlite3";
import type { QuantityUnit } from "../domain/quantity.ts";
import type {
  OrgatexConsumptionPort,
  OrgatexRecipePort,
  RecipeComponentIn,
  ScalePort,
  ScaleRead,
} from "../application/ports.ts";

function asUnit(u: string): QuantityUnit {
  return u === "kg" ? "kg" : "g";
}

export function sqliteOrgatexRecipePort(db: Database.Database): OrgatexRecipePort {
  return {
    getRecipe(batchId: string): RecipeComponentIn[] | null {
      const exists = db.prepare(`SELECT id FROM batches WHERE id = ?`).get(batchId);
      if (!exists) return null;
      const rows = db
        .prepare(
          `SELECT seq, name, code, target, unit, tol, scale, lot, container, tare, tare_unit
           FROM recipe_components WHERE batch_id = ? ORDER BY seq`,
        )
        .all(batchId) as Array<{
        seq: number;
        name: string;
        code: string;
        target: number;
        unit: string;
        tol: number;
        scale: string;
        lot: string;
        container: string;
        tare: number;
        tare_unit: string;
      }>;
      return rows.map((r) => ({
        seq: r.seq,
        name: r.name,
        code: r.code,
        target: r.target,
        unit: asUnit(r.unit),
        tol: r.tol,
        scale: r.scale,
        lot: r.lot,
        container: r.container,
        tare: r.tare,
        tareUnit: asUnit(r.tare_unit),
      }));
    },
  };
}

export function sqliteScalePort(db: Database.Database): ScalePort {
  const read = (scaleId: string): ScaleRead => {
    const row = db
      .prepare(`SELECT net, unit, unavailable FROM scales WHERE id = ?`)
      .get(scaleId) as { net: number; unit: string; unavailable: number } | undefined;
    if (!row) return { ok: false, unavailable: true };
    if (row.unavailable === 1) return { ok: false, unavailable: true };
    return { ok: true, net: row.net, unit: asUnit(row.unit) };
  };
  return {
    readWeight: read,
    tare(scaleId: string): ScaleRead {
      const current = read(scaleId);
      if (!current.ok) return current;
      db.prepare(`UPDATE scales SET net = 0, tare_value = 0, updated_at = ? WHERE id = ?`).run(
        new Date().toISOString(),
        scaleId,
      );
      return read(scaleId);
    },
  };
}

function orgatexUnavailable(db: Database.Database): boolean {
  const row = db
    .prepare(`SELECT value FROM dummy_flags WHERE name = 'orgatex_unavailable'`)
    .get() as { value: number } | undefined;
  return (row?.value ?? 0) === 1;
}

export function sqliteOrgatexConsumptionPort(db: Database.Database): OrgatexConsumptionPort {
  return {
    postConsumption(batchId, body) {
      if (orgatexUnavailable(db)) return { ok: false, unavailable: true };
      const exists = db.prepare(`SELECT id FROM batches WHERE id = ?`).get(batchId);
      if (!exists) return { ok: false, notFound: true };
      const createdAt = new Date().toISOString();
      const info = db
        .prepare(
          `INSERT INTO consumption (batch_id, operator, timestamp, payload, created_at)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run(batchId, body.operator, body.timestamp, JSON.stringify(body.components), createdAt);
      return {
        ok: true,
        record: {
          id: Number(info.lastInsertRowid),
          batchId,
          operator: body.operator,
          timestamp: body.timestamp,
          components: body.components,
        },
      };
    },
  };
}
