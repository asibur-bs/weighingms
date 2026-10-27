import type { ToleranceZone } from "./tolerance.ts";

export type ConfirmReason =
  | "missing_lot"
  | "missing_container"
  | "missing_operator"
  | "identity_mismatch"
  | "invalid_weight"
  | "zone_under"
  | "zone_over"
  | "component_already_done";

export interface ConfirmInput {
  operatorId: string;
  lot: string;
  container: string;
  recipeCode: string;
  presentedCode: string;
  state: "pending" | "active" | "done";
  liveNetValid: boolean;
  zone: ToleranceZone | null;
}

export function confirmReasons(input: ConfirmInput): ConfirmReason[] {
  const reasons: ConfirmReason[] = [];
  if (input.state === "done") reasons.push("component_already_done");
  if (!input.operatorId.trim()) reasons.push("missing_operator");
  if (!input.lot.trim()) reasons.push("missing_lot");
  if (!input.container.trim()) reasons.push("missing_container");
  if (input.presentedCode !== input.recipeCode) reasons.push("identity_mismatch");
  if (!input.liveNetValid || input.zone === null) reasons.push("invalid_weight");
  else if (input.zone === "under") reasons.push("zone_under");
  else if (input.zone === "over") reasons.push("zone_over");
  return reasons;
}
