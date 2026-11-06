import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import PokemonDetailScreen from '@/app/pokemon/[id]';
import { HeaderActions } from '@/components/detail-header-actions';
import { fetchEvolutionChain, fetchPokemon, fetchSpecies } from '@/services/pokeapi';
import { createFakeDatabase } from '@/test-utils/fake-database';
import { createWrapper } from '@/test-utils/query';

const mockDb = createFakeDatabase();
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn(async () => mockDb) }));
jest.mock('@/services/pokeapi', () => ({
  ...jest.requireActual('@/services/pokeapi'),
  fetchPokemon: jest.fn(),
  fetchSpecies: jest.fn(),
  fetchEvolutionChain: jest.fn(),
}));
jest.mock('expo-router', () => {
  // The header is rendered by the Stack in the app; here its headerRight is rendered inline.
  const { View } = jest.requireActual('react-native');
  return {
    useRouter: () => ({ push: mockPush, back: mockBack }),
    useLocalSearchParams: () => ({ id: '1' }),
    Stack: { Screen: ({ options }: { options: { headerRight?: () => unknown } }) => <View>{options.headerRight?.()}</View> },
  };
});

const bulbasaur = {
  id: 1, name: 'bulbasaur', types: ['grass', 'poison'], height: 7, weight: 69, baseExperience: 64,
  stats: [{ name: 'hp', value: 45 }, { name: 'special-attack', value: 65 }], abilities: ['overgrow'],
  speciesId: 1, spriteUrl: 's/1', artworkUrl: 'a/1',
};

beforeEach(() => {
  mockDb.clearData();
  mockPush.mockReset();
  jest.mocked(fetchPokemon).mockResolvedValue(bulbasaur);
  jest.mocked(fetchSpecies).mockResolvedValue({ id: 1, description: null, evolutionChainId: 1 });
  jest.mocked(fetchEvolutionChain).mockResolvedValue({
    id: 1, name: 'bulbasaur', spriteUrl: 's/1', evolvesTo: [{ id: 2, name: 'ivysaur', spriteUrl: 's/2', evolvesTo: [] }],
  });
});

async function renderDetail() {
  await render(<PokemonDetailScreen />, { wrapper: createWrapper() });
  await screen.findByText('#001');
}

describe('Detail screen', () => {
  it('shows the name, number, types and the About rows', async () => {
    await renderDetail();
    expect(screen.getByText('#001')).toBeOnTheScreen();
    expect(screen.getByText('Grass')).toBeOnTheScreen();
    expect(screen.getByText('6.9 kg')).toBeOnTheScreen();
    expect(screen.getByText('Overgrow')).toBeOnTheScreen();
  });

  it('switches to Stats and Evolution, and opens the next stage', async () => {
    await renderDetail();
    await fireEvent.press(screen.getByRole('tab', { name: 'Stats' }));
    expect(screen.getByText('Sp. Atk')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('tab', { name: 'Evolution' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Open Ivysaur' }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/pokemon/[id]', params: { id: '2' } });
  });

  it('adds the Pokémon to favorites with the heart', async () => {
    await renderDetail();
    await fireEvent.press(await screen.findByRole('button', { name: 'Add to favorites' }));
    await waitFor(() => expect(mockDb.favorites.has(1)).toBe(true));
    expect(await screen.findByRole('button', { name: 'Remove from favorites' })).toBeOnTheScreen();
  });

  it('opens Compare with this Pokémon first', async () => {
    await renderDetail();
    await fireEvent.press(await screen.findByRole('button', { name: 'Compare Bulbasaur' }));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/compare', params: { first: '1' } });
  });
});

describe('Accessibility', () => {
  it('gives every button a label for VoiceOver / TalkBack, and the name is a header', async () => {
    await renderDetail();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(2);
    for (const button of buttons) expect(button.props.accessibilityLabel).toEqual(expect.any(String));
    expect(screen.getByRole('header', { name: 'Bulbasaur' })).toBeOnTheScreen();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });
});

describe('ScreenHeader', () => {
  it('goes back, and shows its title only when asked', async () => {
    const { ScreenHeader } = jest.requireActual<typeof import('@/components/screen-header')>('@/components/screen-header');
    await render(<ScreenHeader title="Bulbasaur" showTitle={false} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(mockBack).toHaveBeenCalled();
    expect(screen.getByText('Bulbasaur', { includeHiddenElements: true })).toHaveStyle({ opacity: 0 });
  });
});

describe('HeaderActions', () => {
  it('turns the heart into "Remove from favorites" once added', async () => {
    await render(<HeaderActions pokemon={bulbasaur} />, { wrapper: createWrapper() });
    expect(await screen.findByTestId('heart-outline')).toBeOnTheScreen();
    await fireEvent.press(await screen.findByRole('button', { name: 'Add to favorites' }));
    expect(await screen.findByRole('button', { name: 'Remove from favorites' })).toBeOnTheScreen();
    // Favorite: the filled red heart, not a tinted outline.
    expect(screen.getByTestId('heart-filled')).toBeOnTheScreen();
    expect(screen.queryByTestId('heart-outline')).toBeNull();
  });
});
