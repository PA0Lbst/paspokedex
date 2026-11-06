import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import FavoritesScreen from '@/app/(tabs)/favorites';
import PokemonOptionsScreen from '@/app/options/[id]';
import { createFakeDatabase } from '@/test-utils/fake-database';
import { createWrapper } from '@/test-utils/query';

const mockDb = createFakeDatabase();
const mockPush = jest.fn();
const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn(async () => mockDb) }));
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
  useLocalSearchParams: () => mockParams,
  useNavigation: () => ({ isFocused: () => true, addListener: () => () => {} }),
}));

beforeEach(() => {
  mockDb.clearData();
  mockPush.mockReset();
  mockBack.mockReset();
  mockParams = { id: '25', name: 'pikachu' };
});

describe('Favorites tab', () => {
  it('shows Snorlax and "No favorites yet" with no favorites', async () => {
    await render(<FavoritesScreen />, { wrapper: createWrapper() });
    expect(await screen.findByText('No favorites yet')).toBeOnTheScreen();
    expect(screen.getByTestId('empty-image', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.queryByTestId('poke-ball-outline', { includeHiddenElements: true })).toBeNull();
    expect(screen.queryByText(/Add to favorites/)).toBeNull();
  });

  it('lists stored favorites and opens one', async () => {
    mockDb.favorites.set(25, { name: 'pikachu', addedAt: 1 });
    await render(<FavoritesScreen />, { wrapper: createWrapper() });
    await fireEvent.press(await screen.findByRole('button', { name: 'Pikachu, number 025' }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/pokemon/[id]', params: { id: '25' } });
  });

  it('opens the Options sheet from ⋮', async () => {
    mockDb.favorites.set(25, { name: 'pikachu', addedAt: 1 });
    await render(<FavoritesScreen />, { wrapper: createWrapper() });
    await fireEvent.press(await screen.findByRole('button', { name: 'Options for Pikachu' }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/options/[id]', params: { id: '25', name: 'pikachu' } });
  });
});

describe('Options sheet', () => {
  it('lists the Figma options for a Pokémon that is not a favorite', async () => {
    await render(<PokemonOptionsScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('Pikachu')).toBeOnTheScreen();
    expect(await screen.findByRole('button', { name: 'Add to favorites' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Open Pokémon' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Share' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeOnTheScreen();
  });

  it('shares with the native share sheet and closes', async () => {
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction', activityType: undefined });
    await render(<PokemonOptionsScreen />, { wrapper: createWrapper() });
    await fireEvent.press(screen.getByRole('button', { name: 'Share' }));
    expect(share).toHaveBeenCalledWith({ message: expect.stringContaining('Pikachu #025') });
    expect(mockBack).toHaveBeenCalled();
  });

  it('adds then removes the favorite', async () => {
    await render(<PokemonOptionsScreen />, { wrapper: createWrapper() });
    await fireEvent.press(await screen.findByRole('button', { name: 'Add to favorites' }));
    await waitFor(() => expect(mockDb.favorites.has(25)).toBe(true));
    await fireEvent.press(await screen.findByRole('button', { name: 'Remove from favorites' }));
    await waitFor(() => expect(mockDb.favorites.size).toBe(0));
  });

  it('opens the detail, and Cancel only closes', async () => {
    await render(<PokemonOptionsScreen />, { wrapper: createWrapper() });
    await fireEvent.press(screen.getByRole('button', { name: 'Open Pokémon' }));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/pokemon/[id]', params: { id: '25' } });

    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockBack).toHaveBeenCalledTimes(2);
    expect(mockPush).toHaveBeenCalledTimes(1);
  });
});
