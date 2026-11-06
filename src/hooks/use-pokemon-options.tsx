import type { SFSymbol } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { Share } from 'react-native';

import type { PokemonSummary } from '@/services/pokeapi-types';
import { buildShareMessage } from '@/utils/share';

import { useFavorites } from './use-favorites';

export type PokemonOption = {
  key: 'open' | 'favorite' | 'share';
  label: string;
  /** SF Symbol of the iOS menu (Figma shows an icon per option). */
  systemImage: SFSymbol;
  destructive: boolean;
  run: () => void;
};

/** Labels of the Figma Options menu, in order. The favorite one depends on the current state. */
export function optionLabels(isFavorite: boolean): [string, string, string] {
  return ['Open Pokémon', isFavorite ? 'Remove from favorites' : 'Add to favorites', 'Share'];
}

/** The actions of a card's ⋮ menu (#22); `PokemonOptionsMenu` shows them as the system's menu. */
export function usePokemonOptions() {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();

  const getOptions = (pokemon: PokemonSummary): PokemonOption[] => {
    const favorite = isFavorite(pokemon.id);
    const [open, favoriteLabel, share] = optionLabels(favorite);
    return [
      {
        key: 'open',
        label: open,
        systemImage: 'arrow.up.left.and.arrow.down.right',
        destructive: false,
        run: () => router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } }),
      },
      {
        key: 'favorite',
        label: favoriteLabel,
        systemImage: favorite ? 'heart.slash' : 'heart',
        destructive: favorite,
        run: () => {
          toggleFavorite(pokemon);
        },
      },
      {
        key: 'share',
        label: share,
        systemImage: 'square.and.arrow.up',
        destructive: false,
        run: () => {
          Share.share({ message: buildShareMessage(pokemon) });
        },
      },
    ];
  };

  return { getOptions };
}
