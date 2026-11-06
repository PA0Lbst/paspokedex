import { createFakeDatabase } from '@/test-utils/fake-database';

import { DATABASE_VERSION, getDatabase } from '../database';
import { addFavorite, listFavorites, removeFavorite } from '../favorites-store';
import { spriteUrl } from '../pokeapi';

const mockDb = createFakeDatabase();
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn(async () => mockDb) }));

beforeEach(() => mockDb.clearData());

describe('favorites store', () => {
  it('migrates the database to the version with the favorites table', async () => {
    await getDatabase();
    expect(mockDb.userVersion).toBe(DATABASE_VERSION);
    expect(mockDb.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS favorites'));
  });

  it('is empty at first', async () => {
    expect(await listFavorites()).toEqual([]);
  });

  it('lists favorites newest first, with their sprite', async () => {
    await addFavorite({ id: 1, name: 'bulbasaur' }, 100);
    await addFavorite({ id: 25, name: 'pikachu' }, 200);
    expect(await listFavorites()).toEqual([
      { id: 25, name: 'pikachu', spriteUrl: spriteUrl(25) },
      { id: 1, name: 'bulbasaur', spriteUrl: spriteUrl(1) },
    ]);
  });

  it('keeps one row per Pokémon when added twice', async () => {
    await addFavorite({ id: 25, name: 'pikachu' }, 100);
    await addFavorite({ id: 25, name: 'pikachu' }, 300);
    expect(await listFavorites()).toHaveLength(1);
  });

  it('removes a favorite', async () => {
    await addFavorite({ id: 25, name: 'pikachu' }, 100);
    await removeFavorite(25);
    expect(await listFavorites()).toEqual([]);
  });
});
