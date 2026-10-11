import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

export interface AcharyaListItem {
  id: number;
  name: string;
}

export interface AcharyaDetail {
  id: number;
  name: string;
  bio: string;
  time_period: string;
  birthplace: string;
}

export interface AlwarListItem {
  id: number;
  name: string;
}

export interface AlwarDetail {
  id: number;
  name: string;
  incarnation: string;
  bio: string;
  time_period: string;
  birthplace: string;
  taniyan_tamil: string | null;
  taniyan_english: string | null;
}

export interface DivyaDeshamListItem {
  id: number;
  name: string;
}

export interface DivyaDeshamDetail {
  id: number;
  name: string;
  place: string;
  state: string;
  info: string;
  coordinates?: string;
}

export interface GlossaryItem {
  word: string;
  definition: string;
}

export interface PrabhandhamListItem {
  prabhandham: string;
  azhwar: string;
  pasuram_count: number;
}

export interface PasuramListItem {
  id: number;
  si_no: number;
  prabhandham: string;
  tamil_scripts: string;
  english_scripts: string;
  azhwar: string;
  bookmark: number;
}

export interface PasuramDetail extends PasuramListItem {
  meaning: string;
  purport: string;
  archavathara: string;
  avataram: string;
  rasa: string;
}

export interface AdjacentPasuramIds {
  prevId: number | null;
  nextId: number | null;
}

export interface FilterTags {
  azhwar: string[];
  archavathara: string[];
  avataram: string[];
  rasa: string[];
}

export type SearchType = 'lyrics' | 'meaning';

export interface SearchTags {
  azhwar?: string[];
  archavathara?: string[];
  avataram?: string[];
  rasa?: string[];
}

const DB_NAME = "ndvs.db";
const DB_VERSION = 13;

let _dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function copyAssetDb(dest: File): Promise<void> {
  const dbAsset = require('../../assets/db/ndvs.db');
  const asset = Asset.fromModule(dbAsset);
  await asset.downloadAsync();

  if (!asset.localUri) {
    throw new Error('[db] Failed to resolve local URI for database asset');
  }

  const assetFile = new File(asset.localUri);
  assetFile.copy(dest);
}

/** Rebuild the prabhandham_fts virtual table from the prabhandham table. */
async function rebuildFts(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.runAsync(`INSERT INTO prabhandham_fts(prabhandham_fts) VALUES('rebuild');`);
  console.log('[db] FTS index rebuilt.');
}

/** Read the stored DB version from app_settings. Returns 0 if missing. */
async function getStoredVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    // Check if app_settings table exists
    const tableExists = await db.getFirstAsync<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='app_settings';`
    );
    if (!tableExists) return 0;

    const row = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM app_settings WHERE key = 'db_version';`
    );
    return row ? parseInt(row.value, 10) : 0;
  } catch {
    return 0;
  }
}

/** Stamp the current DB_VERSION into app_settings. */
async function stampVersion(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.runAsync(
    `CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT);`
  );
  await db.runAsync(
    `INSERT OR REPLACE INTO app_settings (key, value) VALUES ('db_version', ?);`,
    [String(DB_VERSION)]
  );
}

/**
 * Flush WAL writes to the main DB file so they survive hot reload / fast refresh.
 * Without this, writes stay in the WAL journal and can be lost when the
 * JS context is torn down without closing the connection.
 */
async function flushWrites(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    await db.runAsync(`PRAGMA wal_checkpoint(TRUNCATE);`);
  } catch {
    // Best-effort: checkpoint may fail on read-only copies; writes are still in the WAL
  }
}

// ── User data types for migration ────────────────────────────────────

interface UserRow { name: string; mode: string; language: string }
interface SettingsRow { key: string; value: string }
interface BookmarkRow { id: number }

// ── Main entry point ─────────────────────────────────────────────────

export function ensureDb(): Promise<SQLite.SQLiteDatabase> {
  if (_dbPromise) return _dbPromise;

  _dbPromise = (async () => {
    const sqliteDir = new Directory(Paths.document, 'SQLite');
    if (!sqliteDir.exists) {
      sqliteDir.create();
    }

    const dbFile = new File(sqliteDir, DB_NAME);

    // ── Case 1: Fresh install (no local DB) ───────────────────────
    if (!dbFile.exists) {
      console.log('[db] Fresh install — copying bundled database.');
      await copyAssetDb(dbFile);
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await rebuildFts(db);
      await stampVersion(db);
      await flushWrites(db);
      return db;
    }

    // ── Case 2: DB exists — check version ─────────────────────────
    const existingDb = await SQLite.openDatabaseAsync(DB_NAME);
    const storedVersion = await getStoredVersion(existingDb);

    if (storedVersion >= DB_VERSION) {
      // Up to date — nothing to do
      console.log(`[db] Database is up to date (v${storedVersion}).`);
      return existingDb;
    }

    // ── Case 3: Upgrade needed ────────────────────────────────────
    console.log(`[db] Upgrading database from v${storedVersion} → v${DB_VERSION}.`);

    // 3a. Extract user data to preserve
    let userRows: UserRow[] = [];
    let settingsRows: SettingsRow[] = [];
    let bookmarkedIds: BookmarkRow[] = [];

    try {
      // User table
      const userTableExists = await existingDb.getFirstAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='user';`
      );
      if (userTableExists) {
        userRows = await existingDb.getAllAsync<UserRow>(`SELECT name, mode, language FROM "user";`);
      }

      // App settings (disclaimer, etc. — excluding db_version which will be re-stamped)
      const settingsTableExists = await existingDb.getFirstAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='app_settings';`
      );
      if (settingsTableExists) {
        settingsRows = await existingDb.getAllAsync<SettingsRow>(
          `SELECT key, value FROM app_settings WHERE key != 'db_version';`
        );
      }

      // Bookmarked pasuram IDs
      const prabTableExists = await existingDb.getFirstAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='prabhandham';`
      );
      if (prabTableExists) {
        bookmarkedIds = await existingDb.getAllAsync<BookmarkRow>(
          `SELECT id FROM prabhandham WHERE bookmark = 1;`
        );
      }
    } catch (err) {
      console.warn('[db] Error extracting user data — continuing with clean DB:', err);
    }

    console.log(`[db] Preserved: ${userRows.length} user(s), ${settingsRows.length} setting(s), ${bookmarkedIds.length} bookmark(s).`);

    // 3b. Close and delete old DB
    await existingDb.closeAsync();
    try {
      dbFile.delete();
      console.log('[db] Old database file deleted.');
    } catch (err) {
      console.error('[db] Failed to delete old database file:', err);
    }

    // 3c. Copy fresh asset
    await copyAssetDb(dbFile);
    const newDb = await SQLite.openDatabaseAsync(DB_NAME);

    // 3d. Restore user data
    try {
      // Restore user table
      if (userRows.length > 0) {
        await newDb.runAsync(
          `CREATE TABLE IF NOT EXISTS "user" ("name" TEXT PRIMARY KEY, "mode" BLOB DEFAULT 'dark', "language" TEXT DEFAULT 'english');`
        );
        for (const row of userRows) {
          await newDb.runAsync(
            `INSERT OR REPLACE INTO "user" (name, mode, language) VALUES (?, ?, ?);`,
            [row.name, row.mode, row.language]
          );
        }
      }

      // Restore app_settings
      await stampVersion(newDb);
      for (const row of settingsRows) {
        await newDb.runAsync(
          `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);`,
          [row.key, row.value]
        );
      }

      // Restore bookmarks
      if (bookmarkedIds.length > 0) {
        for (const { id } of bookmarkedIds) {
          await newDb.runAsync(
            `UPDATE prabhandham SET bookmark = 1 WHERE id = ?;`,
            [id]
          );
        }
      }
    } catch (err) {
      console.error('[db] Error restoring user data:', err);
    }

    // 3e. Rebuild FTS index for consistency
    await rebuildFts(newDb);

    // Flush all writes to the main DB file (durability across hot reloads)
    await flushWrites(newDb);

    console.log('[db] Migration complete.');
    return newDb;
  })();

  return _dbPromise;
}

export async function resetDb(): Promise<void> {
  const sqliteDir = new Directory(Paths.document, 'SQLite');
  const dbFile = new File(sqliteDir, DB_NAME);
  
  if (dbFile.exists) {
    try {
      dbFile.delete();
      console.log('[db] Successfully deleted local database file.');
    } catch (err) {
      console.error('[db] Failed to delete database file:', err);
    }
  }
  
  _dbPromise = null;
}
