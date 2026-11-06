import { formatPokemonName, formatPokemonNumber } from './format';
import { t } from '@/i18n';

/** Text sent through the native share sheet for one Pokémon. */
export function buildShareMessage(pokemon: { id: number; name: string }): string {
  const name = formatPokemonName(pokemon.name);
  return t('shareMessage', { name, number: formatPokemonNumber(pokemon.id), link: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}` });
}
