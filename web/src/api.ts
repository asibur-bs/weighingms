import type {
  ApiFailure,
  BatchSummary,
  Evaluation,
  RecipeComponent,
  ScaleStatus,
  SessionSnapshot,
  WeighingTicket,
} from "./types.ts";

export class ApiError extends Error {
  readonly status: number;
  readonly error: string;
  constructor(failure: ApiFailure) {
    super(failure.error);
    this.status = failure.status;
    this.error = failure.error;
  }
}

async function parse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function asError(status: number, body: unknown): ApiError {
  const error =
    body && typeof body === "object" && "error" in body && typeof body.error === "string"
      ? body.error
      : `http_${status}`;
  return new ApiError({ status, error });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const body = await parse(res);
  if (!res.ok) throw asError(res.status, body);
  return body as T;
}

export function getBatches(): Promise<{ batches: BatchSummary[] }> {
  return request("/api/batches");
}

export function getBatch(id: string): Promise<BatchSummary> {
  return request(`/api/batches/${encodeURIComponent(id)}`);
}

export function getRecipe(id: string): Promise<{ batchId: string; components: RecipeComponent[] }> {
  return request(`/api/batches/${encodeURIComponent(id)}/recipe`);
}

export function scannerLookup(code: string): Promise<{ batchId: string }> {
  return request(`/api/scanner/lookup?code=${encodeURIComponent(code)}`);
}

export function startSession(batchId: string, operatorId: string): Promise<SessionSnapshot> {
  return request("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ batchId, operatorId }),
  });
}

export function getSession(id: string): Promise<SessionSnapshot> {
  return request(`/api/sessions/${encodeURIComponent(id)}`);
}

export function getEvaluation(id: string): Promise<Evaluation> {
  return request(`/api/sessions/${encodeURIComponent(id)}/evaluation`);
}

export function tareSession(id: string): Promise<Evaluation> {
  return request(`/api/sessions/${encodeURIComponent(id)}/tare`, { method: "POST" });
}

export function confirmSession(id: string): Promise<SessionSnapshot> {
  return request(`/api/sessions/${encodeURIComponent(id)}/confirm`, { method: "POST" });
}

export function quitSession(id: string): Promise<SessionSnapshot> {
  return request(`/api/sessions/${encodeURIComponent(id)}/quit`, { method: "POST" });
}

export function completeSession(
  id: string,
): Promise<{ snapshot: SessionSnapshot; consumption: unknown }> {
  return request(`/api/sessions/${encodeURIComponent(id)}/complete`, { method: "POST" });
}

export function overrideSession(id: string, reason: string): Promise<unknown> {
  return request(`/api/sessions/${encodeURIComponent(id)}/override`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function activateComponent(id: string, seq: number): Promise<SessionSnapshot> {
  return request(`/api/sessions/${encodeURIComponent(id)}/active`, {
    method: "POST",
    body: JSON.stringify({ seq }),
  });
}

export function getScaleStatus(scaleId: string): Promise<ScaleStatus> {
  return request(`/api/scales/${encodeURIComponent(scaleId)}/status`);
}

export function setDummyWeight(
  scaleId: string,
  net: number,
): Promise<{ scaleId: string; net: number; unit: string; tare: number }> {
  return request(`/api/dummy/scales/${encodeURIComponent(scaleId)}/weight`, {
    method: "POST",
    body: JSON.stringify({ net }),
  });
}

export function printTicket(sessionId: string): Promise<WeighingTicket> {
  return request("/api/tickets", {
    method: "POST",
    body: JSON.stringify({ sessionId }),
  });
}

export async function probePrinter(): Promise<"READY" | "UNAVAILABLE"> {
  const res = await fetch("/api/tickets");
  if (res.status === 503) return "UNAVAILABLE";
  return "READY";
}
