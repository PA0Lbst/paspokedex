import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { BackHandler, Platform } from 'react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import PokemonListScreen from '@/app/(tabs)/index';
import { ApiError } from '@/services/api-error';
import { fetchPokemonPage } from '@/services/pokeapi';
import type { PokemonSummary } from '@/services/pokeapi-types';
import { loadPokemonIndex } from '@/services/pokemon-index';
import { createWrapper, makePage } from '@/test-utils/query';

jest.mock('@/services/pokeapi', () => ({ fetchPokemonPage: jest.fn() }));
jest.mock('@/services/pokemon-index', () => ({ loadPokemonIndex: jest.fn(), downloadPokemonIndex: jest.fn() }));
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return {
    useRouter: () => ({ push: mockPush }),
    // The tab is focused for the whole test.
    useFocusEffect: (effect: () => undefined | (() => void)) => useEffect(effect, [effect]),
  };
});

const fetchPage = jest.mocked(fetchPokemonPage);
const loadIndex = jest.mocked(loadPokemonIndex);

const p = (id: number, name: string): PokemonSummary => ({ id, name, spriteUrl: `https://sprites.test/${id}.png` });
const index = [p(1, 'bulbasaur'), p(25, 'pikachu'), p(26, 'raichu'), p(718, 'zygarde-50')];

async function renderScreen() {
  await render(<PokemonListScreen />, { wrapper: createWrapper() });
  await screen.findByText('Pokemon 1');
}

const field = () => screen.getByLabelText('Search for Pokémon');

beforeEach(() => {
  mockPush.mockReset();
  fetchPage.mockReset();
  fetchPage.mockImplementation(async (offset) => makePage(offset, 1351));
  loadIndex.mockReset();
  loadIndex.mockResolvedValue({ items: index, fetchedAt: 0, isStale: false });
});

describe('Search on the Pokémons tab', () => {
  it('shows the search field above "All Pokémon"', async () => {
    await renderScreen();

    expect(screen.getByPlaceholderText('Search for Pokémon..')).toBeOnTheScreen();
    expect(screen.getByText('All Pokémon')).toBeOnTheScreen();
  });

  it('filters while typing, hides the title, and finds Pokémon not loaded yet', async () => {
    await renderScreen();

    await fireEvent.changeText(field(), 'zyg');

    expect(await screen.findByText('Zygarde 50')).toBeOnTheScreen();
    expect(screen.queryByText('All Pokémon')).not.toBeOnTheScreen();
  });

  it('opens a result', async () => {
    await renderScreen();
    await fireEvent.changeText(field(), 'PIKA');

    await fireEvent.press(await screen.findByRole('button', { name: 'Pikachu, number 025' }));

    expect(mockPush).toHaveBeenCalledWith({ pathname: '/pokemon/[id]', params: { id: '25' } });
  });

  it('shows the empty state when nothing matches', async () => {
    await renderScreen();

    await fireEvent.changeText(field(), 'xyz');

    expect(await screen.findByText('No Pokémon found for “xyz”')).toBeOnTheScreen();
  });

  it('shows the list again when the field is cleared', async () => {
    await renderScreen();
    await fireEvent.changeText(field(), 'pika');
    await screen.findByText('Pikachu');

    await fireEvent.changeText(field(), '');

    expect(screen.getByText('All Pokémon')).toBeOnTheScreen();
    expect(screen.queryByText('Raichu')).not.toBeOnTheScreen();
  });

  it('shows the loading state while the index downloads for the first time', async () => {
    loadIndex.mockReturnValue(new Promise(() => {}));
    await renderScreen();

    await fireEvent.changeText(field(), 'pika');

    expect(await screen.findByLabelText('Loading Pokémon…')).toBeOnTheScreen();
  });

  it('shows the error state when the download fails, and Try again loads it', async () => {
    loadIndex.mockRejectedValueOnce(new ApiError('network', 'offline'));
    await renderScreen();
    await fireEvent.changeText(field(), 'pika');

    expect(await screen.findByText(/You seem to be offline/)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Pikachu')).toBeOnTheScreen();
  });

  describe('on Android', () => {
    beforeEach(() => jest.replaceProperty(Platform, 'OS', 'android'));
    afterEach(() => jest.restoreAllMocks());

    it('swaps the search icon for a back arrow that clears the search', async () => {
      await renderScreen();
      expect(screen.queryByRole('button', { name: 'Close search' })).not.toBeOnTheScreen();

      await fireEvent.changeText(field(), 'pika');
      await screen.findByText('Pikachu');
      await fireEvent.press(screen.getByRole('button', { name: 'Close search' }));

      expect(field()).toHaveDisplayValue('');
      expect(screen.getByText('All Pokémon')).toBeOnTheScreen();
    });

    it('clears the search on the system back button', async () => {
      const addListener = jest.spyOn(BackHandler, 'addEventListener');
      await renderScreen();
      await fireEvent.changeText(field(), 'pika');
      await screen.findByText('Pikachu');

      const [, handler] = addListener.mock.calls.at(-1) ?? [];
      let handled = false;
      await waitFor(async () => {
        handled = handler?.({ type: 'hardwareBackPress', timeStamp: 0 }) ?? false;
      });

      expect(handled).toBe(true);
      await waitFor(() => expect(field()).toHaveDisplayValue(''));
    });
  });
});
