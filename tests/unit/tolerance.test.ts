import { describe, expect, it } from "vitest";
import { confirmReasons } from "../../src/weighing/domain/confirm.ts";
import { remainingMg, toMilligrams } from "../../src/weighing/domain/quantity.ts";
import { zone } from "../../src/weighing/domain/tolerance.ts";

const target = toMilligrams(94.0, "g");
const tol = toMilligrams(0.5, "g");

describe("Yellow RGB tolerance (94.0 g ±0.5 g, milligrams)", () => {
  it.each([
    [93.4, "under"],
    [93.5, "in"],
    [94.0, "in"],
    [94.5, "in"],
    [94.6, "over"],
  ] as const)("%s g → %s", (grams, expected) => {
    expect(zone(toMilligrams(grams, "g"), target, tol)).toBe(expected);
  });

  it("remaining is max(0, target − net)", () => {
    expect(remainingMg(target, toMilligrams(0, "g"))).toBe(target);
    expect(remainingMg(target, target)).toBe(0);
    expect(remainingMg(target, toMilligrams(94.6, "g"))).toBe(0);
  });
});

describe("confirmReasons", () => {
  const base = {
    operatorId: "R. Karim",
    lot: "2026-0387",
    container: "C-12",
    recipeCode: "DYE-4471",
    presentedCode: "DYE-4471",
    state: "active" as const,
    liveNetValid: true,
    zone: "in" as const,
  };

  it("allows in-band confirm", () => {
    expect(confirmReasons(base)).toEqual([]);
  });

  it("rejects missing lot, container, operator", () => {
    expect(confirmReasons({ ...base, lot: "" })).toContain("missing_lot");
    expect(confirmReasons({ ...base, container: "  " })).toContain("missing_container");
    expect(confirmReasons({ ...base, operatorId: "" })).toContain("missing_operator");
  });

  it("rejects identity mismatch and invalid weight", () => {
    expect(confirmReasons({ ...base, presentedCode: "NOPE" })).toContain("identity_mismatch");
    expect(confirmReasons({ ...base, liveNetValid: false, zone: null })).toContain("invalid_weight");
  });
});
