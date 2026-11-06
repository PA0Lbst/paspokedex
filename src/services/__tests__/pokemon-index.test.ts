import { createFakeDatabase } from '@/test-utils/fake-database';

import { ApiError } from '../api-error';
import { DATABASE_VERSION, getDatabase } from '../database';
import { fetchPokemonIndex, spriteUrl } from '../pokeapi';
import { downloadPokemonIndex, INDEX_MAX_AGE_MS, loadPokemonIndex } from '../pokemon-index';
import { readStoredIndex, saveStoredIndex } from '../pokemon-index-store';

const mockDb = createFakeDatabase();
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn(async () => mockDb) }));
jest.mock('../pokeapi', () => ({
  ...jest.requireActual('../pokeapi'),
  fetchPokemonIndex: jest.fn(),
}));

const fetchIndex = jest.mocked(fetchPokemonIndex);
const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 6);
const now = () => NOW;

const summary = (id: number, name: string) => ({ id, name, spriteUrl: spriteUrl(id) });
const apiIndex = [summary(1, 'bulbasaur'), summary(25, 'pikachu'), summary(10193, 'calyrex-ice')];

beforeEach(() => {
  mockDb.clearData();
  fetchIndex.mockReset();
});

describe('database', () => {
  it('creates the tables once and records the schema version', async () => {
    const first = await getDatabase();
    const second = await getDatabase();

    expect(first).toBe(second);
    expect(mockDb.userVersion).toBe(DATABASE_VERSION);
    expect(mockDb.execAsync.mock.calls.filter(([sql]) => sql.includes('CREATE TABLE'))).toHaveLength(1);
  });
});

describe('pokemon index store', () => {
  it('has nothing stored at first', async () => {
    expect(await readStoredIndex()).toBeNull();
  });

  it('saves and reads back the index with its date, sorted by id', async () => {
    await saveStoredIndex([apiIndex[2], apiIndex[0], apiIndex[1]], NOW);

    expect(await readStoredIndex()).toEqual({ fetchedAt: NOW, items: apiIndex });
  });

  it('replaces the previous index instead of adding to it', async () => {
    await saveStoredIndex(apiIndex, NOW - DAY);
    await saveStoredIndex([summary(4, 'charmander')], NOW);

    expect(await readStoredIndex()).toEqual({ fetchedAt: NOW, items: [summary(4, 'charmander')] });
  });

  it('stores more rows than one INSERT holds (all 1351)', async () => {
    const many = Array.from({ length: 1351 }, (_, i) => summary(i + 1, `pokemon-${i + 1}`));
    await saveStoredIndex(many, NOW);

    expect((await readStoredIndex())?.items).toHaveLength(1351);
  });
});

describe('loadPokemonIndex', () => {
  it('downloads and stores the index on first launch', async () => {
    fetchIndex.mockResolvedValue(apiIndex);

    const index = await loadPokemonIndex(now);

    expect(fetchIndex).toHaveBeenCalledTimes(1);
    expect(index).toEqual({ items: apiIndex, fetchedAt: NOW, isStale: false });
    expect(await readStoredIndex()).toEqual({ items: apiIndex, fetchedAt: NOW });
  });

  it('uses the stored copy without a call when it is less than 7 days old', async () => {
    await saveStoredIndex(apiIndex, NOW - 6 * DAY);

    const index = await loadPokemonIndex(now);

    expect(fetchIndex).not.toHaveBeenCalled();
    expect(index).toEqual({ items: apiIndex, fetchedAt: NOW - 6 * DAY, isStale: false });
  });

  it('returns an older copy at once, flagged stale, so it can be refreshed in the background', async () => {
    await saveStoredIndex(apiIndex, NOW - INDEX_MAX_AGE_MS - 1);

    const index = await loadPokemonIndex(now);

    expect(fetchIndex).not.toHaveBeenCalled();
    expect(index.isStale).toBe(true);
    expect(index.items).toEqual(apiIndex);
  });

  it('fails when nothing is stored and the download fails', async () => {
    fetchIndex.mockRejectedValue(new ApiError('network', 'offline'));

    await expect(loadPokemonIndex(now)).rejects.toMatchObject({ kind: 'network' });
  });

  it('downloads when the storage cannot be read', async () => {
    mockDb.getFirstAsync.mockRejectedValueOnce(new Error('disk I/O error'));
    fetchIndex.mockResolvedValue(apiIndex);

    expect((await loadPokemonIndex(now)).items).toEqual(apiIndex);
  });
});

describe('downloadPokemonIndex (refresh)', () => {
  it('replaces a stale stored copy with the new one', async () => {
    await saveStoredIndex([summary(1, 'bulbasaur')], NOW - 10 * DAY);
    fetchIndex.mockResolvedValue(apiIndex);

    const index = await downloadPokemonIndex(now);

    expect(index).toEqual({ items: apiIndex, fetchedAt: NOW, isStale: false });
    expect(await readStoredIndex()).toEqual({ items: apiIndex, fetchedAt: NOW });
  });

  it('keeps the stored copy and its old date when the refresh fails, so the next launch tries again', async () => {
    await saveStoredIndex(apiIndex, NOW - 10 * DAY);
    fetchIndex.mockRejectedValue(new ApiError('network', 'offline'));

    await expect(downloadPokemonIndex(now)).rejects.toBeInstanceOf(ApiError);

    const next = await loadPokemonIndex(now);
    expect(next.items).toEqual(apiIndex);
    expect(next.isStale).toBe(true);
  });

  it('still returns the download when saving fails', async () => {
    fetchIndex.mockResolvedValue(apiIndex);
    mockDb.withTransactionAsync.mockRejectedValueOnce(new Error('disk full'));

    expect((await downloadPokemonIndex(now)).items).toEqual(apiIndex);
  });
});
