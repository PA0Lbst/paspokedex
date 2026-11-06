import { createFakeDatabase } from '@/test-utils/fake-database';

import { isPersistedClient, sqlitePersister } from '../query-persister';

const mockDb = createFakeDatabase();
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn(async () => mockDb) }));

const client = { timestamp: 1, buster: '', clientState: { queries: [], mutations: [] } };

beforeEach(() => mockDb.clearData());

describe('offline cache in SQLite', () => {
  it('saves the cache and gives it back after a restart', async () => {
    await sqlitePersister.persistClient(client);
    expect(mockDb.queryCache.size).toBe(1);
    expect(await sqlitePersister.restoreClient()).toEqual(client);
  });

  it('has nothing to restore at first', async () => {
    expect(await sqlitePersister.restoreClient()).toBeUndefined();
  });

  it('ignores a broken saved cache instead of crashing', async () => {
    mockDb.queryCache.set('tanstack', '{not json');
    expect(await sqlitePersister.restoreClient()).toBeUndefined();
    mockDb.queryCache.set('tanstack', JSON.stringify({ hello: 'world' }));
    expect(await sqlitePersister.restoreClient()).toBeUndefined();
  });

  it('removes the saved cache', async () => {
    await sqlitePersister.persistClient(client);
    await sqlitePersister.removeClient();
    expect(mockDb.queryCache.size).toBe(0);
  });

  it('checks the saved shape', () => {
    expect(isPersistedClient(client)).toBe(true);
    expect(isPersistedClient({ timestamp: 'x' })).toBe(false);
    expect(isPersistedClient(null)).toBe(false);
  });
});
