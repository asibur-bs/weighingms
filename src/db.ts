import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const here = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_DB_PATH = join(here, "..", "data", "weighingms.sqlite");

export function openDb(dbPath = DEFAULT_DB_PATH): Database.Database {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

function addColumnIfMissing(
  db: Database.Database,
  table: string,
  column: string,
  spec: string,
): void {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (cols.some((c) => c.name === column)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${spec}`);
}

export function migrate(db: Database.Database): void {
  const orgatex = readFileSync(join(here, "dummy-orgatex", "schema.sql"), "utf8");
  const scale = readFileSync(join(here, "dummy-scale", "schema.sql"), "utf8");
  const weighing = readFileSync(join(here, "weighing", "infrastructure", "schema.sql"), "utf8");
  const printer = readFileSync(join(here, "dummy-printer", "schema.sql"), "utf8");
  db.exec(orgatex);
  db.exec(scale);
  db.exec(weighing);
  db.exec(printer);
  addColumnIfMissing(db, "weighing_sessions", "lifecycle", "TEXT NOT NULL DEFAULT 'open'");
  addColumnIfMissing(db, "weighing_sessions", "completed_at", "TEXT");
  db.prepare(
    `INSERT OR IGNORE INTO dummy_flags (name, value) VALUES ('printer_unavailable', 0)`,
  ).run();
}
