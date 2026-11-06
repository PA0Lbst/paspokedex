import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Share } from 'react-native';

import { OptionsDialog } from '@/components/options-dialog';
import type { PokemonSummary } from '@/services/pokeapi-types';
import { buildShareMessage } from '@/utils/share';

import { useFavorites } from './use-favorites';

export type PokemonOption = {
  key: 'open' | 'favorite' | 'share';
  label: string;
  destructive: boolean;
  run: () => void;
};

/** Labels of the Figma Options, in order. The favorite one depends on the current state. */
export function optionLabels(isFavorite: boolean): [string, string, string] {
  return ['Open Pokémon', isFavorite ? 'Remove from favorites' : 'Add to favorites', 'Share'];
}

/**
 * The ⋮ Options of a card (#22), as the system's own dialog (`OptionsDialog`): the iOS
 * confirmation dialog from the bottom of the screen, a native dialog on Android.
 * A screen passes `openOptions` to its grid and renders `dialog` once.
 */
export function usePokemonOptions() {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selected, setSelected] = useState<PokemonSummary | null>(null);

  const buildOptions = (pokemon: PokemonSummary): PokemonOption[] => {
    const favorite = isFavorite(pokemon.id);
    const [open, favoriteLabel, share] = optionLabels(favorite);
    return [
      { key: 'open', label: open, destructive: false, run: () => router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } }) },
      { key: 'favorite', label: favoriteLabel, destructive: favorite, run: () => { toggleFavorite(pokemon); } },
      { key: 'share', label: share, destructive: false, run: () => { Share.share({ message: buildShareMessage(pokemon) }); } },
    ];
  };

  const dialog = (
    <OptionsDialog
      pokemon={selected}
      options={selected ? buildOptions(selected) : []}
      onClose={() => setSelected(null)}
    />
  );

  return { openOptions: setSelected, dialog };
}
