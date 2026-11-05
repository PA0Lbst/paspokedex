/** App-side shapes of the PokeAPI data. Only the fields the app uses. */

export type PokemonSummary = {
  id: number;
  name: string;
  spriteUrl: string;
};

export type PokemonPage = {
  /** Total number of Pokémon (1351 today). */
  count: number;
  items: PokemonSummary[];
  /** Offset of the next page, or null on the last page. */
  nextOffset: number | null;
};

export type PokemonStat = {
  /** API name: hp, attack, defense, special-attack, special-defense, speed. */
  name: string;
  value: number;
};

export type Pokemon = {
  id: number;
  name: string;
  /** Type names in slot order, e.g. ["grass", "poison"]. */
  types: string[];
  stats: PokemonStat[];
  /** Decimetres, as the API sends it. */
  height: number;
  /** Hectograms, as the API sends it. */
  weight: number;
  baseExperience: number | null;
  abilities: string[];
  speciesId: number;
  spriteUrl: string;
  artworkUrl: string;
};

export type PokemonSpecies = {
  id: number;
  /** First English description, whitespace cleaned up. */
  description: string | null;
  evolutionChainId: number;
};

export type EvolutionStage = {
  /** Species id, which is also the id of its default Pokémon. */
  id: number;
  name: string;
  spriteUrl: string;
  evolvesTo: EvolutionStage[];
};
