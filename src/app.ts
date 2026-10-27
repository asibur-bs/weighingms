import Fastify, { type FastifyInstance } from "fastify";
import type Database from "better-sqlite3";
import { openDb } from "./db.ts";
import { registerOrgatexRoutes } from "./dummy-orgatex/routes.ts";
import { registerScannerRoutes } from "./dummy-orgatex/scanner-routes.ts";
import { seedDummyOrgatex } from "./dummy-orgatex/seed.ts";
import { registerPrinterRoutes } from "./dummy-printer/routes.ts";
import { registerScaleRoutes } from "./dummy-scale/routes.ts";
import { seedDummyScale } from "./dummy-scale/seed.ts";
import { registerWeighingRoutes } from "./weighing/routes.ts";

export interface CreateAppOptions {
  dbPath?: string;
  seed?: boolean;
  db?: Database.Database;
}

/** Build the Dummy API Fastify app. Callers own listen vs inject. */
export function createApp(options: CreateAppOptions = {}): FastifyInstance {
  const db = options.db ?? openDb(options.dbPath);
  if (options.seed !== false) {
    seedDummyOrgatex(db);
    seedDummyScale(db);
  }

  const app = Fastify({ logger: false });
  app.addHook("onRequest", async (req, reply) => {
    reply.header("Access-Control-Allow-Origin", req.headers.origin ?? "*");
    reply.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      return reply.code(204).send();
    }
  });
  registerOrgatexRoutes(app, db);
  registerScannerRoutes(app, db);
  registerScaleRoutes(app, db);
  registerWeighingRoutes(app, db);
  registerPrinterRoutes(app, db);
  app.addHook("onClose", () => {
    db.close();
  });
  return app;
}
