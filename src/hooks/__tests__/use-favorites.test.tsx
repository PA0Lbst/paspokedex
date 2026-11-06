import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createFakeDatabase } from '@/test-utils/fake-database';
import { createWrapper } from '@/test-utils/query';

import { useFavorites } from '../use-favorites';

const mockDb = createFakeDatabase();
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn(async () => mockDb) }));

beforeEach(() => mockDb.clearData());

describe('useFavorites', () => {
  it('adds a Pokémon, then removes it on the second toggle', async () => {
    const { result } = await renderHook(() => useFavorites(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.favorites).toEqual([]);

    await act(() => result.current.toggleFavorite({ id: 25, name: 'pikachu' }));
    await waitFor(() => expect(result.current.isFavorite(25)).toBe(true));
    expect(mockDb.favorites.has(25)).toBe(true);

    await act(() => result.current.toggleFavorite({ id: 25, name: 'pikachu' }));
    await waitFor(() => expect(result.current.isFavorite(25)).toBe(false));
    expect(mockDb.favorites.size).toBe(0);
  });

  it('reads favorites already stored (still there after a restart)', async () => {
    mockDb.favorites.set(1, { name: 'bulbasaur', addedAt: 1 });
    const { result } = await renderHook(() => useFavorites(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.favorites).toHaveLength(1));
    expect(result.current.isFavorite(1)).toBe(true);
  });
});
