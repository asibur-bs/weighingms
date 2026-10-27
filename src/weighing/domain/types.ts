import type { QuantityUnit } from "./quantity.ts";

export type ComponentState = "pending" | "active" | "done";
export type SessionLifecycle = "open" | "abandoned" | "completed";

export interface SessionComponent {
  seq: number;
  name: string;
  code: string;
  state: ComponentState;
  lot: string;
  container: string;
  recipeTareMg: number;
  tareUnit: QuantityUnit;
  scaleId: string;
  unit: QuantityUnit;
  targetMg: number;
  toleranceMg: number;
  actualMg: number | null;
}

export interface WeighingSession {
  id: string;
  batchId: string;
  operatorId: string;
  activeSeq: number | null;
  lifecycle: SessionLifecycle;
  startedAt: string;
  completedAt: string | null;
  components: SessionComponent[];
}

export interface ConfirmRecord {
  id: number;
  sessionId: string;
  componentSeq: number;
  actualMg: number;
  operatorId: string;
  lot: string;
  container: string;
  tareMg: number;
  scaleId: string;
  timestamp: string;
}

export interface OverrideRequest {
  id: number;
  sessionId: string;
  componentSeq: number;
  operatorId: string;
  timestamp: string;
  reason: string;
  status: "requested";
}
