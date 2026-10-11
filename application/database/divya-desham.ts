import { DivyaDeshamDetail, DivyaDeshamListItem, ensureDb } from './utils/db';

export async function getDivyaDeshamsList(): Promise<DivyaDeshamListItem[]> {
  const db = await ensureDb();
  return db.getAllAsync<DivyaDeshamListItem>(
    `SELECT id, name FROM divya_deshams ORDER BY id ASC;`
  );
}

export async function getDivyaDeshamById(id: number): Promise<DivyaDeshamDetail | null> {
  const db = await ensureDb();
  return db.getFirstAsync<DivyaDeshamDetail>(
    `SELECT id, name, place, state, info, coordinates FROM divya_deshams WHERE id = ?;`,
    [id]
  );
}

export interface DivyaDeshamCoordsItem {
  id: number;
  name: string;
  coordinates: string;
  place: string;
  state: string;
}

export async function getDivyaDeshamsWithCoords(): Promise<DivyaDeshamCoordsItem[]> {
  const db = await ensureDb();
  return db.getAllAsync<DivyaDeshamCoordsItem>(
    `SELECT id, name, coordinates, place, state FROM divya_deshams WHERE coordinates IS NOT NULL AND coordinates != '';`
  );
}
