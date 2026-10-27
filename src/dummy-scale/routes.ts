import type { FastifyInstance } from "fastify";
import type Database from "better-sqlite3";
import type { ScaleRow, ScaleState, ScaleStatus, ScaleSummary, ScaleWeight } from "./types.ts";

function getScale(db: Database.Database, scaleId: string): ScaleRow | undefined {
  return db.prepare(`SELECT * FROM scales WHERE id = ?`).get(scaleId) as ScaleRow | undefined;
}

function nowIso(): string {
  return new Date().toISOString();
}

function toSummary(row: ScaleRow): ScaleSummary {
  return {
    id: row.id,
    name: row.name,
    capacityKg: row.capacity_kg,
    unit: row.unit,
  };
}

function toStatus(row: ScaleRow): ScaleStatus {
  const unavailable = row.unavailable === 1;
  const state: ScaleState = unavailable ? "UNAVAILABLE" : "READY";
  return {
    scaleId: row.id,
    name: row.name,
    ready: !unavailable,
    state,
  };
}

function toWeight(row: ScaleRow): ScaleWeight {
  return {
    scaleId: row.id,
    net: row.net,
    unit: row.unit,
    tare: row.tare_value,
  };
}

export function registerScaleRoutes(app: FastifyInstance, db: Database.Database): void {
  app.get("/api/scales", async (_req, reply) => {
    const rows = db
      .prepare(`SELECT * FROM scales ORDER BY capacity_kg`)
      .all() as ScaleRow[];
    return reply.code(200).send({ scales: rows.map(toSummary) });
  });

  app.get<{ Params: { scaleId: string } }>(
    "/api/scales/:scaleId/status",
    async (req, reply) => {
      const row = getScale(db, req.params.scaleId);
      if (!row) return reply.code(404).send({ error: "scale_not_found" });
      return reply.code(200).send(toStatus(row));
    },
  );

  app.get<{ Params: { scaleId: string } }>(
    "/api/scales/:scaleId/weight",
    async (req, reply) => {
      const row = getScale(db, req.params.scaleId);
      if (!row) return reply.code(404).send({ error: "scale_not_found" });
      if (row.unavailable === 1) {
        return reply.code(503).send({ error: "scale_unavailable" });
      }
      return reply.code(200).send(toWeight(row));
    },
  );

  app.post<{ Params: { scaleId: string } }>(
    "/api/scales/:scaleId/tare",
    async (req, reply) => {
      const row = getScale(db, req.params.scaleId);
      if (!row) return reply.code(404).send({ error: "scale_not_found" });
      if (row.unavailable === 1) {
        return reply.code(503).send({ error: "scale_unavailable" });
      }
      db.prepare(
        `UPDATE scales SET net = 0, tare_value = 0, updated_at = ? WHERE id = ?`,
      ).run(nowIso(), row.id);
      const updated = getScale(db, row.id);
      return reply.code(200).send(toWeight(updated as ScaleRow));
    },
  );

  app.post<{ Params: { scaleId: string }; Body: { net: number } }>(
    "/api/dummy/scales/:scaleId/weight",
    {
      schema: {
        body: {
          type: "object",
          required: ["net"],
          properties: { net: { type: "number" } },
        },
      },
    },
    async (req, reply) => {
      const row = getScale(db, req.params.scaleId);
      if (!row) return reply.code(404).send({ error: "scale_not_found" });
      if (row.unavailable === 1) {
        return reply.code(503).send({ error: "scale_unavailable" });
      }
      db.prepare(`UPDATE scales SET net = ?, updated_at = ? WHERE id = ?`).run(
        req.body.net,
        nowIso(),
        row.id,
      );
      const updated = getScale(db, row.id);
      return reply.code(200).send(toWeight(updated as ScaleRow));
    },
  );

  app.post<{ Params: { scaleId: string }; Body: { unavailable: boolean } }>(
    "/api/dummy/scales/:scaleId/unavailable",
    {
      schema: {
        body: {
          type: "object",
          required: ["unavailable"],
          properties: { unavailable: { type: "boolean" } },
        },
      },
    },
    async (req, reply) => {
      const row = getScale(db, req.params.scaleId);
      if (!row) return reply.code(404).send({ error: "scale_not_found" });
      db.prepare(`UPDATE scales SET unavailable = ?, updated_at = ? WHERE id = ?`).run(
        req.body.unavailable ? 1 : 0,
        nowIso(),
        row.id,
      );
      const updated = getScale(db, row.id) as ScaleRow;
      return reply.code(200).send({
        scaleId: updated.id,
        unavailable: updated.unavailable === 1,
      });
    },
  );
}
