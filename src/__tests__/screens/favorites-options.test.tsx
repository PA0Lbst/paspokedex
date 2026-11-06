import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import FavoritesScreen from '@/app/(tabs)/favorites';
import { createFakeDatabase } from '@/test-utils/fake-database';
import { createWrapper } from '@/test-utils/query';

const mockDb = createFakeDatabase();
const mockPush = jest.fn();
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn(async () => mockDb) }));
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useNavigation: () => ({ isFocused: () => true, addListener: () => () => {} }),
}));

beforeEach(() => {
  mockDb.clearData();
  mockPush.mockReset();
});

describe('Favorites tab and Options sheet', () => {
  it('shows the empty state with no favorites', async () => {
    await render(<FavoritesScreen />, { wrapper: createWrapper() });
    expect(await screen.findByText('No favorites yet')).toBeOnTheScreen();
  });

  it('lists stored favorites and opens one', async () => {
    mockDb.favorites.set(25, { name: 'pikachu', addedAt: 1 });
    await render(<FavoritesScreen />, { wrapper: createWrapper() });
    await fireEvent.press(await screen.findByRole('button', { name: 'Pikachu, number 025' }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/pokemon/[id]', params: { id: '25' } });
  });

  it('shares from the ⋮ sheet with the native share sheet', async () => {
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction', activityType: undefined });
    mockDb.favorites.set(25, { name: 'pikachu', addedAt: 1 });
    await render(<FavoritesScreen />, { wrapper: createWrapper() });
    await fireEvent.press(await screen.findByRole('button', { name: 'Options for Pikachu' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Share' }));
    expect(share).toHaveBeenCalledWith({ message: expect.stringContaining('Pikachu #025') });
  });

  it('removes a favorite from the ⋮ sheet', async () => {
    mockDb.favorites.set(25, { name: 'pikachu', addedAt: 1 });
    await render(<FavoritesScreen />, { wrapper: createWrapper() });
    await fireEvent.press(await screen.findByRole('button', { name: 'Options for Pikachu' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Remove from favorites' }));
    await waitFor(() => expect(mockDb.favorites.size).toBe(0));
    expect(await screen.findByText('No favorites yet')).toBeOnTheScreen();
  });
});
