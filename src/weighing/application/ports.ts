import type { QuantityUnit } from "../domain/quantity.ts";
import type { ConfirmRecord, OverrideRequest, WeighingSession } from "../domain/types.ts";

export interface RecipeComponentIn {
  seq: number;
  name: string;
  code: string;
  target: number;
  unit: QuantityUnit;
  tol: number;
  scale: string;
  lot: string;
  container: string;
  tare: number;
  tareUnit: QuantityUnit;
}

export interface OrgatexRecipePort {
  getRecipe(batchId: string): RecipeComponentIn[] | null;
}

export type ScaleRead =
  | { ok: true; net: number; unit: QuantityUnit }
  | { ok: false; unavailable: true };

export interface ScalePort {
  readWeight(scaleId: string): ScaleRead;
  tare(scaleId: string): ScaleRead;
}

export interface WeighingSessionRepository {
  save(session: WeighingSession): void;
  getById(id: string): WeighingSession | null;
}

export interface ConfirmRecordRepository {
  append(record: Omit<ConfirmRecord, "id">): ConfirmRecord;
}

export interface OverrideRequestRepository {
  append(record: Omit<OverrideRequest, "id">): OverrideRequest;
  listBySession(sessionId: string): OverrideRequest[];
}

export interface ConsumptionLine {
  code: string;
  actual: number;
}

export type ConsumptionPost =
  | {
      ok: true;
      record: {
        id: number;
        batchId: string;
        operator: string;
        timestamp: string;
        components: ConsumptionLine[];
      };
    }
  | { ok: false; unavailable: true }
  | { ok: false; notFound: true };

export interface OrgatexConsumptionPort {
  postConsumption(
    batchId: string,
    body: { operator: string; timestamp: string; components: ConsumptionLine[] },
  ): ConsumptionPost;
}
