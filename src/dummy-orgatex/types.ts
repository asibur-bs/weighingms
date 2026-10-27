/** Training Dummy OrgaTEX JSON shapes. Not a SETEX contract. */

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

export interface ConsumptionComponent {
  code: string;
  actual: number;
}

export interface ConsumptionRecord {
  id: number;
  batchId: string;
  operator: string;
  timestamp: string;
  components: ConsumptionComponent[];
}

export interface ConsumptionBody {
  operator: string;
  timestamp: string;
  components: ConsumptionComponent[];
}
