import { describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { createApp } from "../../src/app.ts";
import { openDb } from "../../src/db.ts";

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

async function confirmAt(app: FastifyInstance, sessionId: string, scaleId: string, net: number) {
  await app.inject({
    method: "POST",
    url: `/api/dummy/scales/${scaleId}/weight`,
    payload: { net },
  });
  const conf = await app.inject({
    method: "POST",
    url: `/api/sessions/${sessionId}/confirm`,
  });
  expect(conf.statusCode).toBe(200);
  return conf.json();
}

/** Blue 1240 g then Red 386 g so Yellow RGB is active (confirm auto-advances). */
async function startYellow(app: FastifyInstance) {
  const started = await app.inject({
    method: "POST",
    url: "/api/sessions",
    payload: { batchId: "B-24187", operatorId: "R. Karim" },
  });
  expect(started.statusCode).toBe(201);
  const id = started.json().id as string;
  await confirmAt(app, id, "scale-3kg", 1240);
  await confirmAt(app, id, "scale-3kg", 386);
  return id;
}

describe("Weighing session API", () => {
  it("starts B-24187 with first incomplete active and operator attached", async () => {
    await withApp(async (app) => {
      const res = await app.inject({
        method: "POST",
        url: "/api/sessions",
        payload: { batchId: "B-24187", operatorId: "R. Karim" },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.operatorId).toBe("R. Karim");
      expect(body.batchId).toBe("B-24187");
      expect(body.components).toHaveLength(5);
      expect(body.components[0]).toMatchObject({
        name: "Remazol Brill. Blue RSPL",
        state: "active",
      });
      expect(body.activeSeq).toBe(1);
    });
  });

  it("Yellow RGB uses 3 kg / g; Sodium Sulphate uses 32 kg / kg", async () => {
    await withApp(async (app) => {
      const id = (await startYellow(app)) as string;
      const y = (await app.inject({ method: "GET", url: `/api/sessions/${id}` })).json()
        .components[2];
      expect(y).toMatchObject({
        name: "Remazol Yellow RGB",
        code: "DYE-4471",
        scaleId: "scale-3kg",
        unit: "g",
        target: 94,
        lot: "2026-0387",
        container: "C-12",
      });
      await confirmAt(app, id, "scale-3kg", 94.0);
      const s = (await app.inject({ method: "GET", url: `/api/sessions/${id}` })).json()
        .components[3];
      expect(s).toMatchObject({
        name: "Sodium Sulphate",
        scaleId: "scale-32kg",
        unit: "kg",
      });
    });
  });

  it("evaluates five Yellow RGB points", async () => {
    await withApp(async (app) => {
      const id = await startYellow(app);
      const expected = [
        [93.4, "under", false],
        [93.5, "in", true],
        [94.0, "in", true],
        [94.5, "in", true],
        [94.6, "over", false],
      ] as const;
      for (const [net, z, allowed] of expected) {
        await app.inject({
          method: "POST",
          url: "/api/dummy/scales/scale-3kg/weight",
          payload: { net },
        });
        const ev = await app.inject({
          method: "GET",
          url: `/api/sessions/${id}/evaluation`,
        });
        expect(ev.statusCode).toBe(200);
        expect(ev.json()).toMatchObject({ zone: z, confirmAllowed: allowed, unit: "g" });
      }
    });
  });

  it("confirms 94.0 g and rejects 93.4 and 94.6", async () => {
    await withApp(async (app) => {
      const id = await startYellow(app);
      await app.inject({
        method: "POST",
        url: "/api/dummy/scales/scale-3kg/weight",
        payload: { net: 93.4 },
      });
      expect(
        (await app.inject({ method: "POST", url: `/api/sessions/${id}/confirm` })).statusCode,
      ).toBe(409);
      await app.inject({
        method: "POST",
        url: "/api/dummy/scales/scale-3kg/weight",
        payload: { net: 94.6 },
      });
      expect(
        (await app.inject({ method: "POST", url: `/api/sessions/${id}/confirm` })).statusCode,
      ).toBe(409);
      await app.inject({
        method: "POST",
        url: "/api/dummy/scales/scale-3kg/weight",
        payload: { net: 94.0 },
      });
      const ok = await app.inject({ method: "POST", url: `/api/sessions/${id}/confirm` });
      expect(ok.statusCode).toBe(200);
      const y = ok.json().components.find((c: { seq: number }) => c.seq === 3);
      expect(y.state).toBe("done");
      expect(y.actual).toBe(94);
    });
  });

  it("tare zeros net used for confirm", async () => {
    await withApp(async (app) => {
      const id = await startYellow(app);
      await app.inject({
        method: "POST",
        url: "/api/dummy/scales/scale-3kg/weight",
        payload: { net: 50 },
      });
      const tare = await app.inject({ method: "POST", url: `/api/sessions/${id}/tare` });
      expect(tare.statusCode).toBe(200);
      expect(tare.json().net).toBe(0);
    });
  });

  it("missing lot blocks confirm", async () => {
    await withApp(async (app, db) => {
      const id = await startYellow(app);
      db.prepare(`UPDATE session_components SET lot = '' WHERE session_id = ? AND seq = 3`).run(id);
      await app.inject({
        method: "POST",
        url: "/api/dummy/scales/scale-3kg/weight",
        payload: { net: 94.0 },
      });
      const conf = await app.inject({ method: "POST", url: `/api/sessions/${id}/confirm` });
      expect(conf.statusCode).toBe(409);
      expect(conf.json().reasons).toContain("missing_lot");
    });
  });

  it("scale unavailable is 503 not a fake confirm", async () => {
    await withApp(async (app) => {
      const id = await startYellow(app);
      await app.inject({
        method: "POST",
        url: "/api/dummy/scales/scale-3kg/unavailable",
        payload: { unavailable: true },
      });
      const ev = await app.inject({
        method: "GET",
        url: `/api/sessions/${id}/evaluation`,
      });
      expect(ev.statusCode).toBe(503);
      const conf = await app.inject({ method: "POST", url: `/api/sessions/${id}/confirm` });
      expect(conf.statusCode).toBe(503);
    });
  });
});
