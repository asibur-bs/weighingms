/** Training Dummy Scale JSON shapes. Not a vendor scale protocol. */

export type ScaleState = "READY" | "UNAVAILABLE";

export interface ScaleSummary {
  id: string;
  name: string;
  capacityKg: number;
  unit: string;
}

export interface ScaleStatus {
  scaleId: string;
  name: string;
  ready: boolean;
  state: ScaleState;
}

export interface ScaleWeight {
  scaleId: string;
  net: number;
  unit: string;
  tare: number;
}

export interface ScaleRow {
  id: string;
  name: string;
  capacity_kg: number;
  unit: string;
  net: number;
  tare_value: number;
  unavailable: number;
  updated_at: string;
}
