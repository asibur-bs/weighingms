import { describe, expect, it } from "vitest";
import { surplusMg } from "../../src/weighing/domain/overshoot.ts";
import {
  activateDecision,
  advanceAfterConfirm,
  completionPermit,
} from "../../src/weighing/domain/progression.ts";
import { toMilligrams } from "../../src/weighing/domain/quantity.ts";
import { zone } from "../../src/weighing/domain/tolerance.ts";
import type { SessionComponent, WeighingSession } from "../../src/weighing/domain/types.ts";

function component(seq: number, state: SessionComponent["state"]): SessionComponent {
  return {
    seq,
    name: `c${seq}`,
    code: `C${seq}`,
    state,
    lot: "L",
    container: "C",
    recipeTareMg: 0,
    tareUnit: "g",
    scaleId: "scale-3kg",
    unit: "g",
    targetMg: 1000,
    toleranceMg: 10,
    actualMg: state === "done" ? 1000 : null,
  };
}

function session(partial: Partial<WeighingSession> & { components: SessionComponent[] }): WeighingSession {
  return {
    id: "s1",
    batchId: "B-24187",
    operatorId: "R. Karim",
    activeSeq: 1,
    lifecycle: "open",
    startedAt: "t",
    completedAt: null,
    ...partial,
  };
}

describe("progression", () => {
  it("activates the next pending after confirm", () => {
    const s = session({
      activeSeq: 1,
      components: [component(1, "done"), component(2, "pending"), component(3, "pending")],
    });
    advanceAfterConfirm(s);
    expect(s.activeSeq).toBe(2);
    expect(s.components[1].state).toBe("active");
  });

  it("clears activeSeq at 5/5", () => {
    const s = session({
      activeSeq: 5,
      components: [1, 2, 3, 4, 5].map((n) => component(n, n === 5 ? "done" : "done")),
    });
    advanceAfterConfirm(s);
    expect(s.activeSeq).toBeNull();
  });

  it("forbids skipping ahead and ignores done", () => {
    const s = session({
      activeSeq: 1,
      components: [component(1, "active"), component(2, "pending"), component(3, "pending")],
    });
    expect(activateDecision(s, 3)).toBe("recipe_order");
    s.components[0].state = "done";
    expect(activateDecision(s, 1)).toBe("ignored");
  });

  it("denies complete until all done; denies abandoned", () => {
    const s = session({
      components: [component(1, "done"), component(2, "active")],
    });
    expect(completionPermit(s)).toBe("incomplete");
    s.components[1].state = "done";
    expect(completionPermit(s)).toBe("allowed");
    s.lifecycle = "abandoned";
    expect(completionPermit(s)).toBe("abandoned");
  });
});

describe("overshoot surplus (display only)", () => {
  const target = toMilligrams(94.0, "g");
  const tol = toMilligrams(0.5, "g");

  it("94.6 g is 100 mg surplus; in-band has none", () => {
    const over = toMilligrams(94.6, "g");
    expect(zone(over, target, tol)).toBe("over");
    expect(surplusMg(over, target, tol, "over")).toBe(100);
    expect(surplusMg(target, target, tol, "in")).toBeNull();
  });
});
