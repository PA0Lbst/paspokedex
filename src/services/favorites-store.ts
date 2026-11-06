import { getDatabase } from './database';
import { spriteUrl } from './pokeapi';
import type { PokemonSummary } from './pokeapi-types';

/** Favorites in SQLite (table `favorites`, see database.ts). They survive a restart. */

/** All favorites, the most recently added first. */
export async function listFavorites(): Promise<PokemonSummary[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: number; name: string; added_at: number }>(
    'SELECT id, name, added_at FROM favorites ORDER BY added_at DESC',
  );
  return rows.map(({ id, name }) => ({ id, name, spriteUrl: spriteUrl(id) }));
}

export async function addFavorite(pokemon: { id: number; name: string }, addedAt: number = Date.now()): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT OR REPLACE INTO favorites (id, name, added_at) VALUES (?, ?, ?)', pokemon.id, pokemon.name, addedAt);
}

export async function removeFavorite(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM favorites WHERE id = ?', id);
}
