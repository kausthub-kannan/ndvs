import { AcharyaDetail, AcharyaListItem, ensureDb } from './utils/db';

export async function getAcharyasList(): Promise<AcharyaListItem[]> {
  const db = await ensureDb();
  return db.getAllAsync<AcharyaListItem>(
    `SELECT id, name FROM acharyas ORDER BY id ASC;`
  );
}

export async function getAcharyaById(id: number): Promise<AcharyaDetail | null> {
  const db = await ensureDb();
  return db.getFirstAsync<AcharyaDetail>(
    `SELECT id, name, bio, time_period, birthplace FROM acharyas WHERE id = ?;`,
    [id]
  );
}
