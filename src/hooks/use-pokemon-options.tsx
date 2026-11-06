import { useRouter } from 'expo-router';
import { Share } from 'react-native';

import type { PokemonSummary } from '@/services/pokeapi-types';
import { buildShareMessage } from '@/utils/share';

import { useFavorites } from './use-favorites';

export type PokemonOption = {
  key: 'open' | 'favorite' | 'share';
  label: string;
  run: () => void;
};

/** Labels of the Figma Options sheet, in order. The favorite one depends on the current state. */
export function optionLabels(isFavorite: boolean): [string, string, string] {
  return ['Open Pokémon', isFavorite ? 'Remove from favorites' : 'Add to favorites', 'Share'];
}

/** Opens the Options sheet of a card's ⋮ (#22): a native bottom sheet (route `options/[id]`). */
export function usePokemonOptions() {
  const router = useRouter();
  const openOptions = (pokemon: PokemonSummary) =>
    router.push({ pathname: '/options/[id]', params: { id: String(pokemon.id), name: pokemon.name } });
  return { openOptions };
}

/** The three actions of the Options sheet for one Pokémon. Each closes the sheet first. */
export function usePokemonActions(pokemon: { id: number; name: string }) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(pokemon.id);
  const [open, favoriteLabel, share] = optionLabels(favorite);

  const options: PokemonOption[] = [
    {
      key: 'open',
      label: open,
      run: () => {
        router.back();
        router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } });
      },
    },
    {
      key: 'favorite',
      label: favoriteLabel,
      run: () => {
        toggleFavorite(pokemon);
        router.back();
      },
    },
    {
      key: 'share',
      label: share,
      run: () => {
        router.back();
        Share.share({ message: buildShareMessage(pokemon) });
      },
    },
  ];
  return { options, isFavorite: favorite };
}
