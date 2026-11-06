import { renderHook, waitFor } from '@testing-library/react-native';

import { ApiError } from '@/services/api-error';
import { fetchEvolutionChain, fetchPokemon, fetchSpecies } from '@/services/pokeapi';
import { createWrapper } from '@/test-utils/query';

import { usePokemonDetail } from '../use-pokemon-detail';

jest.mock('@/services/pokeapi', () => ({ fetchPokemon: jest.fn(), fetchSpecies: jest.fn(), fetchEvolutionChain: jest.fn() }));

const pokemon = {
  id: 2, name: 'ivysaur', types: ['grass'], stats: [], height: 10, weight: 130, baseExperience: 142,
  abilities: [], speciesId: 2, spriteUrl: 's/2', artworkUrl: 'a/2',
};

beforeEach(() => {
  jest.mocked(fetchPokemon).mockResolvedValue(pokemon);
  jest.mocked(fetchSpecies).mockResolvedValue({ id: 2, description: null, evolutionChainId: 1 });
  jest.mocked(fetchEvolutionChain).mockResolvedValue({
    id: 1, name: 'bulbasaur', spriteUrl: 's/1',
    evolvesTo: [{ id: 2, name: 'ivysaur', spriteUrl: 's/2', evolvesTo: [] }],
  });
});

describe('usePokemonDetail', () => {
  it('loads the Pokémon, then its evolution chain as rows', async () => {
    const { result } = await renderHook(() => usePokemonDetail(2), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.pokemon?.name).toBe('ivysaur'));
    await waitFor(() => expect(result.current.evolution.rows.map((r) => r.id)).toEqual([1, 2]));
    expect(fetchSpecies).toHaveBeenCalledWith(2);
    expect(fetchEvolutionChain).toHaveBeenCalledWith(1);
  });

  it('shows the error when the Pokémon fails', async () => {
    jest.mocked(fetchPokemon).mockRejectedValue(new ApiError('http', 'x', 404));
    const { result } = await renderHook(() => usePokemonDetail(99999), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('keeps the detail when only the evolution chain fails', async () => {
    jest.mocked(fetchEvolutionChain).mockRejectedValue(new ApiError('network', 'x'));
    const { result } = await renderHook(() => usePokemonDetail(2), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.evolution.isError).toBe(true));
    expect(result.current.isError).toBe(false);
    expect(result.current.pokemon?.name).toBe('ivysaur');
  });
});
