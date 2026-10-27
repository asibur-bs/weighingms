import type Database from "better-sqlite3";

const SCALES = [
  {
    id: "scale-3kg",
    name: "3 kg precision",
    capacity_kg: 3,
    unit: "g",
  },
  {
    id: "scale-32kg",
    name: "32 kg floor",
    capacity_kg: 32,
    unit: "kg",
  },
];

/** Insert training scales if missing. Does not overwrite live net. */
export function seedDummyScale(db: Database.Database): void {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO scales
     (id, name, capacity_kg, unit, net, tare_value, unavailable, updated_at)
     VALUES (@id, @name, @capacity_kg, @unit, 0, 0, 0, @updated_at)`,
  );
  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    for (const scale of SCALES) {
      insert.run({ ...scale, updated_at: now });
    }
  });
  tx();
}
