import { FilterTags, PasuramListItem, SearchTags, SearchType, ensureDb } from './utils/db';

export async function getFilterTags(): Promise<FilterTags> {
  const db = await ensureDb();
  const rows = await db.getAllAsync<{
    azhwar: string | null;
    archavathara: string | null;
    avataram: string | null;
    rasa: string | null;
  }>(`SELECT DISTINCT azhwar, archavathara, avataram, rasa FROM prabhandham;`);

  const azhwar = new Set<string>();
  const archavathara = new Set<string>();
  const avataram = new Set<string>();
  const rasa = new Set<string>();

  rows.forEach(row => {
    if (row.azhwar?.trim()) azhwar.add(row.azhwar.trim());
    if (row.archavathara) {
      row.archavathara.split(',').forEach(part => {
        if (part.trim()) archavathara.add(part.trim());
      });
    }
    if (row.avataram) {
      row.avataram.split(',').forEach(part => {
        if (part.trim()) avataram.add(part.trim());
      });
    }
    if (row.rasa) {
      row.rasa.split(',').forEach(part => {
        if (part.trim()) rasa.add(part.trim());
      });
    }
  });

  return {
    azhwar: Array.from(azhwar).sort(),
    archavathara: Array.from(archavathara).sort(),
    avataram: Array.from(avataram).sort(),
    rasa: Array.from(rasa).sort(),
  };
}

/**
 * Searches pasurams based on text query and optional tag filters.
 * Uses FTS5 for full-text search when a query string is provided.
 */
export async function searchPasurams(
  query: string,
  searchType: SearchType,
  tags: SearchTags = {}
): Promise<PasuramListItem[]> {
  const db = await ensureDb();
  let sql = '';
  const params: (string | number)[] = [];

  // Build tag filter conditions
  const filterConditions: string[] = [];

  if (tags.azhwar && tags.azhwar.length > 0) {
    const placeholders = tags.azhwar.map(() => '?').join(',');
    filterConditions.push(`TRIM(p.azhwar) IN (${placeholders})`);
    params.push(...tags.azhwar);
  }
  if (tags.archavathara && tags.archavathara.length > 0) {
    const likeConditions = tags.archavathara.map(() => `p.archavathara LIKE ?`).join(' OR ');
    filterConditions.push(`(${likeConditions})`);
    tags.archavathara.forEach(tag => params.push(`%${tag}%`));
  }
  if (tags.avataram && tags.avataram.length > 0) {
    const likeConditions = tags.avataram.map(() => `p.avataram LIKE ?`).join(' OR ');
    filterConditions.push(`(${likeConditions})`);
    tags.avataram.forEach(tag => params.push(`%${tag}%`));
  }
  if (tags.rasa && tags.rasa.length > 0) {
    const likeConditions = tags.rasa.map(() => `p.rasa LIKE ?`).join(' OR ');
    filterConditions.push(`(${likeConditions})`);
    tags.rasa.forEach(tag => params.push(`%${tag}%`));
  }

  const filterSql = filterConditions.length > 0 ? ` AND ${filterConditions.join(' AND ')}` : '';

  if (!query || query.trim() === '') {
    // No text query — only apply tag filters (guard: don't dump all rows)
    if (filterConditions.length === 0) return [];

    sql = `
      SELECT p.id, p.si_no, p.prabhandham, p.tamil_scripts, p.english_scripts, p.azhwar, p.bookmark
      FROM prabhandham p
      WHERE 1=1 ${filterSql}
      ORDER BY p.prabhandham ASC, p.si_no ASC
      LIMIT 200;
    `;
  } else {
    const sanitizedQuery = query.trim().replace(/['\"]/g, '');
    const ftsQuery = `"${sanitizedQuery}" *`;

    const ftsExpr =
      searchType === 'lyrics'
        ? `{tamil_scripts english_scripts} : ${ftsQuery}`
        : `meaning : ${ftsQuery}`;

    // FTS expression goes first in the params list
    params.unshift(ftsExpr);

    sql = `
      SELECT p.id, p.si_no, p.prabhandham, p.tamil_scripts, p.english_scripts, p.azhwar, p.bookmark, f.rank
      FROM prabhandham_fts f
      JOIN prabhandham p ON f.rowid = p.id
      WHERE prabhandham_fts MATCH ? ${filterSql}
      ORDER BY f.rank
      LIMIT 200;
    `;
  }

  try {
    return await db.getAllAsync<PasuramListItem>(sql, params);
  } catch (e) {
    console.error('[search] searchPasurams failed:', e);
    return [];
  }
}
