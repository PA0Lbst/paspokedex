import { fireEvent, render, screen } from '@testing-library/react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import PokemonListScreen from '@/app/(tabs)/index';
import { ApiError } from '@/services/api-error';
import { fetchPokemonPage } from '@/services/pokeapi';
import { createWrapper, makePage } from '@/test-utils/query';

jest.mock('@/services/pokeapi', () => ({ fetchPokemonPage: jest.fn() }));
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

const fetchPage = jest.mocked(fetchPokemonPage);

async function renderScreen() {
  await render(<PokemonListScreen />, { wrapper: createWrapper() });
}

beforeEach(() => {
  fetchPage.mockReset();
  mockPush.mockReset();
});

describe('Pokémons tab', () => {
  it('shows the title and the first cards', async () => {
    fetchPage.mockImplementation(async (offset) => makePage(offset, 1351));
    await renderScreen();

    expect(screen.getByText('All Pokémon')).toBeOnTheScreen();
    expect(await screen.findByText('Pokemon 1')).toBeOnTheScreen();
    expect(screen.getByText('001')).toBeOnTheScreen();
  });

  it('opens the detail when a card is tapped', async () => {
    fetchPage.mockImplementation(async (offset) => makePage(offset, 1351));
    await renderScreen();

    await fireEvent.press(await screen.findByRole('button', { name: 'Pokemon 1, number 001' }));

    expect(mockPush).toHaveBeenCalledWith({ pathname: '/pokemon/[id]', params: { id: '1' } });
  });

  it('shows the loading state first', async () => {
    fetchPage.mockReturnValue(new Promise(() => {}));
    await renderScreen();
    expect(screen.getByText('Loading Pokémon…')).toBeOnTheScreen();
  });

  it('shows the error state and loads again on Try again', async () => {
    fetchPage.mockRejectedValueOnce(new ApiError('network', 'offline'));
    await renderScreen();

    expect(await screen.findByText(/You seem to be offline/)).toBeOnTheScreen();

    fetchPage.mockImplementation(async (offset) => makePage(offset, 1351));
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Pokemon 1')).toBeOnTheScreen();
  });
});
