import { ApiError, getErrorMessage } from '../api-error';
import {
  artworkUrl,
  fetchEvolutionChain,
  fetchPokemon,
  fetchPokemonIndex,
  fetchPokemonPage,
  fetchSpecies,
  getIdFromUrl,
  spriteUrl,
} from '../pokeapi';
import { shouldRetry } from '../query-client';

const fetchMock = jest.spyOn(globalThis, 'fetch');

function respond(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));
}

const resource = (name: string, path: string, id: number) => ({ name, url: `https://pokeapi.co/api/v2/${path}/${id}/` });

beforeEach(() => fetchMock.mockReset());

describe('helpers', () => {
  it('reads the id at the end of an API url', () => {
    expect(getIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
    expect(getIdFromUrl('https://pokeapi.co/api/v2/pokemon/10001')).toBe(10001);
  });

  it('throws when the url has no id', () => {
    expect(() => getIdFromUrl('https://pokeapi.co/api/v2/pokemon/')).toThrow(ApiError);
  });

  it('builds sprite and artwork urls from the id', () => {
    expect(spriteUrl(1)).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png');
    expect(artworkUrl(1)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    );
  });
});

describe('fetchPokemonPage', () => {
  it('maps a page to summaries without a call per Pokémon', async () => {
    respond({
      count: 1351,
      next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
      results: [resource('bulbasaur', 'pokemon', 1), resource('ivysaur', 'pokemon', 2)],
    });

    const page = await fetchPokemonPage(0, 20);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon?limit=20&offset=0');
    expect(page.count).toBe(1351);
    expect(page.items[0]).toEqual({ id: 1, name: 'bulbasaur', spriteUrl: spriteUrl(1) });
    expect(page.nextOffset).toBe(2);
  });

  it('has no next offset on the last page', async () => {
    respond({ count: 1351, next: null, results: [resource('pecharunt', 'pokemon', 1025)] });
    const page = await fetchPokemonPage(1350, 20);
    expect(page.nextOffset).toBeNull();
  });
});

describe('fetchPokemonIndex', () => {
  it('gets every Pokémon in one call, sorted by id', async () => {
    respond({
      count: 3,
      next: null,
      results: [resource('calyrex-ice', 'pokemon', 10193), resource('bulbasaur', 'pokemon', 1), resource('pikachu', 'pokemon', 25)],
    });

    const index = await fetchPokemonIndex();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0');
    expect(index.map((p) => p.id)).toEqual([1, 25, 10193]);
    expect(index[1]).toEqual({ id: 25, name: 'pikachu', spriteUrl: spriteUrl(25) });
  });

  it('throws an invalid ApiError on a wrong shape', async () => {
    respond({ count: 1, results: 'nope' });
    await expect(fetchPokemonIndex()).rejects.toMatchObject({ kind: 'invalid' });
  });

  it('throws a network ApiError when offline', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    await expect(fetchPokemonIndex()).rejects.toMatchObject({ kind: 'network' });
  });
});

describe('fetchPokemon', () => {
  it('keeps only the fields the app uses', async () => {
    respond({
      id: 1,
      name: 'bulbasaur',
      height: 7,
      weight: 69,
      base_experience: 64,
      types: [{ slot: 1, type: resource('grass', 'type', 12) }, { slot: 2, type: resource('poison', 'type', 4) }],
      stats: [{ base_stat: 45, effort: 0, stat: resource('hp', 'stat', 1) }],
      abilities: [{ is_hidden: false, slot: 1, ability: resource('overgrow', 'ability', 65) }],
      species: resource('bulbasaur', 'pokemon-species', 1),
    });

    const pokemon = await fetchPokemon(1);

    expect(pokemon).toEqual({
      id: 1,
      name: 'bulbasaur',
      types: ['grass', 'poison'],
      stats: [{ name: 'hp', value: 45 }],
      height: 7,
      weight: 69,
      baseExperience: 64,
      abilities: ['overgrow'],
      speciesId: 1,
      spriteUrl: spriteUrl(1),
      artworkUrl: artworkUrl(1),
    });
  });

  it('accepts a missing base experience', async () => {
    respond({
      id: 10001, name: 'deoxys-attack', height: 17, weight: 608, base_experience: null,
      types: [], stats: [], abilities: [], species: resource('deoxys', 'pokemon-species', 386),
    });
    const pokemon = await fetchPokemon(10001);
    expect(pokemon.baseExperience).toBeNull();
    expect(pokemon.speciesId).toBe(386);
  });
});

describe('fetchSpecies', () => {
  it('returns the first English description and the evolution chain id', async () => {
    respond({
      id: 1,
      flavor_text_entries: [
        { flavor_text: 'Une graine…', language: resource('fr', 'language', 5) },
        { flavor_text: 'A strange seed was\nplanted on its\nback at birth.', language: resource('en', 'language', 9) },
      ],
      evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
    });

    const species = await fetchSpecies(1);

    expect(species).toEqual({ id: 1, description: 'A strange seed was planted on its back at birth.', evolutionChainId: 1 });
  });
});

describe('fetchEvolutionChain', () => {
  it('returns the chain as a tree, branches included', async () => {
    respond({
      id: 67,
      chain: {
        species: resource('eevee', 'pokemon-species', 133),
        evolves_to: [
          { species: resource('vaporeon', 'pokemon-species', 134), evolves_to: [] },
          { species: resource('jolteon', 'pokemon-species', 135), evolves_to: [] },
        ],
      },
    });

    const chain = await fetchEvolutionChain(67);

    expect(chain.name).toBe('eevee');
    expect(chain.evolvesTo.map((stage) => stage.id)).toEqual([134, 135]);
    expect(chain.evolvesTo[0].spriteUrl).toBe(spriteUrl(134));
  });
});

describe('errors', () => {
  it('throws an http ApiError with the status on 404', async () => {
    respond({}, 404);
    await expect(fetchPokemon(99999)).rejects.toMatchObject({ kind: 'http', status: 404 });
  });

  it('throws a network ApiError when fetch fails', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    await expect(fetchPokemonPage(0)).rejects.toMatchObject({ kind: 'network', status: null });
  });

  it('throws an invalid ApiError when the shape is wrong', async () => {
    respond({ count: 'many', results: [] });
    await expect(fetchPokemonPage(0)).rejects.toMatchObject({ kind: 'invalid' });
  });

  it('gives a user message per kind of error', () => {
    expect(getErrorMessage(new ApiError('network', 'x'))).toMatch(/offline/);
    expect(getErrorMessage(new ApiError('http', 'x', 404))).toMatch(/doesn't exist/);
    expect(getErrorMessage(new Error('x'))).toMatch(/couldn't load/);
  });

  it('retries network and server errors twice, never 404 or broken responses', () => {
    expect(shouldRetry(0, new ApiError('network', 'x'))).toBe(true);
    expect(shouldRetry(1, new ApiError('http', 'x', 500))).toBe(true);
    expect(shouldRetry(2, new ApiError('http', 'x', 500))).toBe(false);
    expect(shouldRetry(0, new ApiError('http', 'x', 404))).toBe(false);
    expect(shouldRetry(0, new ApiError('invalid', 'x'))).toBe(false);
  });
});
