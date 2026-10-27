CREATE TABLE IF NOT EXISTS scales (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity_kg REAL NOT NULL,
  unit TEXT NOT NULL,
  net REAL NOT NULL,
  tare_value REAL NOT NULL,
  unavailable INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);
