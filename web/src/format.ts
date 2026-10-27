export const OPERATOR_ID = "R. Karim";
export const OPERATOR_CHIP = "R. Karim · Shift A";

export function formatQty(n: number, unit: string): string {
  return unit === "kg" ? n.toFixed(3) : n.toFixed(1);
}

export function scaleLabel(scaleId: string): string {
  return scaleId === "scale-32kg" ? "32 kg floor" : "3 kg precision";
}

export function visualZone(zone: EvaluationZone, net: number, target: number): "under" | "near" | "ok" | "over" {
  if (zone === "over") return "over";
  if (zone === "in") return "ok";
  if (target > 0 && net >= 0.9 * target) return "near";
  return "under";
}

export type EvaluationZone = "under" | "in" | "over";

export function statusCopy(
  zone: EvaluationZone,
  remaining: number,
  unit: string,
  scaleDown: boolean,
): string {
  if (scaleDown) return "SCALE UNAVAILABLE — CONFIRM BLOCKED";
  if (zone === "in") return "WITHIN TOLERANCE";
  if (zone === "over") return "OVER TOLERANCE";
  return `DISPENSE — ${formatQty(remaining, unit)} ${unit} REMAINING`;
}

export function clockNow(): string {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}
