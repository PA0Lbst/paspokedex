import type { PokemonSummary } from '@/services/pokeapi-types';

import { isSearchQuery, normalizeSearchText, searchPokemon } from '../search';

const p = (id: number, name: string): PokemonSummary => ({ id, name, spriteUrl: `https://sprites.test/${id}.png` });

/** A slice of the real index, deliberately not in id order. */
const index = [
  p(10168, 'mr-mime-galar'),
  p(25, 'pikachu'),
  p(26, 'raichu'),
  p(4, 'charmander'),
  p(83, 'farfetchd'),
  p(122, 'mr-mime'),
  p(137, 'porygon'),
  p(233, 'porygon2'),
  p(172, 'pichu'),
  p(250, 'ho-oh'),
  p(10080, 'pikachu-rock-star'),
  p(718, 'zygarde-50'),
];

const ids = (query: string) => searchPokemon(index, query).map((pokemon) => pokemon.id);

describe('normalizeSearchText', () => {
  it('keeps lowercase letters and digits only', () => {
    expect(normalizeSearchText('Mr. Mime')).toBe('mrmime');
    expect(normalizeSearchText("Farfetch'd")).toBe('farfetchd');
    expect(normalizeSearchText('  ho-oh ')).toBe('hooh');
    expect(normalizeSearchText('Porygon2')).toBe('porygon2');
  });
});

describe('isSearchQuery', () => {
  it('is false for a blank or punctuation-only field', () => {
    expect(isSearchQuery('')).toBe(false);
    expect(isSearchQuery('   ')).toBe(false);
    expect(isSearchQuery(' - ')).toBe(false);
    expect(isSearchQuery('p')).toBe(true);
  });
});

describe('searchPokemon', () => {
  it('finds Pikachu from a partial name: "pika"', () => {
    expect(ids('pika')).toEqual([25, 10080]);
  });

  it('ignores case', () => {
    expect(ids('PIKA')).toEqual(ids('pika'));
    expect(ids('PiKaChU')).toEqual([25, 10080]);
  });

  it('matches anywhere in the name, not only the start', () => {
    expect(ids('chu')).toEqual([25, 26, 172, 10080]);
  });

  it('ignores spaces, dashes and apostrophes', () => {
    expect(ids('mr mime')).toEqual([122, 10168]);
    expect(ids('mr-mime')).toEqual([122, 10168]);
    expect(ids("farfetch'd")).toEqual([83]);
    expect(ids('hooh')).toEqual([250]);
  });

  it('finds a Pokémon by its number, with or without leading zeros', () => {
    expect(ids('25')).toEqual([25]);
    expect(ids('025')).toEqual([25]);
    expect(ids('#025')).toEqual([25]);
  });

  it('matches digits inside names too, but not every number starting with them', () => {
    expect(ids('2')).toEqual([233]);
  });

  it('returns results in number order, forms last', () => {
    expect(ids('i')).toEqual([25, 26, 122, 172, 10080, 10168]);
  });

  it('finds Pokémon the list has not loaded yet: it searches the whole index', () => {
    expect(ids('zygarde')).toEqual([718]);
  });

  it('returns nothing for no match or a blank query', () => {
    expect(ids('xyz')).toEqual([]);
    expect(ids('')).toEqual([]);
    expect(ids('   ')).toEqual([]);
  });

  it('does not change the index it was given', () => {
    const before = index.map((pokemon) => pokemon.id);
    searchPokemon(index, 'i');
    expect(index.map((pokemon) => pokemon.id)).toEqual(before);
  });
});
