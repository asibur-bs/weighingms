import type { FastifyInstance } from "fastify";
import type Database from "better-sqlite3";

/** Dummy Scanner: training batch-card code → batch id. Not a vendor protocol. */
export function registerScannerRoutes(app: FastifyInstance, db: Database.Database): void {
  app.get<{ Querystring: { code?: string } }>("/api/scanner/lookup", async (req, reply) => {
    const code = req.query.code?.trim();
    if (!code) return reply.code(400).send({ error: "code_required" });
    const row = db
      .prepare(`SELECT batch_id FROM scanner_codes WHERE code = ?`)
      .get(code) as { batch_id: string } | undefined;
    if (!row) return reply.code(404).send({ error: "code_not_found" });
    return reply.code(200).send({ batchId: row.batch_id });
  });
}
