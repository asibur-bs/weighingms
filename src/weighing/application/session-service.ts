import { randomUUID } from "node:crypto";
import { confirmReasons } from "../domain/confirm.ts";
import { surplusMg } from "../domain/overshoot.ts";
import {
  activateDecision,
  advanceAfterConfirm,
  completionPermit,
  requireOpen,
} from "../domain/progression.ts";
import { fromMilligrams, remainingMg, toMilligrams } from "../domain/quantity.ts";
import { scaleIdFromRecipeLabel } from "../domain/scale-map.ts";
import { zone } from "../domain/tolerance.ts";
import type { OverrideRequest, SessionComponent, WeighingSession } from "../domain/types.ts";
import type {
  ConfirmRecordRepository,
  OrgatexConsumptionPort,
  OrgatexRecipePort,
  OverrideRequestRepository,
  ScalePort,
  WeighingSessionRepository,
} from "./ports.ts";

export class SessionError extends Error {
  constructor(
    public readonly code: string,
    public readonly http: number,
    public readonly reasons: string[] = [],
  ) {
    super(code);
  }
}

export interface SessionSnapshot {
  id: string;
  batchId: string;
  operatorId: string;
  activeSeq: number | null;
  lifecycle: WeighingSession["lifecycle"];
  startedAt: string;
  doneCount: number;
  totalCount: number;
  completeAllowed: boolean;
  components: Array<{
    seq: number;
    name: string;
    code: string;
    state: SessionComponent["state"];
    lot: string;
    container: string;
    scaleId: string;
    unit: string;
    target: number;
    tolerance: number;
    actual: number | null;
  }>;
}

export interface Evaluation {
  net: number;
  unit: string;
  remaining: number;
  zone: "under" | "in" | "over";
  surplus: number | null;
  confirmAllowed: boolean;
  reasons: string[];
}

function snapshot(session: WeighingSession): SessionSnapshot {
  const doneCount = session.components.filter((c) => c.state === "done").length;
  const totalCount = session.components.length;
  return {
    id: session.id,
    batchId: session.batchId,
    operatorId: session.operatorId,
    activeSeq: session.activeSeq,
    lifecycle: session.lifecycle,
    startedAt: session.startedAt,
    doneCount,
    totalCount,
    completeAllowed: session.lifecycle === "open" && doneCount === totalCount && totalCount > 0,
    components: session.components.map((c) => ({
      seq: c.seq,
      name: c.name,
      code: c.code,
      state: c.state,
      lot: c.lot,
      container: c.container,
      scaleId: c.scaleId,
      unit: c.unit,
      target: fromMilligrams(c.targetMg, c.unit),
      tolerance: fromMilligrams(c.toleranceMg, c.unit),
      actual: c.actualMg === null ? null : fromMilligrams(c.actualMg, c.unit),
    })),
  };
}

function activeOf(session: WeighingSession): SessionComponent {
  if (session.activeSeq === null) throw new SessionError("no_active_component", 409);
  const c = session.components.find((x) => x.seq === session.activeSeq);
  if (!c) throw new SessionError("session_not_found", 404);
  return c;
}

function assertOpen(session: WeighingSession): void {
  const gate = requireOpen(session.lifecycle);
  if (gate === "session_abandoned") throw new SessionError("session_abandoned", 409);
  if (gate === "already_completed") throw new SessionError("already_completed", 409);
}

export function createSessionService(deps: {
  sessions: WeighingSessionRepository;
  confirms: ConfirmRecordRepository;
  overrides: OverrideRequestRepository;
  orgatex: OrgatexRecipePort;
  scale: ScalePort;
  consumption: OrgatexConsumptionPort;
}) {
  function getOrThrow(id: string): WeighingSession {
    const s = deps.sessions.getById(id);
    if (!s) throw new SessionError("session_not_found", 404);
    return s;
  }

  function evaluateSession(session: WeighingSession): Evaluation {
    assertOpen(session);
    const active = activeOf(session);
    const live = deps.scale.readWeight(active.scaleId);
    if (!live.ok) throw new SessionError("scale_unavailable", 503);
    if (live.unit !== active.unit) throw new SessionError("scale_unavailable", 503);
    const netMg = toMilligrams(live.net, live.unit);
    const z = zone(netMg, active.targetMg, active.toleranceMg);
    const extra = surplusMg(netMg, active.targetMg, active.toleranceMg, z);
    const reasons = confirmReasons({
      operatorId: session.operatorId,
      lot: active.lot,
      container: active.container,
      recipeCode: active.code,
      presentedCode: active.code,
      state: active.state,
      liveNetValid: true,
      zone: z,
    });
    return {
      net: fromMilligrams(netMg, active.unit),
      unit: active.unit,
      remaining: fromMilligrams(remainingMg(active.targetMg, netMg), active.unit),
      zone: z,
      surplus: extra === null ? null : fromMilligrams(extra, active.unit),
      confirmAllowed: reasons.length === 0,
      reasons,
    };
  }

  return {
    start(batchId: string, operatorId: string): SessionSnapshot {
      if (!operatorId.trim()) throw new SessionError("empty_operator", 400);
      const recipe = deps.orgatex.getRecipe(batchId);
      if (!recipe || recipe.length === 0) throw new SessionError("no_recipe", 400);
      const components: SessionComponent[] = recipe.map((r, i) => ({
        seq: r.seq,
        name: r.name,
        code: r.code,
        state: i === 0 ? "active" : "pending",
        lot: r.lot,
        container: r.container,
        recipeTareMg: toMilligrams(r.tare, r.tareUnit),
        tareUnit: r.tareUnit,
        scaleId: scaleIdFromRecipeLabel(r.scale),
        unit: r.unit,
        targetMg: toMilligrams(r.target, r.unit),
        toleranceMg: toMilligrams(r.tol, r.unit),
        actualMg: null,
      }));
      const session: WeighingSession = {
        id: randomUUID(),
        batchId,
        operatorId: operatorId.trim(),
        activeSeq: components[0].seq,
        lifecycle: "open",
        startedAt: new Date().toISOString(),
        completedAt: null,
        components,
      };
      deps.sessions.save(session);
      return snapshot(session);
    },

    get(sessionId: string): SessionSnapshot {
      return snapshot(getOrThrow(sessionId));
    },

    evaluate(sessionId: string): Evaluation {
      return evaluateSession(getOrThrow(sessionId));
    },

    tare(sessionId: string): Evaluation {
      const session = getOrThrow(sessionId);
      assertOpen(session);
      const active = activeOf(session);
      const result = deps.scale.tare(active.scaleId);
      if (!result.ok) throw new SessionError("scale_unavailable", 503);
      return evaluateSession(session);
    },

    activate(sessionId: string, seq: number): SessionSnapshot {
      const session = getOrThrow(sessionId);
      const decision = activateDecision(session, seq);
      if (decision === "not_found") throw new SessionError("session_not_found", 404);
      if (decision === "session_abandoned") throw new SessionError("session_abandoned", 409);
      if (decision === "already_completed") throw new SessionError("already_completed", 409);
      if (decision === "recipe_order") throw new SessionError("recipe_order", 409, ["recipe_order"]);
      if (decision === "ignored") return snapshot(session);
      for (const c of session.components) {
        if (c.state === "done") continue;
        c.state = c.seq === seq ? "active" : "pending";
      }
      session.activeSeq = seq;
      deps.sessions.save(session);
      return snapshot(session);
    },

    confirm(sessionId: string): SessionSnapshot {
      const session = getOrThrow(sessionId);
      assertOpen(session);
      const active = activeOf(session);
      const live = deps.scale.readWeight(active.scaleId);
      if (!live.ok) throw new SessionError("scale_unavailable", 503);
      const netMg = toMilligrams(live.net, live.unit);
      const z = zone(netMg, active.targetMg, active.toleranceMg);
      const reasons = confirmReasons({
        operatorId: session.operatorId,
        lot: active.lot,
        container: active.container,
        recipeCode: active.code,
        presentedCode: active.code,
        state: active.state,
        liveNetValid: live.ok && live.unit === active.unit,
        zone: z,
      });
      if (reasons.length > 0) throw new SessionError("confirm_rejected", 409, reasons);
      active.state = "done";
      active.actualMg = netMg;
      const timestamp = new Date().toISOString();
      deps.confirms.append({
        sessionId: session.id,
        componentSeq: active.seq,
        actualMg: netMg,
        operatorId: session.operatorId,
        lot: active.lot,
        container: active.container,
        tareMg: active.recipeTareMg,
        scaleId: active.scaleId,
        timestamp,
      });
      advanceAfterConfirm(session);
      deps.sessions.save(session);
      return snapshot(session);
    },

    quit(sessionId: string): SessionSnapshot {
      const session = getOrThrow(sessionId);
      if (session.lifecycle === "completed") throw new SessionError("already_completed", 409);
      if (session.lifecycle === "abandoned") return snapshot(session);
      const active = session.components.find((c) => c.seq === session.activeSeq);
      if (active && active.state === "active") active.state = "pending";
      session.lifecycle = "abandoned";
      session.activeSeq = null;
      deps.sessions.save(session);
      return snapshot(session);
    },

    complete(sessionId: string): { snapshot: SessionSnapshot; consumption: unknown } {
      const session = getOrThrow(sessionId);
      const permit = completionPermit(session);
      if (permit === "abandoned") throw new SessionError("session_abandoned", 409);
      if (permit === "already_completed") throw new SessionError("already_completed", 409);
      if (permit === "incomplete") throw new SessionError("incomplete", 409, ["incomplete"]);
      const timestamp = new Date().toISOString();
      const posted = deps.consumption.postConsumption(session.batchId, {
        operator: session.operatorId,
        timestamp,
        components: session.components.map((c) => ({
          code: c.code,
          actual: fromMilligrams(c.actualMg ?? 0, c.unit),
        })),
      });
      if (!posted.ok && "unavailable" in posted) {
        throw new SessionError("orgatex_unavailable", 503);
      }
      if (!posted.ok) throw new SessionError("orgatex_unavailable", 503);
      session.lifecycle = "completed";
      session.completedAt = timestamp;
      deps.sessions.save(session);
      return { snapshot: snapshot(session), consumption: posted.record };
    },

    override(sessionId: string, reason: string): OverrideRequest {
      const session = getOrThrow(sessionId);
      assertOpen(session);
      if (!session.operatorId.trim()) throw new SessionError("missing_operator", 409, ["missing_operator"]);
      const active = activeOf(session);
      const row = deps.overrides.append({
        sessionId: session.id,
        componentSeq: active.seq,
        operatorId: session.operatorId,
        timestamp: new Date().toISOString(),
        reason: reason ?? "",
        status: "requested",
      });
      return row;
    },

    listOverrides(sessionId: string): OverrideRequest[] {
      getOrThrow(sessionId);
      return deps.overrides.listBySession(sessionId);
    },

    setIdentity(sessionId: string, seq: number, lot: string, container: string): SessionSnapshot {
      const session = getOrThrow(sessionId);
      assertOpen(session);
      const target = session.components.find((c) => c.seq === seq);
      if (!target) throw new SessionError("session_not_found", 404);
      if (target.state === "done") throw new SessionError("component_already_done", 409, ["component_already_done"]);
      target.lot = lot;
      target.container = container;
      deps.sessions.save(session);
      return snapshot(session);
    },
  };
}
