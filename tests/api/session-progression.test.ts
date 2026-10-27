import { describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { createApp } from "../../src/app.ts";
import { openDb } from "../../src/db.ts";

const SEEDED_TARGETS = [
  { seq: 1, target: 1240 },
  { seq: 2, target: 386 },
  { seq: 3, target: 94 },
  { seq: 4, target: 24 },
  { seq: 5, target: 9.6 },
];

const WEIGH_STEPS: Array<{ scaleId: string; net: number }> = [
  { scaleId: "scale-3kg", net: 1240 },
  { scaleId: "scale-3kg", net: 386 },
  { scaleId: "scale-3kg", net: 94 },
  { scaleId: "scale-32kg", net: 24 },
  { scaleId: "scale-32kg", net: 9.6 },
];

async function withApp(
  fn: (app: FastifyInstance, db: ReturnType<typeof openDb>) => Promise<void>,
): Promise<void> {
  const db = openDb(":memory:");
  const app = createApp({ db });
  try {
    await app.ready();
    await fn(app, db);
  } finally {
    await app.close();
  }
}

async function startSession(app: FastifyInstance, operatorId = "R. Karim") {
  const started = await app.inject({
    method: "POST",
    url: "/api/sessions",
    payload: { batchId: "B-24187", operatorId },
  });
  expect(started.statusCode).toBe(201);
  return started.json();
}

async function confirmAt(app: FastifyInstance, sessionId: string, scaleId: string, net: number) {
  await app.inject({
    method: "POST",
    url: `/api/dummy/scales/${scaleId}/weight`,
    payload: { net },
  });
  return app.inject({
    method: "POST",
    url: `/api/sessions/${sessionId}/confirm`,
  });
}

async function weighFirst(app: FastifyInstance, sessionId: string, count: number) {
  let snap;
  for (let i = 0; i < count; i++) {
    const step = WEIGH_STEPS[i];
    const conf = await confirmAt(app, sessionId, step.scaleId, step.net);
    expect(conf.statusCode).toBe(200);
    snap = conf.json();
  }
  return snap;
}

describe("session progression and safety", () => {
  it("invalid weight leaves the component not done", async () => {
    await withApp(async (app) => {
      const { id } = await startSession(app);
      const bad = await confirmAt(app, id, "scale-3kg", 0);
      expect(bad.statusCode).toBe(409);
      const snap = (await app.inject({ method: "GET", url: `/api/sessions/${id}` })).json();
      expect(snap.components[0].state).toBe("active");
      expect(snap.components[0].actual).toBeNull();
      expect(snap.doneCount).toBe(0);
    });
  });

  it("valid confirm activates the next pending component", async () => {
    await withApp(async (app) => {
      const { id } = await startSession(app);
      const conf = await confirmAt(app, id, "scale-3kg", 1240);
      expect(conf.statusCode).toBe(200);
      const body = conf.json();
      expect(body.components[0].state).toBe("done");
      expect(body.components[1].state).toBe("active");
      expect(body.activeSeq).toBe(2);
    });
  });

  it("cannot skip ahead with /active; done seq is ignored", async () => {
    await withApp(async (app) => {
      const { id } = await startSession(app);
      const skip = await app.inject({
        method: "POST",
        url: `/api/sessions/${id}/active`,
        payload: { seq: 3 },
      });
      expect(skip.statusCode).toBe(409);
      expect(skip.json().error).toBe("recipe_order");

      await weighFirst(app, id, 1);
      const ignore = await app.inject({
        method: "POST",
        url: `/api/sessions/${id}/active`,
        payload: { seq: 1 },
      });
      expect(ignore.statusCode).toBe(200);
      expect(ignore.json().activeSeq).toBe(2);
      expect(ignore.json().components[0].state).toBe("done");
    });
  });

  it("4/5 cannot complete; 5/5 posts Dummy consumption", async () => {
    await withApp(async (app) => {
      const { id } = await startSession(app);
      await weighFirst(app, id, 4);
      const four = await app.inject({ method: "POST", url: `/api/sessions/${id}/complete` });
      expect(four.statusCode).toBe(409);
      expect(four.json().error).toBe("incomplete");

      const last = WEIGH_STEPS[4];
      const fifth = await confirmAt(app, id, last.scaleId, last.net);
      expect(fifth.statusCode).toBe(200);
      const done = (await app.inject({ method: "GET", url: `/api/sessions/${id}` })).json();
      expect(done.doneCount).toBe(5);
      expect(done.completeAllowed).toBe(true);
      expect(done.activeSeq).toBeNull();

      const complete = await app.inject({ method: "POST", url: `/api/sessions/${id}/complete` });
      expect(complete.statusCode).toBe(200);
      expect(complete.json().snapshot.lifecycle).toBe("completed");
      expect(complete.json().consumption.components).toHaveLength(5);

      const stored = await app.inject({ method: "GET", url: "/api/batches/B-24187/consumption" });
      expect(stored.statusCode).toBe(200);
      expect(stored.json().records.length).toBeGreaterThan(0);
    });
  });

  it("Yellow RGB 94.6 g cannot confirm and remaining targets stay seeded", async () => {
    await withApp(async (app) => {
      const { id } = await startSession(app);
      await weighFirst(app, id, 2);
      await app.inject({
        method: "POST",
        url: "/api/dummy/scales/scale-3kg/weight",
        payload: { net: 94.6 },
      });
      const ev = await app.inject({ method: "GET", url: `/api/sessions/${id}/evaluation` });
      expect(ev.json()).toMatchObject({ zone: "over", confirmAllowed: false, surplus: 0.1 });
      const conf = await app.inject({ method: "POST", url: `/api/sessions/${id}/confirm` });
      expect(conf.statusCode).toBe(409);
      expect(conf.json().reasons).toContain("zone_over");

      const snap = (await app.inject({ method: "GET", url: `/api/sessions/${id}` })).json();
      expect(snap.components[2].state).toBe("active");
      for (const row of SEEDED_TARGETS) {
        const c = snap.components.find((x: { seq: number }) => x.seq === row.seq);
        expect(c.target).toBe(row.target);
      }
    });
  });

  it("quit does not mark done and forbids write-back", async () => {
    await withApp(async (app) => {
      const { id } = await startSession(app);
      const quit = await app.inject({ method: "POST", url: `/api/sessions/${id}/quit` });
      expect(quit.statusCode).toBe(200);
      expect(quit.json().lifecycle).toBe("abandoned");
      expect(quit.json().components[0].state).toBe("pending");
      expect(quit.json().components[0].actual).toBeNull();

      const complete = await app.inject({ method: "POST", url: `/api/sessions/${id}/complete` });
      expect(complete.statusCode).toBe(409);
    });
  });

  it("anonymous confirm is rejected; override logs and does not confirm 94.6", async () => {
    await withApp(async (app, db) => {
      const { id } = await startSession(app);
      db.prepare(`UPDATE weighing_sessions SET operator_id = '' WHERE id = ?`).run(id);
      await app.inject({
        method: "POST",
        url: "/api/dummy/scales/scale-3kg/weight",
        payload: { net: 1240 },
      });
      const anon = await app.inject({ method: "POST", url: `/api/sessions/${id}/confirm` });
      expect(anon.statusCode).toBe(409);
      expect(anon.json().reasons).toContain("missing_operator");

      db.prepare(`UPDATE weighing_sessions SET operator_id = 'R. Karim' WHERE id = ?`).run(id);
      await weighFirst(app, id, 2);
      await app.inject({
        method: "POST",
        url: "/api/dummy/scales/scale-3kg/weight",
        payload: { net: 94.6 },
      });
      const ov = await app.inject({
        method: "POST",
        url: `/api/sessions/${id}/override`,
        payload: { reason: "training" },
      });
      expect(ov.statusCode).toBe(201);
      expect(ov.json()).toMatchObject({
        sessionId: id,
        componentSeq: 3,
        operatorId: "R. Karim",
        status: "requested",
      });
      const still = await app.inject({ method: "POST", url: `/api/sessions/${id}/confirm` });
      expect(still.statusCode).toBe(409);
      const listed = await app.inject({ method: "GET", url: `/api/sessions/${id}/overrides` });
      expect(listed.json()).toHaveLength(1);
    });
  });

  it("Dummy OrgaTEX down does not fake CONFIRMED write-back", async () => {
    await withApp(async (app) => {
      const { id } = await startSession(app);
      await weighFirst(app, id, 5);
      await app.inject({
        method: "POST",
        url: "/api/dummy/orgatex/unavailable",
        payload: { unavailable: true },
      });
      const complete = await app.inject({ method: "POST", url: `/api/sessions/${id}/complete` });
      expect(complete.statusCode).toBe(503);
      const snap = (await app.inject({ method: "GET", url: `/api/sessions/${id}` })).json();
      expect(snap.lifecycle).toBe("open");
      expect(snap.doneCount).toBe(5);
      expect(snap.completeAllowed).toBe(true);
    });
  });
});
