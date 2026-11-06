import { formatPokemonName, formatPokemonNumber } from './format';

/** Text sent through the native share sheet for one Pokémon. */
export function buildShareMessage(pokemon: { id: number; name: string }): string {
  const name = formatPokemonName(pokemon.name);
  return `${name} #${formatPokemonNumber(pokemon.id)} on paspokedex: https://pokeapi.co/api/v2/pokemon/${pokemon.id}`;
}
