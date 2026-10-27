CREATE TABLE IF NOT EXISTS weighing_sessions (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  operator_id TEXT NOT NULL,
  active_seq INTEGER,
  lifecycle TEXT NOT NULL DEFAULT 'open',
  completed_at TEXT,
  started_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS session_components (
  session_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  state TEXT NOT NULL,
  lot TEXT NOT NULL,
  container TEXT NOT NULL,
  recipe_tare_mg INTEGER NOT NULL,
  tare_unit TEXT NOT NULL,
  scale_id TEXT NOT NULL,
  unit TEXT NOT NULL,
  target_mg INTEGER NOT NULL,
  tolerance_mg INTEGER NOT NULL,
  actual_mg INTEGER,
  PRIMARY KEY (session_id, seq),
  FOREIGN KEY (session_id) REFERENCES weighing_sessions(id)
);

CREATE TABLE IF NOT EXISTS confirm_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  component_seq INTEGER NOT NULL,
  actual_mg INTEGER NOT NULL,
  operator_id TEXT NOT NULL,
  lot TEXT NOT NULL,
  container TEXT NOT NULL,
  tare_mg INTEGER NOT NULL,
  scale_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES weighing_sessions(id)
);

CREATE TABLE IF NOT EXISTS override_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  component_seq INTEGER NOT NULL,
  operator_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES weighing_sessions(id)
);
