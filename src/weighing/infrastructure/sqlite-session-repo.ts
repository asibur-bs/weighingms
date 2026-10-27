import type Database from "better-sqlite3";
import type { QuantityUnit } from "../domain/quantity.ts";
import type {
  ConfirmRecord,
  OverrideRequest,
  SessionComponent,
  SessionLifecycle,
  WeighingSession,
} from "../domain/types.ts";
import type {
  ConfirmRecordRepository,
  OverrideRequestRepository,
  WeighingSessionRepository,
} from "../application/ports.ts";

interface SessionRow {
  id: string;
  batch_id: string;
  operator_id: string;
  active_seq: number | null;
  lifecycle: SessionLifecycle | null;
  completed_at: string | null;
  started_at: string;
}

interface ComponentRow {
  session_id: string;
  seq: number;
  name: string;
  code: string;
  state: SessionComponent["state"];
  lot: string;
  container: string;
  recipe_tare_mg: number;
  tare_unit: QuantityUnit;
  scale_id: string;
  unit: QuantityUnit;
  target_mg: number;
  tolerance_mg: number;
  actual_mg: number | null;
}

function toComponent(row: ComponentRow): SessionComponent {
  return {
    seq: row.seq,
    name: row.name,
    code: row.code,
    state: row.state,
    lot: row.lot,
    container: row.container,
    recipeTareMg: row.recipe_tare_mg,
    tareUnit: row.tare_unit,
    scaleId: row.scale_id,
    unit: row.unit,
    targetMg: row.target_mg,
    toleranceMg: row.tolerance_mg,
    actualMg: row.actual_mg,
  };
}

function activeSeqFromDb(value: number | null): number | null {
  if (value === null || value === 0) return null;
  return value;
}

function activeSeqToDb(value: number | null): number {
  return value ?? 0;
}

export function sqliteSessionRepo(db: Database.Database): WeighingSessionRepository {
  return {
    save(session: WeighingSession): void {
      const tx = db.transaction(() => {
        db.prepare(
          `INSERT INTO weighing_sessions
           (id, batch_id, operator_id, active_seq, lifecycle, completed_at, started_at)
           VALUES (@id, @batchId, @operatorId, @activeSeq, @lifecycle, @completedAt, @startedAt)
           ON CONFLICT(id) DO UPDATE SET
             operator_id = excluded.operator_id,
             active_seq = excluded.active_seq,
             lifecycle = excluded.lifecycle,
             completed_at = excluded.completed_at`,
        ).run({
          id: session.id,
          batchId: session.batchId,
          operatorId: session.operatorId,
          activeSeq: activeSeqToDb(session.activeSeq),
          lifecycle: session.lifecycle,
          completedAt: session.completedAt,
          startedAt: session.startedAt,
        });
        db.prepare(`DELETE FROM session_components WHERE session_id = ?`).run(session.id);
        const insert = db.prepare(
          `INSERT INTO session_components
           (session_id, seq, name, code, state, lot, container, recipe_tare_mg, tare_unit,
            scale_id, unit, target_mg, tolerance_mg, actual_mg)
           VALUES (@session_id, @seq, @name, @code, @state, @lot, @container, @recipe_tare_mg,
            @tare_unit, @scale_id, @unit, @target_mg, @tolerance_mg, @actual_mg)`,
        );
        for (const c of session.components) {
          insert.run({
            session_id: session.id,
            seq: c.seq,
            name: c.name,
            code: c.code,
            state: c.state,
            lot: c.lot,
            container: c.container,
            recipe_tare_mg: c.recipeTareMg,
            tare_unit: c.tareUnit,
            scale_id: c.scaleId,
            unit: c.unit,
            target_mg: c.targetMg,
            tolerance_mg: c.toleranceMg,
            actual_mg: c.actualMg,
          });
        }
      });
      tx();
    },
    getById(id: string): WeighingSession | null {
      const row = db
        .prepare(
          `SELECT id, batch_id, operator_id, active_seq, lifecycle, completed_at, started_at
           FROM weighing_sessions WHERE id = ?`,
        )
        .get(id) as SessionRow | undefined;
      if (!row) return null;
      const comps = db
        .prepare(`SELECT * FROM session_components WHERE session_id = ? ORDER BY seq`)
        .all(id) as ComponentRow[];
      return {
        id: row.id,
        batchId: row.batch_id,
        operatorId: row.operator_id,
        activeSeq: activeSeqFromDb(row.active_seq),
        lifecycle: row.lifecycle ?? "open",
        startedAt: row.started_at,
        completedAt: row.completed_at,
        components: comps.map(toComponent),
      };
    },
  };
}

export function sqliteConfirmRepo(db: Database.Database): ConfirmRecordRepository {
  return {
    append(record: Omit<ConfirmRecord, "id">): ConfirmRecord {
      const info = db
        .prepare(
          `INSERT INTO confirm_records
           (session_id, component_seq, actual_mg, operator_id, lot, container, tare_mg, scale_id, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          record.sessionId,
          record.componentSeq,
          record.actualMg,
          record.operatorId,
          record.lot,
          record.container,
          record.tareMg,
          record.scaleId,
          record.timestamp,
        );
      return { ...record, id: Number(info.lastInsertRowid) };
    },
  };
}

export function sqliteOverrideRepo(db: Database.Database): OverrideRequestRepository {
  return {
    append(record: Omit<OverrideRequest, "id">): OverrideRequest {
      const info = db
        .prepare(
          `INSERT INTO override_requests
           (session_id, component_seq, operator_id, timestamp, reason, status)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run(
          record.sessionId,
          record.componentSeq,
          record.operatorId,
          record.timestamp,
          record.reason,
          record.status,
        );
      return { ...record, id: Number(info.lastInsertRowid) };
    },
    listBySession(sessionId: string): OverrideRequest[] {
      const rows = db
        .prepare(
          `SELECT id, session_id, component_seq, operator_id, timestamp, reason, status
           FROM override_requests WHERE session_id = ? ORDER BY id`,
        )
        .all(sessionId) as Array<{
        id: number;
        session_id: string;
        component_seq: number;
        operator_id: string;
        timestamp: string;
        reason: string;
        status: "requested";
      }>;
      return rows.map((r) => ({
        id: r.id,
        sessionId: r.session_id,
        componentSeq: r.component_seq,
        operatorId: r.operator_id,
        timestamp: r.timestamp,
        reason: r.reason,
        status: r.status,
      }));
    },
  };
}
