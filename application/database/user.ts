import { ensureDb } from './utils/db';

/**
 * Checks if the disclaimer has been accepted by the user.
 */
export async function isDisclaimerAccepted(): Promise<boolean> {
  try {
    const db = await ensureDb();
    // Create settings table if not exists
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
    const result = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM app_settings WHERE key = 'disclaimer_accepted';`
    );
    return result?.value === 'true';
  } catch (error) {
    console.error('[db] Failed to check disclaimer acceptance status:', error);
    return false;
  }
}

/**
 * Saves the disclaimer acceptance status.
 */
export async function setDisclaimerAccepted(accepted: boolean = true): Promise<void> {
  try {
    const db = await ensureDb();
    // Create settings table if not exists
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
    await db.runAsync(
      `INSERT OR REPLACE INTO app_settings (key, value) VALUES ('disclaimer_accepted', ?);`,
      [accepted ? 'true' : 'false']
    );
  } catch (error) {
    console.error('[db] Failed to save disclaimer acceptance status:', error);
  }
}
