import { GlossaryItem, ensureDb } from './utils/db';

export async function getGlossaryList(searchTerm = ''): Promise<GlossaryItem[]> {
  const db = await ensureDb();

  if (searchTerm && searchTerm.trim() !== '') {
    return db.getAllAsync<GlossaryItem>(
      `SELECT word, definition FROM glossary WHERE word LIKE ? COLLATE NOCASE ORDER BY word ASC;`,
      [`%${searchTerm}%`]
    );
  }

  return db.getAllAsync<GlossaryItem>(
    `SELECT word, definition FROM glossary ORDER BY word ASC;`
  );
}
