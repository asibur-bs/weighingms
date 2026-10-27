import type { SessionComponent, SessionLifecycle, WeighingSession } from "./types.ts";

export function firstIncomplete(components: SessionComponent[]): SessionComponent | undefined {
  return components.find((c) => c.state !== "done");
}

/** After a valid confirm: current is already `done`. Activate next pending or clear active. */
export function advanceAfterConfirm(session: WeighingSession): void {
  const next = session.components.find((c) => c.state === "pending");
  if (!next) {
    session.activeSeq = null;
    return;
  }
  next.state = "active";
  session.activeSeq = next.seq;
}

export type ActivateDecision =
  | "ok"
  | "ignored"
  | "recipe_order"
  | "session_abandoned"
  | "already_completed"
  | "not_found";

export function activateDecision(session: WeighingSession, seq: number): ActivateDecision {
  if (session.lifecycle === "abandoned") return "session_abandoned";
  if (session.lifecycle === "completed") return "already_completed";
  const target = session.components.find((c) => c.seq === seq);
  if (!target) return "not_found";
  if (target.state === "done") return "ignored";
  const first = firstIncomplete(session.components);
  if (!first) return "ignored";
  if (seq !== first.seq) return "recipe_order";
  return "ok";
}

export function completionPermit(
  session: WeighingSession,
): "allowed" | "abandoned" | "already_completed" | "incomplete" {
  if (session.lifecycle === "abandoned") return "abandoned";
  if (session.lifecycle === "completed") return "already_completed";
  if (session.components.some((c) => c.state !== "done")) return "incomplete";
  return "allowed";
}

export function requireOpen(lifecycle: SessionLifecycle): "ok" | "session_abandoned" | "already_completed" {
  if (lifecycle === "abandoned") return "session_abandoned";
  if (lifecycle === "completed") return "already_completed";
  return "ok";
}
