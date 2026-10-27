export type ToleranceZone = "under" | "in" | "over";

/** Inclusive band [target − tolerance, target + tolerance] in milligrams. */
export function zone(netMg: number, targetMg: number, toleranceMg: number): ToleranceZone {
  const lo = targetMg - toleranceMg;
  const hi = targetMg + toleranceMg;
  if (netMg < lo) return "under";
  if (netMg > hi) return "over";
  return "in";
}
