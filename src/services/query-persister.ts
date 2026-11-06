import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

import { getDatabase } from './database';
import { isRecord } from './json';

/**
 * Offline (#16): saves the TanStack Query cache in SQLite (table `query_cache`, see database.ts)
 * so the app shows the last loaded data in airplane mode. No second database.
 */

const CACHE_KEY = 'tanstack';
/** How long a saved cache is kept (also the queries' gcTime). */
export const PERSIST_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Checks the saved JSON has the shape TanStack expects, without trusting it blindly. */
export function isPersistedClient(value: unknown): value is PersistedClient {
  return (
    isRecord(value) &&
    typeof value.timestamp === 'number' &&
    typeof value.buster === 'string' &&
    isRecord(value.clientState) &&
    Array.isArray(value.clientState.queries)
  );
}

export const sqlitePersister: Persister = {
  persistClient: async (client) => {
    const db = await getDatabase();
    await db.runAsync('INSERT OR REPLACE INTO query_cache (key, value) VALUES (?, ?)', CACHE_KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM query_cache WHERE key = ?', CACHE_KEY);
    if (!row) return undefined;
    try {
      const parsed: unknown = JSON.parse(row.value);
      return isPersistedClient(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  },
  removeClient: async () => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM query_cache WHERE key = ?', CACHE_KEY);
  },
};
