import { describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { createApp } from "../../src/app.ts";
import { openDb } from "../../src/db.ts";

const WEIGH_STEPS: Array<{ scaleId: string; net: number }> = [
  { scaleId: "scale-3kg", net: 1240 },
  { scaleId: "scale-3kg", net: 386 },
  { scaleId: "scale-3kg", net: 94 },
  { scaleId: "scale-32kg", net: 24 },
  { scaleId: "scale-32kg", net: 9.6 },
];

async function withApp(fn: (app: FastifyInstance) => Promise<void>): Promise<void> {
  const db = openDb(":memory:");
  const app = createApp({ db });
  try {
    await app.ready();
    await fn(app);
  } finally {
    await app.close();
  }
}

async function completeB24187(app: FastifyInstance, operatorId = "R. Karim") {
  const started = await app.inject({
    method: "POST",
    url: "/api/sessions",
    payload: { batchId: "B-24187", operatorId },
  });
  expect(started.statusCode).toBe(201);
  const id = started.json().id as string;
  for (const step of WEIGH_STEPS) {
    await app.inject({
      method: "POST",
      url: `/api/dummy/scales/${step.scaleId}/weight`,
      payload: { net: step.net },
    });
    const conf = await app.inject({
      method: "POST",
      url: `/api/sessions/${id}/confirm`,
    });
    expect(conf.statusCode).toBe(200);
  }
  const complete = await app.inject({
    method: "POST",
    url: `/api/sessions/${id}/complete`,
  });
  expect(complete.statusCode).toBe(200);
  return id;
}

describe("Dummy Printer", () => {
  it("POST /api/tickets stores prototype fields for completed B-24187", async () => {
    await withApp(async (app) => {
      const sessionId = await completeB24187(app);
      const res = await app.inject({
        method: "POST",
        url: "/api/tickets",
        payload: { sessionId },
      });
      expect(res.statusCode).toBe(201);
      const ticket = res.json();
      expect(ticket).toMatchObject({
        title: "FCI DYEING — WEIGHING TICKET",
        batch: "B-24187",
        batchId: "B-24187",
        barcode: "B-24187",
        order: "SO-9931",
        machine: "JET-04",
        shade: "Teal 4C",
        operator: "R. Karim",
        sessionId,
      });
      expect(ticket.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(ticket.components).toHaveLength(5);
      expect(ticket.components[2]).toMatchObject({
        name: "Remazol Yellow RGB",
        code: "DYE-4471",
        target: 94,
        actual: 94,
        unit: "g",
      });
      const got = await app.inject({
        method: "GET",
        url: `/api/tickets/${ticket.id}`,
      });
      expect(got.statusCode).toBe(200);
      expect(got.json().barcode).toBe("B-24187");
    });
  });

  it("incomplete and quit sessions cannot print", async () => {
    await withApp(async (app) => {
      const started = await app.inject({
        method: "POST",
        url: "/api/sessions",
        payload: { batchId: "B-24187", operatorId: "R. Karim" },
      });
      const openId = started.json().id as string;
      const incomplete = await app.inject({
        method: "POST",
        url: "/api/tickets",
        payload: { sessionId: openId },
      });
      expect(incomplete.statusCode).toBe(409);
      expect(incomplete.json().error).toBe("incomplete");

      await app.inject({ method: "POST", url: `/api/sessions/${openId}/quit` });
      const quit = await app.inject({
        method: "POST",
        url: "/api/tickets",
        payload: { sessionId: openId },
      });
      expect(quit.statusCode).toBe(409);

      const missing = await app.inject({
        method: "POST",
        url: "/api/tickets",
        payload: { sessionId: "no-such-session" },
      });
      expect(missing.statusCode).toBe(404);
    });
  });

  it("unavailable POST is 503 and stores nothing", async () => {
    await withApp(async (app) => {
      const sessionId = await completeB24187(app);
      await app.inject({
        method: "POST",
        url: "/api/dummy/printer/unavailable",
        payload: { unavailable: true },
      });
      const res = await app.inject({
        method: "POST",
        url: "/api/tickets",
        payload: { sessionId },
      });
      expect(res.statusCode).toBe(503);
      expect(res.json().error).toBe("printer_unavailable");

      await app.inject({
        method: "POST",
        url: "/api/dummy/printer/unavailable",
        payload: { unavailable: false },
      });
      const listed = await app.inject({
        method: "GET",
        url: "/api/tickets?batchId=B-24187",
      });
      expect(listed.statusCode).toBe(200);
      expect(listed.json().tickets).toEqual([]);
    });
  });
});
