import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert, Share } from 'react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import FavoritesScreen from '@/app/(tabs)/favorites';
import { createFakeDatabase } from '@/test-utils/fake-database';
import { createWrapper } from '@/test-utils/query';

const mockDb = createFakeDatabase();
const mockPush = jest.fn();
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn(async () => mockDb) }));
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
jest.mock('@expo/ui/swift-ui/modifiers', () => ({
  accessibilityLabel: (label: string) => ({ label }),
  contentShape: () => ({}),
  frame: () => ({}),
  rotationEffect: () => ({}),
  shapes: { rectangle: () => ({}) },
}));
// The native SwiftUI menu, as plain views: its label, then one pressable per Button.
jest.mock('@expo/ui/swift-ui', () => {
  const { Pressable, Text, View } = jest.requireActual('react-native');
  return {
    Host: ({ children }: { children: unknown }) => <View>{children}</View>,
    RNHostView: ({ children }: { children: unknown }) => <View>{children}</View>,
    Menu: ({ label, children }: { label: unknown; children: unknown }) => (
      <View>
        {label}
        {children}
      </View>
    ),
    // The ⋮: a SwiftUI image whose accessibility label comes from a modifier.
    Image: ({ modifiers }: { modifiers: { label?: string }[] }) => (
      <View accessible accessibilityRole="button" accessibilityLabel={modifiers.find((m) => m.label)?.label} />
    ),
    Button: ({ label, onPress, systemImage }: { label: string; onPress: () => void; systemImage: string }) => (
      <Pressable accessibilityRole="menuitem" accessibilityLabel={label} accessibilityHint={systemImage} onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    ),
  };
});
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
    // Snorlax above the title; no Poké Ball and no subtitle.
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

  it('shares from the ⋮ sheet with the native share sheet', async () => {
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction', activityType: undefined });
    mockDb.favorites.set(25, { name: 'pikachu', addedAt: 1 });
    await render(<FavoritesScreen />, { wrapper: createWrapper() });
    expect(await screen.findByRole('button', { name: 'Options for Pikachu' })).toBeOnTheScreen();
    const items = screen.getAllByRole('menuitem');
    expect(items.map((item) => item.props.accessibilityLabel)).toEqual(['Open Pokémon', 'Remove from favorites', 'Share']);
    expect(items.map((item) => item.props.accessibilityHint)).toEqual(['arrow.up.left.and.arrow.down.right', 'heart.slash', 'square.and.arrow.up']);
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Share' }));
    expect(share).toHaveBeenCalledWith({ message: expect.stringContaining('Pikachu #025') });
  });

  it('removes a favorite from the ⋮ sheet', async () => {
    mockDb.favorites.set(25, { name: 'pikachu', addedAt: 1 });
    await render(<FavoritesScreen />, { wrapper: createWrapper() });
    await fireEvent.press(await screen.findByRole('menuitem', { name: 'Remove from favorites' }));
    await waitFor(() => expect(mockDb.favorites.size).toBe(0));
    expect(await screen.findByText('No favorites yet')).toBeOnTheScreen();
  });

  it('uses a native dialog on Android', async () => {
    // The default (Android) file, imported by its full name since Jest resolves .ios first.
    const { PokemonOptionsMenu } = jest.requireActual<typeof import('@/components/pokemon-options-menu.tsx')>(
      '@/components/pokemon-options-menu.tsx',
    );
    const open = jest.fn();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === 'Open Pokémon')?.onPress?.();
    });
    const options = [{ key: 'open' as const, label: 'Open Pokémon', systemImage: 'arrow.up.left.and.arrow.down.right' as const, destructive: false, run: open }];
    await render(<PokemonOptionsMenu name="Pikachu" options={options} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Options for Pikachu' }));
    expect(alert).toHaveBeenCalledWith('Pikachu', undefined, expect.any(Array), { cancelable: true });
    expect(open).toHaveBeenCalled();
  });
});
