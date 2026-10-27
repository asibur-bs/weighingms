export type BatchStatus = "WEIGHING" | "QUEUED";

export interface BatchSummary {
  id: string;
  order: string;
  machine: string;
  fabric: string;
  shade: string;
  componentCount: number;
  status: BatchStatus;
}

export interface RecipeComponent {
  seq: number;
  name: string;
  code: string;
  target: number;
  unit: string;
  tol: number;
  scale: string;
  lot: string;
  container: string;
  tare: number;
  tareUnit: string;
}

export interface SessionComponent {
  seq: number;
  name: string;
  code: string;
  state: "pending" | "active" | "done";
  lot: string;
  container: string;
  scaleId: string;
  unit: string;
  target: number;
  tolerance: number;
  actual: number | null;
}

export interface SessionSnapshot {
  id: string;
  batchId: string;
  operatorId: string;
  activeSeq: number | null;
  lifecycle: "open" | "completed" | "abandoned";
  startedAt: string;
  doneCount: number;
  totalCount: number;
  completeAllowed: boolean;
  components: SessionComponent[];
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

export interface ScaleStatus {
  scaleId: string;
  name: string;
  ready: boolean;
  state: "READY" | "UNAVAILABLE";
}

export interface TicketComponent {
  name: string;
  code: string;
  target: number;
  actual: number | null;
  unit: string;
}

export interface WeighingTicket {
  id: number;
  sessionId: string;
  title: string;
  batch: string;
  batchId: string;
  barcode: string;
  order: string;
  machine: string;
  shade: string;
  date: string;
  operator: string;
  components: TicketComponent[];
}

export interface DeviceStrip {
  scale3: "READY" | "UNAVAILABLE";
  scale32: "READY" | "UNAVAILABLE";
  scanner: "LINKED" | "UNAVAILABLE";
  printer: "READY" | "UNAVAILABLE";
  orgatex: "LINKED" | "UNAVAILABLE";
}

export interface ApiFailure {
  status: number;
  error: string;
}
