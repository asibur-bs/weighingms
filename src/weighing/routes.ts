import type { FastifyInstance } from "fastify";
import type Database from "better-sqlite3";
import { createSessionService, SessionError } from "./application/session-service.ts";
import {
  sqliteOrgatexConsumptionPort,
  sqliteOrgatexRecipePort,
  sqliteScalePort,
} from "./infrastructure/dummy-ports.ts";
import {
  sqliteConfirmRepo,
  sqliteOverrideRepo,
  sqliteSessionRepo,
} from "./infrastructure/sqlite-session-repo.ts";

function sendErr(reply: { code: (n: number) => { send: (b: unknown) => unknown } }, err: SessionError) {
  return reply.code(err.http).send({
    error: err.code,
    reasons: err.reasons,
  });
}

export function registerWeighingRoutes(app: FastifyInstance, db: Database.Database): void {
  const service = createSessionService({
    sessions: sqliteSessionRepo(db),
    confirms: sqliteConfirmRepo(db),
    overrides: sqliteOverrideRepo(db),
    orgatex: sqliteOrgatexRecipePort(db),
    scale: sqliteScalePort(db),
    consumption: sqliteOrgatexConsumptionPort(db),
  });

  app.post<{ Body: { batchId?: string; operatorId?: string } }>(
    "/api/sessions",
    {
      schema: {
        body: {
          type: "object",
          required: ["batchId", "operatorId"],
          properties: {
            batchId: { type: "string", minLength: 1 },
            operatorId: { type: "string", minLength: 1 },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const snap = service.start(req.body.batchId as string, req.body.operatorId as string);
        return reply.code(201).send(snap);
      } catch (e) {
        if (e instanceof SessionError) return sendErr(reply, e);
        throw e;
      }
    },
  );

  app.get<{ Params: { sessionId: string } }>("/api/sessions/:sessionId", async (req, reply) => {
    try {
      return reply.code(200).send(service.get(req.params.sessionId));
    } catch (e) {
      if (e instanceof SessionError) return sendErr(reply, e);
      throw e;
    }
  });

  app.get<{ Params: { sessionId: string } }>(
    "/api/sessions/:sessionId/evaluation",
    async (req, reply) => {
      try {
        return reply.code(200).send(service.evaluate(req.params.sessionId));
      } catch (e) {
        if (e instanceof SessionError) return sendErr(reply, e);
        throw e;
      }
    },
  );

  app.post<{ Params: { sessionId: string } }>(
    "/api/sessions/:sessionId/tare",
    async (req, reply) => {
      try {
        return reply.code(200).send(service.tare(req.params.sessionId));
      } catch (e) {
        if (e instanceof SessionError) return sendErr(reply, e);
        throw e;
      }
    },
  );

  app.post<{ Params: { sessionId: string }; Body: { seq?: number } }>(
    "/api/sessions/:sessionId/active",
    {
      schema: {
        body: {
          type: "object",
          required: ["seq"],
          properties: { seq: { type: "integer", minimum: 1 } },
        },
      },
    },
    async (req, reply) => {
      try {
        return reply.code(200).send(service.activate(req.params.sessionId, req.body.seq as number));
      } catch (e) {
        if (e instanceof SessionError) return sendErr(reply, e);
        throw e;
      }
    },
  );

  app.post<{ Params: { sessionId: string } }>(
    "/api/sessions/:sessionId/confirm",
    async (req, reply) => {
      try {
        return reply.code(200).send(service.confirm(req.params.sessionId));
      } catch (e) {
        if (e instanceof SessionError) return sendErr(reply, e);
        throw e;
      }
    },
  );

  app.post<{ Params: { sessionId: string } }>(
    "/api/sessions/:sessionId/quit",
    async (req, reply) => {
      try {
        return reply.code(200).send(service.quit(req.params.sessionId));
      } catch (e) {
        if (e instanceof SessionError) return sendErr(reply, e);
        throw e;
      }
    },
  );

  app.post<{ Params: { sessionId: string } }>(
    "/api/sessions/:sessionId/complete",
    async (req, reply) => {
      try {
        return reply.code(200).send(service.complete(req.params.sessionId));
      } catch (e) {
        if (e instanceof SessionError) return sendErr(reply, e);
        throw e;
      }
    },
  );

  app.post<{ Params: { sessionId: string }; Body: { reason?: string } }>(
    "/api/sessions/:sessionId/override",
    {
      schema: {
        body: {
          type: "object",
          properties: { reason: { type: "string" } },
        },
      },
    },
    async (req, reply) => {
      try {
        const row = service.override(req.params.sessionId, req.body?.reason ?? "");
        return reply.code(201).send(row);
      } catch (e) {
        if (e instanceof SessionError) return sendErr(reply, e);
        throw e;
      }
    },
  );

  app.get<{ Params: { sessionId: string } }>(
    "/api/sessions/:sessionId/overrides",
    async (req, reply) => {
      try {
        return reply.code(200).send(service.listOverrides(req.params.sessionId));
      } catch (e) {
        if (e instanceof SessionError) return sendErr(reply, e);
        throw e;
      }
    },
  );

  app.put<{
    Params: { sessionId: string; seq: string };
    Body: { lot?: string; container?: string };
  }>(
    "/api/sessions/:sessionId/components/:seq/identity",
    {
      schema: {
        body: {
          type: "object",
          required: ["lot", "container"],
          properties: {
            lot: { type: "string" },
            container: { type: "string" },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const seq = Number(req.params.seq);
        const snap = service.setIdentity(
          req.params.sessionId,
          seq,
          req.body.lot as string,
          req.body.container as string,
        );
        return reply.code(200).send(snap);
      } catch (e) {
        if (e instanceof SessionError) return sendErr(reply, e);
        throw e;
      }
    },
  );
}
