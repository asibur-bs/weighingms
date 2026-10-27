export type QuantityUnit = "g" | "kg";

const MG_PER_G = 1000;
const MG_PER_KG = 1_000_000;

export function toMilligrams(amount: number, unit: QuantityUnit): number {
  if (unit === "kg") return Math.round(amount * MG_PER_KG);
  return Math.round(amount * MG_PER_G);
}

export function fromMilligrams(mg: number, unit: QuantityUnit): number {
  if (unit === "kg") return mg / MG_PER_KG;
  return mg / MG_PER_G;
}

export function remainingMg(targetMg: number, netMg: number): number {
  const rem = targetMg - netMg;
  return rem > 0 ? rem : 0;
}
