import { ApiError } from './api-error';
import {
  type JsonRecord,
  readArray,
  readNamedResource,
  readNullableString,
  readNumber,
  readOptionalNumber,
  readRecord,
  readString,
} from './json';
import type { EvolutionStage, Pokemon, PokemonPage, PokemonSpecies, PokemonSummary } from './pokeapi-types';

export const API_BASE_URL = 'https://pokeapi.co/api/v2';
const SPRITES_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

export const PAGE_SIZE = 20;
/** Higher than the number of Pokémon (1351), so one call returns them all. */
export const INDEX_LIMIT = 100000;

/** "https://pokeapi.co/api/v2/pokemon/25/" → 25. */
export function getIdFromUrl(url: string): number {
  const match = /\/(\d+)\/?$/.exec(url);
  if (!match) throw new ApiError('invalid', `Unexpected API response: no id in ${url}`);
  return Number(match[1]);
}

/** Pixel sprite, used on the cards (as in Figma). */
export function spriteUrl(id: number): string {
  return `${SPRITES_BASE_URL}/${id}.png`;
}

/** Official artwork, used on the detail. */
export function artworkUrl(id: number): string {
  return `${SPRITES_BASE_URL}/other/official-artwork/${id}.png`;
}

async function getJson(path: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`);
  } catch {
    throw new ApiError('network', 'Network request failed');
  }
  if (!response.ok) {
    throw new ApiError('http', `PokeAPI answered ${response.status} for ${path}`, response.status);
  }
  try {
    const data: unknown = await response.json();
    return data;
  } catch {
    throw new ApiError('invalid', `Unexpected API response: not JSON for ${path}`);
  }
}

function readSummaries(body: JsonRecord): PokemonSummary[] {
  return readArray(body, 'results').map((entry) => {
    const { name, url } = readNamedResource(entry, 'result');
    const id = getIdFromUrl(url);
    return { id, name, spriteUrl: spriteUrl(id) };
  });
}

/** One page of the list: GET /pokemon?limit&offset. No call per Pokémon. */
export async function fetchPokemonPage(offset: number, limit: number = PAGE_SIZE): Promise<PokemonPage> {
  const body = readRecord(await getJson(`/pokemon?limit=${limit}&offset=${offset}`), 'page');
  const items = readSummaries(body);
  const next = readNullableString(body, 'next');
  return {
    count: readNumber(body, 'count'),
    items,
    nextOffset: next === null ? null : offset + items.length,
  };
}

/**
 * Every Pokémon in one call, for search: GET /pokemon?limit=100000 (about 93 KB).
 * PokeAPI has no search endpoint, so the app filters this index itself. Sorted by id.
 */
export async function fetchPokemonIndex(): Promise<PokemonSummary[]> {
  const body = readRecord(await getJson(`/pokemon?limit=${INDEX_LIMIT}&offset=0`), 'index');
  return readSummaries(body).sort((a, b) => a.id - b.id);
}

/** GET /pokemon/{id}: types, stats, size, abilities. */
export async function fetchPokemon(id: number): Promise<Pokemon> {
  const body = readRecord(await getJson(`/pokemon/${id}`), 'pokemon');
  const pokemonId = readNumber(body, 'id');
  return {
    id: pokemonId,
    name: readString(body, 'name'),
    types: readArray(body, 'types').map((entry) => readNamedResource(readRecord(entry, 'type').type, 'type').name),
    stats: readArray(body, 'stats').map((entry) => {
      const stat = readRecord(entry, 'stat');
      return { name: readNamedResource(stat.stat, 'stat').name, value: readNumber(stat, 'base_stat') };
    }),
    height: readNumber(body, 'height'),
    weight: readNumber(body, 'weight'),
    baseExperience: readOptionalNumber(body, 'base_experience'),
    abilities: readArray(body, 'abilities').map(
      (entry) => readNamedResource(readRecord(entry, 'ability').ability, 'ability').name,
    ),
    speciesId: getIdFromUrl(readNamedResource(body.species, 'species').url),
    spriteUrl: spriteUrl(pokemonId),
    artworkUrl: artworkUrl(pokemonId),
  };
}

/** GET /pokemon-species/{id}: English description and the evolution chain id. */
export async function fetchSpecies(id: number): Promise<PokemonSpecies> {
  const body = readRecord(await getJson(`/pokemon-species/${id}`), 'species');
  const english = readArray(body, 'flavor_text_entries')
    .map((entry) => readRecord(entry, 'flavor text'))
    .find((entry) => readNamedResource(entry.language, 'language').name === 'en');
  return {
    id: readNumber(body, 'id'),
    description: english ? readString(english, 'flavor_text').replace(/\s+/g, ' ').trim() : null,
    evolutionChainId: getIdFromUrl(readString(readRecord(body.evolution_chain, 'evolution chain'), 'url')),
  };
}

function readStage(value: unknown): EvolutionStage {
  const link = readRecord(value, 'chain link');
  const { name, url } = readNamedResource(link.species, 'species');
  const id = getIdFromUrl(url);
  return { id, name, spriteUrl: spriteUrl(id), evolvesTo: readArray(link, 'evolves_to').map(readStage) };
}

/** GET /evolution-chain/{id}: the chain as a tree (a stage can branch, like Eevee). */
export async function fetchEvolutionChain(id: number): Promise<EvolutionStage> {
  const body = readRecord(await getJson(`/evolution-chain/${id}`), 'evolution chain');
  return readStage(body.chain);
}
