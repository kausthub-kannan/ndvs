import {
  AdjacentPasuramIds,
  PasuramDetail,
  PasuramListItem,
  PrabhandhamListItem,
  ensureDb,
} from './utils/db';

/**
 * Fetches all prabandhams with their associated Alwar name and pasuram count.
 * Rows with a blank azhwar are excluded via TRIM + filtering.
 */
export async function getPrabhandhamList(): Promise<PrabhandhamListItem[]> {
  const db = await ensureDb();
  return db.getAllAsync<PrabhandhamListItem>(`
    SELECT
      prabhandham,
      TRIM(azhwar) AS azhwar,
      COUNT(*) AS pasuram_count
    FROM prabhandham
    WHERE TRIM(azhwar) != ''
    GROUP BY prabhandham, TRIM(azhwar)
    ORDER BY prabhandham ASC;
  `);
}

/**
 * Fetches all pasurams for a given prabhandham name.
 */
export async function getPasuramsByPrabhandham(
  prabhandhamName: string
): Promise<PasuramListItem[]> {
  const db = await ensureDb();
  return db.getAllAsync<PasuramListItem>(
    `SELECT id, si_no, prabhandham, tamil_scripts, english_scripts, azhwar, bookmark
     FROM prabhandham
     WHERE prabhandham = ?
     ORDER BY si_no ASC;`,
    [prabhandhamName]
  );
}

/**
 * Fetches a single pasuram by its primary key.
 */
export async function getPasuramById(id: number): Promise<PasuramDetail | null> {
  const db = await ensureDb();
  return db.getFirstAsync<PasuramDetail>(
    `SELECT id, si_no, prabhandham, tamil_scripts, english_scripts, meaning, purport,
            azhwar, bookmark, archavathara, avataram, rasa
     FROM prabhandham
     WHERE id = ?;`,
    [id]
  );
}

/**
 * Returns the previous and next pasuram IDs within the same prabhandham, ordered by si_no.
 */
export async function getAdjacentPasuramIds(id: number): Promise<AdjacentPasuramIds> {
  const db = await ensureDb();

  const current = await db.getFirstAsync<{ prabhandham: string; si_no: number }>(
    `SELECT prabhandham, si_no FROM prabhandham WHERE id = ?;`,
    [id]
  );
  if (!current) return { prevId: null, nextId: null };

  const prev = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM prabhandham
     WHERE prabhandham = ? AND si_no < ?
     ORDER BY si_no DESC
     LIMIT 1;`,
    [current.prabhandham, current.si_no]
  );

  const next = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM prabhandham
     WHERE prabhandham = ? AND si_no > ?
     ORDER BY si_no ASC
     LIMIT 1;`,
    [current.prabhandham, current.si_no]
  );

  return {
    prevId: prev ? prev.id : null,
    nextId: next ? next.id : null,
  };
}

/**
 * Toggles the bookmark status of a pasuram.
 * @returns The new bookmark value (0 or 1).
 */
export async function toggleBookmark(id: number, currentValue: number): Promise<number> {
  const db = await ensureDb();
  const newValue = currentValue === 1 ? 0 : 1;
  await db.runAsync(
    `UPDATE prabhandham SET bookmark = ? WHERE id = ?;`,
    [newValue, id]
  );
  return newValue;
}

/**
 * Fetches all bookmarked pasurams.
 */
export async function getBookmarkedPasurams(): Promise<PasuramListItem[]> {
  const db = await ensureDb();
  return db.getAllAsync<PasuramListItem>(
    `SELECT id, si_no, prabhandham, tamil_scripts, english_scripts, azhwar, bookmark
     FROM prabhandham
     WHERE bookmark = 1
     ORDER BY prabhandham ASC, si_no ASC;`
  );
}

/**
 * Returns a deterministic pasuram for the current calendar day.
 * Uses the date (YYYYMMDD integer) modulo the total row count to pick an id.
 */
export async function getPasuramOfDay(): Promise<PasuramDetail | null> {
  const db = await ensureDb();

  const countRow = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total FROM prabhandham;`
  );
  if (!countRow || countRow.total === 0) return null;

  const now = new Date();
  const seed =
    now.getFullYear() * 10000 +
    (now.getMonth() + 1) * 100 +
    now.getDate();
  const offset = seed % countRow.total;

  return db.getFirstAsync<PasuramDetail>(
    `SELECT id, si_no, prabhandham, tamil_scripts, english_scripts, meaning, purport,
            azhwar, bookmark, archavathara, avataram, rasa
     FROM prabhandham
     ORDER BY id ASC
     LIMIT 1 OFFSET ?;`,
    [offset]
  );
}

