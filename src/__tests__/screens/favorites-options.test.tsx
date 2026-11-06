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
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useNavigation: () => ({ isFocused: () => true, addListener: () => () => {} }),
}));
// The SwiftUI confirmation dialog as plain views: its title and buttons show only while presented.
jest.mock('@expo/ui/swift-ui', () => {
  const { Pressable, Text, View } = jest.requireActual('react-native');
  type MockChildren = { children?: unknown };
  const ConfirmationDialog = ({ title, isPresented, children }: MockChildren & { title: string; isPresented: boolean }) =>
    isPresented ? (
      <View testID="confirmation-dialog">
        <Text>{title}</Text>
        {children}
      </View>
    ) : null;
  ConfirmationDialog.Trigger = function MockTrigger() {
    return null;
  };
  ConfirmationDialog.Actions = function MockActions({ children }: MockChildren) {
    return <View>{children}</View>;
  };
  return {
    Host: ({ children }: MockChildren) => <View>{children}</View>,
    Spacer: () => null,
    ConfirmationDialog,
    Button: ({ label, role, onPress }: { label: string; role: string; onPress: () => void }) => (
      <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint={role} onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    ),
  };
});

beforeEach(() => {
  mockDb.clearData();
  mockPush.mockReset();
});

async function openOptionsOfPikachu() {
  mockDb.favorites.set(25, { name: 'pikachu', addedAt: 1 });
  await render(<FavoritesScreen />, { wrapper: createWrapper() });
  await fireEvent.press(await screen.findByRole('button', { name: 'Options for Pikachu' }));
}

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
});

describe('Options (iOS confirmation dialog)', () => {
  it('is closed until ⋮ is pressed, then shows the Figma options and Cancel', async () => {
    mockDb.favorites.set(25, { name: 'pikachu', addedAt: 1 });
    await render(<FavoritesScreen />, { wrapper: createWrapper() });
    await screen.findByRole('button', { name: 'Options for Pikachu' });
    expect(screen.queryByTestId('confirmation-dialog')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Options for Pikachu' }));
    const labels = screen.getAllByRole('button').map((b) => b.props.accessibilityLabel);
    expect(labels).toEqual(expect.arrayContaining(['Open Pokémon', 'Remove from favorites', 'Share', 'Cancel']));
    expect(screen.getByRole('button', { name: 'Remove from favorites' }).props.accessibilityHint).toBe('destructive');
    expect(screen.getByRole('button', { name: 'Cancel' }).props.accessibilityHint).toBe('cancel');
  });

  it('shares with the native share sheet and closes', async () => {
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction', activityType: undefined });
    await openOptionsOfPikachu();
    await fireEvent.press(screen.getByRole('button', { name: 'Share' }));
    expect(share).toHaveBeenCalledWith({ message: expect.stringContaining('Pikachu #025') });
    expect(screen.queryByTestId('confirmation-dialog')).toBeNull();
  });

  it('removes the favorite', async () => {
    await openOptionsOfPikachu();
    await fireEvent.press(screen.getByRole('button', { name: 'Remove from favorites' }));
    await waitFor(() => expect(mockDb.favorites.size).toBe(0));
    expect(await screen.findByText('No favorites yet')).toBeOnTheScreen();
  });

  it('opens the detail, and Cancel only closes', async () => {
    await openOptionsOfPikachu();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByTestId('confirmation-dialog')).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Options for Pikachu' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Open Pokémon' }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/pokemon/[id]', params: { id: '25' } });
  });
});

describe('Options (Android dialog)', () => {
  it('opens the system dialog with the options', async () => {
    const { OptionsDialog } = jest.requireActual<typeof import('@/components/options-dialog.tsx')>(
      '@/components/options-dialog.tsx',
    );
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const open = jest.fn();
    const options = [{ key: 'open' as const, label: 'Open Pokémon', destructive: false, run: open }];
    await render(<OptionsDialog pokemon={{ id: 25, name: 'pikachu', spriteUrl: 's' }} options={options} onClose={jest.fn()} />);
    expect(alert).toHaveBeenCalledWith('Pikachu', undefined, [expect.objectContaining({ text: 'Open Pokémon' })], expect.objectContaining({ cancelable: true }));
  });
});
