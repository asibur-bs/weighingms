import { describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { createApp } from "../../src/app.ts";

async function withApp(fn: (app: FastifyInstance) => Promise<void>): Promise<void> {
  const app = createApp({ dbPath: ":memory:" });
  try {
    await app.ready();
    await fn(app);
  } finally {
    await app.close();
  }
}

describe("Dummy Scale", () => {
  it("GET /api/scales lists 3 kg precision and 32 kg floor", async () => {
    await withApp(async (app) => {
      const res = await app.inject({ method: "GET", url: "/api/scales" });
      expect(res.statusCode).toBe(200);
      const ids = res.json().scales.map((s: { id: string }) => s.id);
      expect(ids).toEqual(["scale-3kg", "scale-32kg"]);
      expect(res.json().scales[0]).toMatchObject({
        id: "scale-3kg",
        name: "3 kg precision",
        capacityKg: 3,
        unit: "g",
      });
      expect(res.json().scales[1]).toMatchObject({
        id: "scale-32kg",
        name: "32 kg floor",
        capacityKg: 32,
        unit: "kg",
      });
    });
  });

  it("seeded net on scale-3kg is returned by GET weight", async () => {
    await withApp(async (app) => {
      const set = await app.inject({
        method: "POST",
        url: "/api/dummy/scales/scale-3kg/weight",
        payload: { net: 94.2 },
      });
      expect(set.statusCode).toBe(200);
      const get = await app.inject({
        method: "GET",
        url: "/api/scales/scale-3kg/weight",
      });
      expect(get.statusCode).toBe(200);
      expect(get.json()).toMatchObject({
        scaleId: "scale-3kg",
        net: 94.2,
        unit: "g",
      });
    });
  });

  it("unknown scale id returns 404", async () => {
    await withApp(async (app) => {
      const res = await app.inject({
        method: "GET",
        url: "/api/scales/nope/weight",
      });
      expect(res.statusCode).toBe(404);
    });
  });

  it("POST tare then GET weight net is 0", async () => {
    await withApp(async (app) => {
      await app.inject({
        method: "POST",
        url: "/api/dummy/scales/scale-3kg/weight",
        payload: { net: 214 },
      });
      const tare = await app.inject({
        method: "POST",
        url: "/api/scales/scale-3kg/tare",
      });
      expect(tare.statusCode).toBe(200);
      expect(tare.json().net).toBe(0);
      const get = await app.inject({
        method: "GET",
        url: "/api/scales/scale-3kg/weight",
      });
      expect(get.statusCode).toBe(200);
      expect(get.json().net).toBe(0);
    });
  });

  it("unavailable GET weight is 503, not a valid numeric reading", async () => {
    await withApp(async (app) => {
      await app.inject({
        method: "POST",
        url: "/api/dummy/scales/scale-3kg/weight",
        payload: { net: 94.2 },
      });
      await app.inject({
        method: "POST",
        url: "/api/dummy/scales/scale-3kg/unavailable",
        payload: { unavailable: true },
      });
      const get = await app.inject({
        method: "GET",
        url: "/api/scales/scale-3kg/weight",
      });
      expect(get.statusCode).toBe(503);
      expect(get.json()).toEqual({ error: "scale_unavailable" });
      expect(get.json().net).toBeUndefined();
      const status = await app.inject({
        method: "GET",
        url: "/api/scales/scale-3kg/status",
      });
      expect(status.statusCode).toBe(200);
      expect(status.json()).toMatchObject({ ready: false, state: "UNAVAILABLE" });
    });
  });

  it("tare while unavailable is not 2xx", async () => {
    await withApp(async (app) => {
      await app.inject({
        method: "POST",
        url: "/api/dummy/scales/scale-3kg/unavailable",
        payload: { unavailable: true },
      });
      const tare = await app.inject({
        method: "POST",
        url: "/api/scales/scale-3kg/tare",
      });
      expect(tare.statusCode).toBe(503);
    });
  });
});
