import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ActionSheetIOS, Alert, Platform, Share } from 'react-native';
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

/** Makes the native iOS action sheet pick the option with this label. */
function pickInActionSheet(label: string) {
  return jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation((options, callback) => {
    callback(options.options.indexOf(label));
  });
}

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
    const sheet = pickInActionSheet('Share');
    await fireEvent.press(await screen.findByRole('button', { name: 'Options for Pikachu' }));
    expect(sheet.mock.calls[0][0]).toMatchObject({
      title: 'Pikachu',
      options: ['Open Pokémon', 'Remove from favorites', 'Share', 'Cancel'],
      cancelButtonIndex: 3,
    });
    expect(share).toHaveBeenCalledWith({ message: expect.stringContaining('Pikachu #025') });
  });

  it('removes a favorite from the ⋮ sheet', async () => {
    mockDb.favorites.set(25, { name: 'pikachu', addedAt: 1 });
    await render(<FavoritesScreen />, { wrapper: createWrapper() });
    pickInActionSheet('Remove from favorites');
    await fireEvent.press(await screen.findByRole('button', { name: 'Options for Pikachu' }));
    await waitFor(() => expect(mockDb.favorites.size).toBe(0));
    expect(await screen.findByText('No favorites yet')).toBeOnTheScreen();
  });

  it('uses a native dialog on Android, and opens the Pokémon from it', async () => {
    const os = Platform.OS;
    Platform.OS = 'android';
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === 'Open Pokémon')?.onPress?.();
    });
    mockDb.favorites.set(25, { name: 'pikachu', addedAt: 1 });
    await render(<FavoritesScreen />, { wrapper: createWrapper() });
    await fireEvent.press(await screen.findByRole('button', { name: 'Options for Pikachu' }));
    expect(alert).toHaveBeenCalledWith('Pikachu', undefined, expect.any(Array), { cancelable: true });
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/pokemon/[id]', params: { id: '25' } });
    Platform.OS = os;
  });
});
