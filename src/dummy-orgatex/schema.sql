CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  order_no TEXT NOT NULL,
  machine TEXT NOT NULL,
  fabric TEXT NOT NULL,
  shade TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recipe_components (
  batch_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  target REAL NOT NULL,
  unit TEXT NOT NULL,
  tol REAL NOT NULL,
  scale TEXT NOT NULL,
  lot TEXT NOT NULL,
  container TEXT NOT NULL,
  tare REAL NOT NULL,
  tare_unit TEXT NOT NULL,
  PRIMARY KEY (batch_id, seq),
  FOREIGN KEY (batch_id) REFERENCES batches(id)
);

CREATE TABLE IF NOT EXISTS consumption (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id TEXT NOT NULL,
  operator TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (batch_id) REFERENCES batches(id)
);

CREATE TABLE IF NOT EXISTS scanner_codes (
  code TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  FOREIGN KEY (batch_id) REFERENCES batches(id)
);

CREATE TABLE IF NOT EXISTS dummy_flags (
  name TEXT PRIMARY KEY,
  value INTEGER NOT NULL
);
