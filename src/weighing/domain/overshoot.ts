import type { ToleranceZone } from "./tolerance.ts";

/** Milligrams above the inclusive upper band. Null unless zone is over. Never used to rewrite targets. */
export function surplusMg(
  netMg: number,
  targetMg: number,
  toleranceMg: number,
  z: ToleranceZone,
): number | null {
  if (z !== "over") return null;
  return netMg - (targetMg + toleranceMg);
}
