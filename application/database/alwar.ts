import { AlwarDetail, AlwarListItem, ensureDb } from './utils/db';

export async function getAlwarsList(): Promise<AlwarListItem[]> {
  const db = await ensureDb();
  return db.getAllAsync<AlwarListItem>(
    `SELECT id, name FROM alwars ORDER BY id ASC;`
  );
}

export async function getAlwarById(id: number): Promise<AlwarDetail | null> {
  const db = await ensureDb();
  return db.getFirstAsync<AlwarDetail>(
    `SELECT id, name, incarnation, bio, time_period, birthplace, taniyan_tamil, taniyan_english FROM alwars WHERE id = ?;`,
    [id]
  );
}
