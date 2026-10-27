import type { FastifyInstance } from "fastify";
import type Database from "better-sqlite3";
import { fromMilligrams } from "../weighing/domain/quantity.ts";
import { sqliteSessionRepo } from "../weighing/infrastructure/sqlite-session-repo.ts";
import type { WeighingTicket } from "./types.ts";

const TITLE = "FCI DYEING — WEIGHING TICKET";
const FLAG = "printer_unavailable";

function printerUnavailable(db: Database.Database): boolean {
  const row = db
    .prepare(`SELECT value FROM dummy_flags WHERE name = ?`)
    .get(FLAG) as { value: number } | undefined;
  return (row?.value ?? 0) === 1;
}

function sendUnavailable(reply: { code: (n: number) => { send: (b: unknown) => unknown } }) {
  return reply.code(503).send({ error: "printer_unavailable" });
}

function rowToTicket(row: {
  id: number;
  session_id: string;
  payload: string;
}): WeighingTicket {
  const parsed = JSON.parse(row.payload) as Omit<WeighingTicket, "id">;
  return { ...parsed, id: row.id, sessionId: row.session_id };
}

export function registerPrinterRoutes(app: FastifyInstance, db: Database.Database): void {
  const sessions = sqliteSessionRepo(db);

  app.post<{ Body: { sessionId?: string } }>(
    "/api/tickets",
    {
      schema: {
        body: {
          type: "object",
          required: ["sessionId"],
          properties: { sessionId: { type: "string", minLength: 1 } },
        },
      },
    },
    async (req, reply) => {
      if (printerUnavailable(db)) return sendUnavailable(reply);
      const sessionId = req.body.sessionId as string;
      const session = sessions.getById(sessionId);
      if (!session) return reply.code(404).send({ error: "session_not_found" });
      if (session.lifecycle === "abandoned") {
        return reply.code(409).send({ error: "session_abandoned" });
      }
      if (session.lifecycle !== "completed") {
        return reply.code(409).send({ error: "incomplete" });
      }
      const batch = db
        .prepare(`SELECT id, order_no, machine, shade FROM batches WHERE id = ?`)
        .get(session.batchId) as
        | { id: string; order_no: string; machine: string; shade: string }
        | undefined;
      if (!batch) return reply.code(404).send({ error: "batch_not_found" });

      const createdAt = new Date().toISOString();
      const date = (session.completedAt ?? createdAt).slice(0, 10);
      const ticketBody: Omit<WeighingTicket, "id"> = {
        sessionId: session.id,
        title: TITLE,
        batch: batch.id,
        batchId: batch.id,
        barcode: batch.id,
        order: batch.order_no,
        machine: batch.machine,
        shade: batch.shade,
        date,
        operator: session.operatorId,
        components: session.components.map((c) => ({
          name: c.name,
          code: c.code,
          target: fromMilligrams(c.targetMg, c.unit),
          actual: c.actualMg === null ? null : fromMilligrams(c.actualMg, c.unit),
          unit: c.unit,
        })),
      };
      const info = db
        .prepare(
          `INSERT INTO tickets (session_id, batch_id, payload, created_at)
           VALUES (?, ?, ?, ?)`,
        )
        .run(session.id, batch.id, JSON.stringify(ticketBody), createdAt);
      const id = Number(info.lastInsertRowid);
      return reply.code(201).send({ ...ticketBody, id });
    },
  );

  app.get<{ Querystring: { batchId?: string } }>("/api/tickets", async (req, reply) => {
    if (printerUnavailable(db)) return sendUnavailable(reply);
    const batchId = req.query.batchId;
    if (!batchId) return reply.code(400).send({ error: "batchId_required" });
    const rows = db
      .prepare(
        `SELECT id, session_id, payload FROM tickets WHERE batch_id = ? ORDER BY id`,
      )
      .all(batchId) as Array<{ id: number; session_id: string; payload: string }>;
    return reply.code(200).send({ tickets: rows.map(rowToTicket) });
  });

  app.get<{ Params: { id: string } }>("/api/tickets/:id", async (req, reply) => {
    if (printerUnavailable(db)) return sendUnavailable(reply);
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return reply.code(404).send({ error: "ticket_not_found" });
    }
    const row = db
      .prepare(`SELECT id, session_id, payload FROM tickets WHERE id = ?`)
      .get(id) as { id: number; session_id: string; payload: string } | undefined;
    if (!row) return reply.code(404).send({ error: "ticket_not_found" });
    return reply.code(200).send(rowToTicket(row));
  });

  app.post<{ Body: { unavailable: boolean } }>(
    "/api/dummy/printer/unavailable",
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
        `INSERT INTO dummy_flags (name, value) VALUES (?, ?)
         ON CONFLICT(name) DO UPDATE SET value = excluded.value`,
      ).run(FLAG, req.body.unavailable ? 1 : 0);
      return reply.code(200).send({ unavailable: req.body.unavailable });
    },
  );
}
