/**
 * A tiny in-memory stand-in for the expo-sqlite database, for tests. It understands
 * only the statements the app runs (database.ts, pokemon-index-store.ts); anything
 * else throws, so a new query can't silently pass untested.
 */

type Param = string | number;

export type FakeDatabase = ReturnType<typeof createFakeDatabase>;

export function createFakeDatabase() {
  let userVersion = 0;
  let tablesCreated = false;
  const index = new Map<number, string>();
  const meta = new Map<string, string>();
  const favorites = new Map<number, { name: string; addedAt: number }>();
  const queryCache = new Map<string, string>();

  const flat = (params: unknown[]): Param[] =>
    params.flat().filter((p): p is Param => typeof p === 'string' || typeof p === 'number');

  const requireTables = () => {
    if (!tablesCreated) throw new Error('no such table (migration did not run)');
  };

  const db = {
    index,
    meta,
    favorites,
    queryCache,
    /** Empties the tables, keeping the schema (between tests). */
    clearData() {
      index.clear();
      meta.clear();
      favorites.clear();
      queryCache.clear();
    },
    get userVersion() {
      return userVersion;
    },
    execAsync: jest.fn(async (sql: string) => {
      if (sql.includes('CREATE TABLE')) tablesCreated = true;
      const version = /PRAGMA user_version = (\d+)/.exec(sql);
      if (version) userVersion = Number(version[1]);
    }),
    getFirstAsync: jest.fn(async (sql: string, ...params: unknown[]) => {
      if (sql === 'PRAGMA user_version') return { user_version: userVersion };
      if (sql.startsWith('SELECT value FROM query_cache')) {
        requireTables();
        const value = queryCache.get(String(flat(params)[0]));
        return value === undefined ? null : { value };
      }
      if (sql.startsWith('SELECT value FROM meta')) {
        requireTables();
        const value = meta.get(String(flat(params)[0]));
        return value === undefined ? null : { value };
      }
      throw new Error(`Fake database: unexpected query ${sql}`);
    }),
    getAllAsync: jest.fn(async (sql: string) => {
      if (sql.startsWith('SELECT id, name FROM pokemon_index')) {
        requireTables();
        return [...index.entries()].sort(([a], [b]) => a - b).map(([id, name]) => ({ id, name }));
      }
      if (sql.startsWith('SELECT id, name, added_at FROM favorites')) {
        requireTables();
        return [...favorites.entries()]
          .sort(([, a], [, b]) => b.addedAt - a.addedAt)
          .map(([id, { name, addedAt }]) => ({ id, name, added_at: addedAt }));
      }
      throw new Error(`Fake database: unexpected query ${sql}`);
    }),
    runAsync: jest.fn(async (sql: string, ...params: unknown[]) => {
      requireTables();
      const values = flat(params);
      if (sql === 'DELETE FROM pokemon_index') {
        index.clear();
      } else if (sql.startsWith('INSERT OR REPLACE INTO pokemon_index')) {
        for (let i = 0; i < values.length; i += 2) index.set(Number(values[i]), String(values[i + 1]));
      } else if (sql.startsWith('INSERT OR REPLACE INTO favorites')) {
        favorites.set(Number(values[0]), { name: String(values[1]), addedAt: Number(values[2]) });
      } else if (sql === 'DELETE FROM favorites WHERE id = ?') {
        favorites.delete(Number(values[0]));
      } else if (sql.startsWith('INSERT OR REPLACE INTO query_cache')) {
        queryCache.set(String(values[0]), String(values[1]));
      } else if (sql === 'DELETE FROM query_cache WHERE key = ?') {
        queryCache.delete(String(values[0]));
      } else if (sql.startsWith('INSERT OR REPLACE INTO meta')) {
        meta.set(String(values[0]), String(values[1]));
      } else {
        throw new Error(`Fake database: unexpected statement ${sql}`);
      }
      return { changes: 1, lastInsertRowId: 0 };
    }),
    withTransactionAsync: jest.fn(async (task: () => Promise<void>) => {
      // Roll back on failure, like SQLite.
      const savedIndex = new Map(index);
      const savedMeta = new Map(meta);
      try {
        await task();
      } catch (error) {
        index.clear();
        savedIndex.forEach((v, k) => index.set(k, v));
        meta.clear();
        savedMeta.forEach((v, k) => meta.set(k, v));
        throw error;
      }
    }),
  };
  return db;
}
