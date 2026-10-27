import { describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { createApp } from "../../src/app.ts";

const COMPLETE_CONSUMPTION = {
  operator: "R. Karim",
  timestamp: "2026-10-26T14:27:00Z",
  components: [
    { code: "DYE-1180", actual: 1241.5 },
    { code: "DYE-2204", actual: 385.4 },
    { code: "DYE-4471", actual: 94.2 },
    { code: "AUX-0101", actual: 24.01 },
    { code: "AUX-0107", actual: 9.61 },
  ],
};

async function withApp(
  fn: (app: FastifyInstance) => Promise<void>,
  options: { seed?: boolean } = {},
): Promise<void> {
  const app = createApp({ dbPath: ":memory:", seed: options.seed });
  try {
    await app.ready();
    await fn(app);
  } finally {
    await app.close();
  }
}

describe("Dummy OrgaTEX", () => {
  it("GET /api/batches returns four training batches from the Dummy store", async () => {
    await withApp(async (app) => {
      const res = await app.inject({ method: "GET", url: "/api/batches" });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      const ids = body.batches.map((b: { id: string }) => b.id);
      expect(ids).toEqual(["B-24187", "B-24188", "B-24190", "B-24191"]);
      for (const batch of body.batches) {
        expect(batch).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            order: expect.any(String),
            machine: expect.any(String),
            shade: expect.any(String),
            componentCount: expect.any(Number),
            status: expect.any(String),
          }),
        );
      }
      expect(body.batches[0]).toMatchObject({
        id: "B-24187",
        order: "SO-9931",
        machine: "JET-04",
        shade: "Teal 4C",
        componentCount: 5,
        status: "WEIGHING",
      });
    });
  });

  it("GET /api/batches/B-24187 returns header SO-9931 / JET-04 / Teal 4C", async () => {
    await withApp(async (app) => {
      const res = await app.inject({ method: "GET", url: "/api/batches/B-24187" });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toMatchObject({
        id: "B-24187",
        order: "SO-9931",
        machine: "JET-04",
        shade: "Teal 4C",
        componentCount: 5,
      });
    });
  });

  it("GET recipe returns five components; Yellow RGB is 94 g ±0.5 on 3 kg", async () => {
    await withApp(async (app) => {
      const res = await app.inject({
        method: "GET",
        url: "/api/batches/B-24187/recipe",
      });
      expect(res.statusCode).toBe(200);
      const { components } = res.json();
      expect(components).toHaveLength(5);
      expect(components.map((c: { name: string }) => c.name)).toEqual([
        "Remazol Brill. Blue RSPL",
        "Remazol Red RB",
        "Remazol Yellow RGB",
        "Sodium Sulphate",
        "Soda Ash",
      ]);
      expect(components[2]).toMatchObject({
        name: "Remazol Yellow RGB",
        code: "DYE-4471",
        target: 94,
        unit: "g",
        tol: 0.5,
        scale: "3 kg precision",
      });
    });
  });

  it("GET unknown batch returns 404", async () => {
    await withApp(async (app) => {
      const res = await app.inject({ method: "GET", url: "/api/batches/NOPE" });
      expect(res.statusCode).toBe(404);
    });
  });

  it("POST consumption stores a readable record", async () => {
    await withApp(async (app) => {
      const posted = await app.inject({
        method: "POST",
        url: "/api/batches/B-24187/consumption",
        payload: COMPLETE_CONSUMPTION,
      });
      expect(posted.statusCode).toBe(201);
      const record = posted.json();
      expect(record.batchId).toBe("B-24187");
      expect(record.operator).toBe("R. Karim");
      expect(record.components).toHaveLength(5);

      const listed = await app.inject({
        method: "GET",
        url: "/api/batches/B-24187/consumption",
      });
      expect(listed.statusCode).toBe(200);
      expect(listed.json().records).toHaveLength(1);
      expect(listed.json().records[0].id).toBe(record.id);
    });
  });

  it("POST incomplete consumption is 4xx and not stored", async () => {
    await withApp(async (app) => {
      const posted = await app.inject({
        method: "POST",
        url: "/api/batches/B-24187/consumption",
        payload: {},
      });
      expect(posted.statusCode).toBeGreaterThanOrEqual(400);
      expect(posted.statusCode).toBeLessThan(500);
      const listed = await app.inject({
        method: "GET",
        url: "/api/batches/B-24187/consumption",
      });
      expect(listed.json().records).toEqual([]);
    });
  });

  it("unavailable Dummy OrgaTEX does not return 2xx for queue or consumption", async () => {
    await withApp(async (app) => {
      const flag = await app.inject({
        method: "POST",
        url: "/api/dummy/orgatex/unavailable",
        payload: { unavailable: true },
      });
      expect(flag.statusCode).toBe(200);

      const queue = await app.inject({ method: "GET", url: "/api/batches" });
      expect(queue.statusCode).toBe(503);

      const posted = await app.inject({
        method: "POST",
        url: "/api/batches/B-24187/consumption",
        payload: COMPLETE_CONSUMPTION,
      });
      expect(posted.statusCode).toBe(503);
    });
  });

  it("empty store GET /api/batches is 200 with an empty list", async () => {
    await withApp(
      async (app) => {
        const res = await app.inject({ method: "GET", url: "/api/batches" });
        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual({ batches: [] });
      },
      { seed: false },
    );
  });

  it("Dummy Scanner lookup maps B-24187 to that batch id", async () => {
    await withApp(async (app) => {
      const res = await app.inject({
        method: "GET",
        url: "/api/scanner/lookup?code=B-24187",
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ batchId: "B-24187" });
    });
  });
});
