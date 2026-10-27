import type { FastifyInstance } from "fastify";
import type Database from "better-sqlite3";
import type {
  BatchStatus,
  BatchSummary,
  ConsumptionBody,
  ConsumptionComponent,
  ConsumptionRecord,
  RecipeComponent,
} from "./types.ts";

function isUnavailable(db: Database.Database): boolean {
  const row = db
    .prepare(`SELECT value FROM dummy_flags WHERE name = 'orgatex_unavailable'`)
    .get() as { value: number } | undefined;
  return (row?.value ?? 0) === 1;
}

function sendUnavailable(reply: { code: (n: number) => { send: (b: unknown) => unknown } }) {
  return reply.code(503).send({ error: "orgatex_unavailable" });
}

function componentCount(db: Database.Database, batchId: string): number {
  const row = db
    .prepare(`SELECT COUNT(*) AS n FROM recipe_components WHERE batch_id = ?`)
    .get(batchId) as { n: number };
  return row.n;
}

function toSummary(
  db: Database.Database,
  row: {
    id: string;
    order_no: string;
    machine: string;
    fabric: string;
    shade: string;
    status: string;
  },
): BatchSummary {
  return {
    id: row.id,
    order: row.order_no,
    machine: row.machine,
    fabric: row.fabric,
    shade: row.shade,
    componentCount: componentCount(db, row.id),
    status: row.status as BatchStatus,
  };
}

export function registerOrgatexRoutes(app: FastifyInstance, db: Database.Database): void {
  app.get("/api/batches", async (_req, reply) => {
    if (isUnavailable(db)) return sendUnavailable(reply);
    const rows = db
      .prepare(
        `SELECT id, order_no, machine, fabric, shade, status FROM batches ORDER BY id`,
      )
      .all() as Array<{
      id: string;
      order_no: string;
      machine: string;
      fabric: string;
      shade: string;
      status: string;
    }>;
    return reply.code(200).send({ batches: rows.map((r) => toSummary(db, r)) });
  });

  app.get<{ Params: { batchId: string } }>("/api/batches/:batchId", async (req, reply) => {
    if (isUnavailable(db)) return sendUnavailable(reply);
    const row = db
      .prepare(
        `SELECT id, order_no, machine, fabric, shade, status FROM batches WHERE id = ?`,
      )
      .get(req.params.batchId) as
      | {
          id: string;
          order_no: string;
          machine: string;
          fabric: string;
          shade: string;
          status: string;
        }
      | undefined;
    if (!row) return reply.code(404).send({ error: "batch_not_found" });
    return reply.code(200).send(toSummary(db, row));
  });

  app.get<{ Params: { batchId: string } }>(
    "/api/batches/:batchId/recipe",
    async (req, reply) => {
      if (isUnavailable(db)) return sendUnavailable(reply);
      const exists = db
        .prepare(`SELECT id FROM batches WHERE id = ?`)
        .get(req.params.batchId);
      if (!exists) return reply.code(404).send({ error: "batch_not_found" });
      const rows = db
        .prepare(
          `SELECT seq, name, code, target, unit, tol, scale, lot, container, tare, tare_unit
           FROM recipe_components WHERE batch_id = ? ORDER BY seq`,
        )
        .all(req.params.batchId) as Array<{
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
      const components: RecipeComponent[] = rows.map((r) => ({
        seq: r.seq,
        name: r.name,
        code: r.code,
        target: r.target,
        unit: r.unit,
        tol: r.tol,
        scale: r.scale,
        lot: r.lot,
        container: r.container,
        tare: r.tare,
        tareUnit: r.tare_unit,
      }));
      return reply.code(200).send({ batchId: req.params.batchId, components });
    },
  );

  app.post<{ Params: { batchId: string }; Body: ConsumptionBody }>(
    "/api/batches/:batchId/consumption",
    {
      schema: {
        body: {
          type: "object",
          required: ["operator", "timestamp", "components"],
          properties: {
            operator: { type: "string", minLength: 1 },
            timestamp: { type: "string", minLength: 1 },
            components: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["code", "actual"],
                properties: {
                  code: { type: "string", minLength: 1 },
                  actual: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      if (isUnavailable(db)) return sendUnavailable(reply);
      const exists = db
        .prepare(`SELECT id FROM batches WHERE id = ?`)
        .get(req.params.batchId);
      if (!exists) return reply.code(404).send({ error: "batch_not_found" });

      const components: ConsumptionComponent[] = req.body.components.map((c) => ({
        code: c.code,
        actual: c.actual,
      }));
      const createdAt = new Date().toISOString();
      const info = db
        .prepare(
          `INSERT INTO consumption (batch_id, operator, timestamp, payload, created_at)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run(
          req.params.batchId,
          req.body.operator,
          req.body.timestamp,
          JSON.stringify(components),
          createdAt,
        );
      const record: ConsumptionRecord = {
        id: Number(info.lastInsertRowid),
        batchId: req.params.batchId,
        operator: req.body.operator,
        timestamp: req.body.timestamp,
        components,
      };
      return reply.code(201).send(record);
    },
  );

  app.get<{ Params: { batchId: string } }>(
    "/api/batches/:batchId/consumption",
    async (req, reply) => {
      if (isUnavailable(db)) return sendUnavailable(reply);
      const exists = db
        .prepare(`SELECT id FROM batches WHERE id = ?`)
        .get(req.params.batchId);
      if (!exists) return reply.code(404).send({ error: "batch_not_found" });
      const rows = db
        .prepare(
          `SELECT id, batch_id, operator, timestamp, payload FROM consumption
           WHERE batch_id = ? ORDER BY id`,
        )
        .all(req.params.batchId) as Array<{
        id: number;
        batch_id: string;
        operator: string;
        timestamp: string;
        payload: string;
      }>;
      const records: ConsumptionRecord[] = rows.map((r) => ({
        id: r.id,
        batchId: r.batch_id,
        operator: r.operator,
        timestamp: r.timestamp,
        components: JSON.parse(r.payload) as ConsumptionComponent[],
      }));
      return reply.code(200).send({ records });
    },
  );

  app.post<{ Body: { unavailable: boolean } }>(
    "/api/dummy/orgatex/unavailable",
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
      db.prepare(
        `INSERT INTO dummy_flags (name, value) VALUES ('orgatex_unavailable', ?)
         ON CONFLICT(name) DO UPDATE SET value = excluded.value`,
      ).run(req.body.unavailable ? 1 : 0);
      return reply.code(200).send({ unavailable: req.body.unavailable });
    },
  );
}
