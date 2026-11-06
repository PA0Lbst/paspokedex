import { getDatabase } from './database';
import { spriteUrl } from './pokeapi';
import type { PokemonSummary } from './pokeapi-types';

/** The search index as stored in SQLite (tables `pokemon_index` and `meta`, see database.ts). */
export type StoredIndex = {
  items: PokemonSummary[];
  /** When it was downloaded, in ms since 1970. */
  fetchedAt: number;
};

const FETCHED_AT_KEY = 'pokemon_index_fetched_at';
/** Rows per INSERT: 2 parameters each, well under SQLite's parameter limit. */
const INSERT_CHUNK = 200;

/** The stored index, or null if it was never downloaded. */
export async function readStoredIndex(): Promise<StoredIndex | null> {
  const db = await getDatabase();
  const meta = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', FETCHED_AT_KEY);
  const fetchedAt = meta ? Number(meta.value) : NaN;
  if (!Number.isFinite(fetchedAt)) return null;

  const rows = await db.getAllAsync<{ id: number; name: string }>('SELECT id, name FROM pokemon_index ORDER BY id');
  if (rows.length === 0) return null;
  return { fetchedAt, items: rows.map(({ id, name }) => ({ id, name, spriteUrl: spriteUrl(id) })) };
}

/** Replaces the whole stored index in one transaction. */
export async function saveStoredIndex(items: PokemonSummary[], fetchedAt: number): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM pokemon_index');
    for (let start = 0; start < items.length; start += INSERT_CHUNK) {
      const chunk = items.slice(start, start + INSERT_CHUNK);
      const placeholders = chunk.map(() => '(?, ?)').join(', ');
      await db.runAsync(
        `INSERT OR REPLACE INTO pokemon_index (id, name) VALUES ${placeholders}`,
        chunk.flatMap(({ id, name }) => [id, name]),
      );
    }
    await db.runAsync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', FETCHED_AT_KEY, String(fetchedAt));
  });
}
