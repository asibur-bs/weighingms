import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  activateComponent,
  ApiError,
  completeSession,
  confirmSession,
  getBatch,
  getBatches,
  getEvaluation,
  getRecipe,
  getScaleStatus,
  overrideSession,
  printTicket,
  probePrinter,
  quitSession,
  scannerLookup,
  startSession,
  tareSession,
} from "./api.ts";
import { clockNow, formatQty, OPERATOR_CHIP, OPERATOR_ID, scaleLabel, statusCopy, visualZone } from "./format.ts";
import type {
  BatchSummary,
  DeviceStrip,
  Evaluation,
  RecipeComponent,
  SessionSnapshot,
  WeighingTicket,
} from "./types.ts";

const SWATCH = ["#3b6ea5", "#c44b4b", "#d6b13a", "#9aa3ad", "#c5c8ce"];
const EMPTY_DEVICES: DeviceStrip = {
  scale3: "READY",
  scale32: "READY",
  scanner: "LINKED",
  printer: "READY",
  orgatex: "LINKED",
};

function failMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.error === "orgatex_unavailable") return "OrgaTEX unavailable";
    if (err.error === "scale_unavailable") return "Scale unavailable";
    if (err.error === "printer_unavailable") return "Printer unavailable";
    return err.error.replaceAll("_", " ");
  }
  return err instanceof Error ? err.message : "request failed";
}

function tareFor(recipe: RecipeComponent[] | null, seq: number | null): string {
  if (!recipe || seq === null) return "—";
  const row = recipe.find((c) => c.seq === seq);
  if (!row) return "—";
  return `${formatQty(row.tare, row.tareUnit)} ${row.tareUnit}`;
}

function barcodeBars(id: string): number[] {
  const bars: number[] = [];
  for (let i = 0; i < 42; i += 1) {
    const c = id.charCodeAt(i % id.length) + i * 7;
    bars.push(1 + (c % 4));
  }
  return bars;
}

export function App() {
  const [view, setView] = useState<"queue" | "weigh" | "done">("queue");
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [batch, setBatch] = useState<BatchSummary | null>(null);
  const [recipe, setRecipe] = useState<RecipeComponent[] | null>(null);
  const [session, setSession] = useState<SessionSnapshot | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [scaleDown, setScaleDown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanCode, setScanCode] = useState("");
  const [clock, setClock] = useState(clockNow);
  const [devices, setDevices] = useState<DeviceStrip>(EMPTY_DEVICES);
  const [overrideNote, setOverrideNote] = useState<string | null>(null);
  const [writeback, setWriteback] = useState<{ ok: boolean; at?: string } | null>(null);
  const [ticket, setTicket] = useState<WeighingTicket | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const viewRef = useRef(view);
  viewRef.current = view;

  const loadQueue = useCallback(async () => {
    try {
      const data = await getBatches();
      setBatches(data.batches);
      setDevices((d) => ({ ...d, orgatex: "LINKED" }));
      setError(null);
    } catch (err) {
      setBatches([]);
      setDevices((d) => ({ ...d, orgatex: "UNAVAILABLE" }));
      setError(failMessage(err));
    }
  }, []);

  const refreshDevices = useCallback(async () => {
    const [s3, s32, orgatex, printer] = await Promise.allSettled([
      getScaleStatus("scale-3kg"),
      getScaleStatus("scale-32kg"),
      getBatches(),
      probePrinter(),
    ]);
    const orgatexUp = orgatex.status === "fulfilled";
    setDevices({
      scale3: s3.status === "fulfilled" && s3.value.ready ? "READY" : "UNAVAILABLE",
      scale32: s32.status === "fulfilled" && s32.value.ready ? "READY" : "UNAVAILABLE",
      scanner: "LINKED",
      printer: printer.status === "fulfilled" ? printer.value : "UNAVAILABLE",
      orgatex: orgatexUp ? "LINKED" : "UNAVAILABLE",
    });
    if (viewRef.current === "queue") {
      if (orgatexUp) {
        setBatches(orgatex.value.batches);
        setError((prev) => (prev === "OrgaTEX unavailable" ? null : prev));
      } else {
        setBatches([]);
        setError("OrgaTEX unavailable");
      }
    }
  }, []);

  useEffect(() => {
    void loadQueue();
    void refreshDevices();
    const clocks = window.setInterval(() => setClock(clockNow()), 1000);
    const devicesTimer = window.setInterval(() => void refreshDevices(), 2500);
    return () => {
      window.clearInterval(clocks);
      window.clearInterval(devicesTimer);
    };
  }, [loadQueue, refreshDevices]);

  const openBatch = useCallback(async (batchId: string) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    setSelectedId(batchId);
    try {
      const [header, rec] = await Promise.all([getBatch(batchId), getRecipe(batchId)]);
      const snap = await startSession(batchId, OPERATOR_ID);
      setBatch(header);
      setRecipe(rec.components);
      setSession(snap);
      setEvaluation(null);
      setScaleDown(false);
      setOverrideNote(null);
      setWriteback(null);
      setTicket(null);
      setView("weigh");
    } catch (err) {
      setError(failMessage(err));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  const onScan = async () => {
    const code = scanCode.trim();
    if (!code) return;
    try {
      const hit = await scannerLookup(code);
      await openBatch(hit.batchId);
    } catch (err) {
      setError(failMessage(err));
    }
  };

  useEffect(() => {
    if (view !== "weigh" || !session) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const ev = await getEvaluation(session.id);
        if (cancelled) return;
        setEvaluation(ev);
        setScaleDown(false);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.error === "scale_unavailable") {
          setScaleDown(true);
          setEvaluation(null);
          setError("Scale unavailable");
          return;
        }
        setError(failMessage(err));
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), 400);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [view, session?.id]);

  const active = useMemo(
    () => session?.components.find((c) => c.seq === session.activeSeq) ?? null,
    [session],
  );

  const finishIfComplete = async (snap: SessionSnapshot) => {
    if (!snap.completeAllowed) return;
    try {
      const done = await completeSession(snap.id);
      setSession(done.snapshot);
      setWriteback({ ok: true, at: new Date().toISOString() });
      setView("done");
      setError(null);
    } catch (err) {
      setWriteback({ ok: false });
      setView("done");
      setError(failMessage(err));
    }
  };

  const onConfirm = async () => {
    if (!session || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const snap = await confirmSession(session.id);
      setSession(snap);
      setOverrideNote(null);
      await finishIfComplete(snap);
    } catch (err) {
      setError(failMessage(err));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const onTare = async () => {
    if (!session) return;
    try {
      const ev = await tareSession(session.id);
      setEvaluation(ev);
      setScaleDown(false);
      setError(null);
    } catch (err) {
      setError(failMessage(err));
    }
  };

  const onQuit = async () => {
    if (!session) return;
    try {
      await quitSession(session.id);
      setSession(null);
      setBatch(null);
      setRecipe(null);
      setEvaluation(null);
      setView("queue");
      await loadQueue();
    } catch (err) {
      setError(failMessage(err));
    }
  };

  const onOverride = async () => {
    if (!session) return;
    try {
      await overrideSession(session.id, "operator request");
      setOverrideNote("AWAITING SUPERVISOR");
    } catch (err) {
      setError(failMessage(err));
    }
  };

  const onRail = async (seq: number, state: string) => {
    if (!session || state === "done") return;
    try {
      const snap = await activateComponent(session.id, seq);
      setSession(snap);
      setOverrideNote(null);
    } catch (err) {
      setError(failMessage(err));
    }
  };

  const onPrint = async () => {
    if (!session || session.lifecycle !== "completed") return;
    try {
      const t = await printTicket(session.id);
      setTicket(t);
      setDevices((d) => ({ ...d, printer: "READY" }));
      setError(null);
    } catch (err) {
      setDevices((d) => ({ ...d, printer: "UNAVAILABLE" }));
      setError(failMessage(err));
    }
  };

  const onNext = () => {
    setSession(null);
    setBatch(null);
    setRecipe(null);
    setTicket(null);
    setWriteback(null);
    setView("queue");
    void loadQueue();
  };

  const zone = evaluation?.zone ?? "under";
  const viz = evaluation ? visualZone(zone, evaluation.net, active?.target ?? 0) : "under";
  const confirmAllowed = Boolean(evaluation?.confirmAllowed) && !scaleDown && !busy;
  const unit = evaluation?.unit ?? active?.unit ?? "g";
  const target = active?.target ?? 0;
  const tol = active?.tolerance ?? 0;
  const net = evaluation?.net ?? 0;
  const axisMax = Math.max(target * 1.35, target + tol * 4, 0.001);
  const fillPct = Math.min(100, (net / axisMax) * 100);
  const bandLeft = ((target - tol) / axisMax) * 100;
  const bandWidth = ((tol * 2) / axisMax) * 100;
  const tline = (target / axisMax) * 100;

  return (
    <div className="device">
      <div className="screen">
        <div className="topbar">
          <span className="brandmark">
            <span className="n">WeighingMS</span>
            <span className="s">STATION 01</span>
          </span>
          <span className="crumb" data-testid="crumb">
            {batch ? (
              <>
                BATCH <b>{batch.id}</b> · ORDER <b>{batch.order}</b> · MACHINE <b>{batch.machine}</b>
              </>
            ) : (
              <>BATCH <b>—</b></>
            )}
          </span>
          <span className="spacer" />
          <span className="op-chip">
            <span className="dot" />
            Operator <b>{OPERATOR_CHIP}</b>
          </span>
        </div>

        {error ? (
          <div className="error-banner" data-testid="error-banner" role="alert">
            {error}
          </div>
        ) : null}

        {view === "queue" ? (
          <div className="queue" data-testid="screen-queue">
            <div className="scan-prompt">
              <div className="beam" aria-hidden="true" />
              <div>
                <div className="big">Scan a batch card to begin</div>
                <div className="sm">Or touch a row below. Queue received from OrgaTEX.</div>
                <div className="scan-row">
                  <input
                    data-testid="scan-input"
                    value={scanCode}
                    onChange={(e) => setScanCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void onScan();
                    }}
                    placeholder="Batch code"
                    aria-label="Scan batch code"
                  />
                  <button type="button" className="key" style={{ minHeight: 42, minWidth: 90 }} onClick={() => void onScan()}>
                    Lookup
                  </button>
                </div>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="q" data-testid="batch-table">
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Order</th>
                    <th>Machine</th>
                    <th>Fabric / lot</th>
                    <th>Shade</th>
                    <th>Comp.</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((row) => (
                    <tr
                      key={row.id}
                      role="button"
                      tabIndex={0}
                      className={selectedId === row.id ? "sel" : undefined}
                      data-testid={`batch-row-${row.id}`}
                      aria-label={`Select batch ${row.id}`}
                      onClick={() => void openBatch(row.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") void openBatch(row.id);
                      }}
                    >
                      <td className="mono">{row.id}</td>
                      <td className="mono">{row.order}</td>
                      <td className="mono">{row.machine}</td>
                      <td>{row.fabric}</td>
                      <td>{row.shade}</td>
                      <td className="mono">{row.componentCount}</td>
                      <td>
                        <span className={row.status === "WEIGHING" ? "tag now" : "tag"}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {view === "weigh" && session ? (
          <div className="stage" data-testid="screen-weigh">
            <aside className="rail">
              <div className="rail-head">
                <span className="t">Recipe · {batch?.shade ?? ""}</span>
                <span className="v">{session.batchId}</span>
                <span className="m">
                  {session.doneCount} of {session.totalCount} components weighed
                </span>
              </div>
              <ul className="comps">
                {session.components.map((c) => (
                  <li key={c.seq}>
                    <button
                      type="button"
                      className="comp"
                      data-state={c.state}
                      data-testid={`rail-${c.seq}`}
                      onClick={() => void onRail(c.seq, c.state)}
                    >
                      <span className="swatch" style={{ background: SWATCH[(c.seq - 1) % SWATCH.length] }} />
                      <span>
                        <div className="nm">{c.name}</div>
                        <div className="sub">{c.code} · {scaleLabel(c.scaleId)}</div>
                      </span>
                      <span>
                        <div className="qty">
                          {c.actual !== null ? formatQty(c.actual, c.unit) : formatQty(c.target, c.unit)} {c.unit}
                        </div>
                        <div className="st">
                          {c.state === "done" ? "✓" : c.state === "active" ? "WEIGHING" : "PENDING"}
                        </div>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
            <section className="weigh">
              <div className="weigh-head">
                <div className="who">
                  <span className="nm" data-testid="active-name">{active?.name ?? "—"}</span>
                  <span className="meta">
                    {active?.code ?? ""} · LOT {active?.lot ?? "—"} · CONTAINER {active?.container ?? "—"} · TARE{" "}
                    {tareFor(recipe, active?.seq ?? null)}
                  </span>
                </div>
                <div className="scale-badge" data-testid="scale-badge">
                  <span className="k">Scale selected</span>
                  <span className="v">{active ? scaleLabel(active.scaleId) : "—"}</span>
                  <span className="auto">automatic</span>
                </div>
              </div>
              <div className="readout">
                <div className="cell live" data-zone={viz} data-testid="cell-live">
                  <span className="k">Weighed now</span>
                  <span className="v">
                    <span data-testid="weighed-now">{evaluation ? formatQty(evaluation.net, unit) : "—"}</span>{" "}
                    <span className="u">{unit}</span>
                  </span>
                </div>
                <div className="cell">
                  <span className="k">Still to weigh</span>
                  <span className="v">
                    <span data-testid="still-to-weigh">
                      {evaluation ? formatQty(evaluation.remaining, unit) : "—"}
                    </span>{" "}
                    <span className="u">{unit}</span>
                  </span>
                </div>
                <div className="cell">
                  <span className="k">Target</span>
                  <span className="v">
                    <span data-testid="target">{active ? formatQty(active.target, unit) : "—"}</span>{" "}
                    <span className="u">{unit}</span>
                  </span>
                </div>
              </div>
              <div className="bar-block">
                <div className="bar" data-zone={viz} role="progressbar" aria-valuenow={Math.round(fillPct)}>
                  <div className="fill" style={{ width: `${fillPct}%` }} />
                  <div className="band" style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }} />
                  <div className="target-line" style={{ left: `${tline}%` }} />
                </div>
                <div className="bar-caption">
                  <span>0</span>
                  <span>
                    TOLERANCE ±{formatQty(tol, unit)} {unit}
                    {active ? `  (${formatQty(target - tol, unit)} – ${formatQty(target + tol, unit)})` : ""}
                  </span>
                  <span>{formatQty(axisMax, unit)} {unit}</span>
                </div>
                <div className="status-line" data-zone={viz} data-testid="status-line">
                  {overrideNote ?? statusCopy(zone, evaluation?.remaining ?? 0, unit, scaleDown)}
                </div>
              </div>
              <div className={zone === "over" ? "surplus on" : "surplus"} data-testid="surplus">
                <span className="h">
                  Surplus {evaluation?.surplus != null ? `+${formatQty(evaluation.surplus, unit)} ${unit}` : ""} — over
                  tolerance
                </span>
                <span className="note">Confirm blocked. Remaining recipe targets are not recalculated.</span>
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="key ok"
                  data-testid="btn-confirm"
                  disabled={!confirmAllowed}
                  onClick={() => void onConfirm()}
                >
                  OK · Confirm<span className="fn">F1</span>
                </button>
                <button type="button" className="key" data-testid="btn-tare" onClick={() => void onTare()}>
                  Re-tare<span className="fn">F2</span>
                </button>
                <button type="button" className="key ghost" data-testid="btn-quit" onClick={() => void onQuit()}>
                  Quit<span className="fn">F4</span>
                </button>
                <button
                  type="button"
                  className="key ghost"
                  data-testid="btn-override"
                  style={{ marginLeft: "auto" }}
                  onClick={() => void onOverride()}
                >
                  Supervisor override
                </button>
              </div>
            </section>
          </div>
        ) : null}

        {view === "done" && session ? (
          <div className="done-stage" data-testid="screen-done">
            <div className="done-msg">
              <span className="h">Batch {session.batchId} weighed</span>
              <div className="summary">
                <div className="r">
                  <span className="k">Components weighed</span>
                  <span className="v" data-testid="done-count">
                    {session.doneCount} of {session.totalCount}
                  </span>
                </div>
                <div className="r">
                  <span className="k">All within tolerance</span>
                  <span className="v good">YES</span>
                </div>
                <div className="r">
                  <span className="k">Operator</span>
                  <span className="v">{session.operatorId}</span>
                </div>
                <div className="r">
                  <span className="k">Written to OrgaTEX</span>
                  <span
                    className={writeback?.ok ? "v good" : "v bad"}
                    data-testid="orgatex-writeback"
                  >
                    {writeback?.ok ? "CONFIRMED" : "NOT CONFIRMED"}
                  </span>
                </div>
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="key ok"
                  data-testid="btn-print"
                  disabled={!writeback?.ok}
                  onClick={() => void onPrint()}
                >
                  Print ticket<span className="fn">F1</span>
                </button>
                <button type="button" className="key" data-testid="btn-next" onClick={onNext}>
                  Next batch<span className="fn">F3</span>
                </button>
              </div>
            </div>
            <div>
              {ticket ? (
                <div className="ticket" data-testid="ticket-preview">
                  <div className="c bold">{ticket.title}</div>
                  <hr />
                  BATCH&nbsp;&nbsp;&nbsp;{ticket.batch}
                  <br />
                  ORDER&nbsp;&nbsp;&nbsp;{ticket.order}
                  <br />
                  MACHINE&nbsp;{ticket.machine}
                  <br />
                  SHADE&nbsp;&nbsp;&nbsp;{ticket.shade}
                  <br />
                  DATE&nbsp;&nbsp;&nbsp;&nbsp;{ticket.date}
                  <br />
                  OPER.&nbsp;&nbsp;&nbsp;{ticket.operator}
                  <hr />
                  <span className="bold">COMPONENT&nbsp;&nbsp;&nbsp;TGT&nbsp;&nbsp;&nbsp;&nbsp;ACT</span>
                  <br />
                  {ticket.components.map((c) => (
                    <span key={c.code}>
                      {c.name}&nbsp;{formatQty(c.target, c.unit)}&nbsp;
                      {c.actual === null ? "—" : formatQty(c.actual, c.unit)} {c.unit}
                      <br />
                    </span>
                  ))}
                  <hr />
                  <div className="c">ALL WITHIN TOLERANCE</div>
                  <div className="barcode" aria-hidden="true">
                    {barcodeBars(ticket.barcode).map((w, i) => (
                      <i key={i} style={{ width: w }} />
                    ))}
                  </div>
                  <div className="c">{ticket.barcode}</div>
                </div>
              ) : (
                <p className="ticket-placeholder">Print to load ticket from Dummy Printer.</p>
              )}
            </div>
          </div>
        ) : null}

        <div className="strip" data-testid="device-strip">
          <span className={devices.scale3 === "READY" ? "stat" : "stat down"}>
            <span className={devices.scale3 === "READY" ? "dot" : "dot down"} />
            SCALE 3 kg · {devices.scale3}
          </span>
          <span className={devices.scale32 === "READY" ? "stat" : "stat down"}>
            <span className={devices.scale32 === "READY" ? "dot" : "dot down"} />
            SCALE 32 kg · {devices.scale32}
          </span>
          <span className="stat">
            <span className="dot" />
            SCANNER · {devices.scanner}
          </span>
          <span className={devices.printer === "READY" ? "stat" : "stat down"} data-testid="printer-strip">
            <span className={devices.printer === "READY" ? "dot" : "dot down"} />
            PRINTER · {devices.printer}
          </span>
          <span className={devices.orgatex === "LINKED" ? "stat" : "stat down"} data-testid="orgatex-strip">
            <span className={devices.orgatex === "LINKED" ? "dot" : "dot down"} />
            ORGATEX · {devices.orgatex}
          </span>
          <span className="spacer" />
          <span>EN</span>
          <span>{clock}</span>
        </div>
      </div>
    </div>
  );
}
