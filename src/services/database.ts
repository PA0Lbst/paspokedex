import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

/**
 * The app's only SQLite database. Every feature that stores data on the phone
 * (search index #5, favorites #7) gets it from `getDatabase()` and adds its tables
 * as a new migration step below.
 */

const DATABASE_NAME = 'paspokedex.db';
export const DATABASE_VERSION = 2;

/** Brings the schema up to DATABASE_VERSION, one step at a time (`PRAGMA user_version`). */
export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  if (version >= DATABASE_VERSION) return;

  if (version === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS pokemon_index (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    `);
    version = 1;
  }

  if (version === 1) {
    // Favorites (#7): newest first, so `added_at` is stored.
    await db.execAsync(
      'CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL, added_at INTEGER NOT NULL);',
    );
    version = 2;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

let databasePromise: Promise<SQLiteDatabase> | null = null;

/** Opens and migrates the database once; later calls get the same connection. */
export function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync(DATABASE_NAME)
      .then(async (db) => {
        await migrateDatabase(db);
        return db;
      })
      .catch((error: unknown) => {
        // Let the next call try again instead of keeping a failed promise forever.
        databasePromise = null;
        throw error;
      });
  }
  return databasePromise;
}
