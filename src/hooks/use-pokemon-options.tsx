import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Share } from 'react-native';

import { PokemonOptionsSheet } from '@/components/pokemon-options-sheet';
import type { PokemonSummary } from '@/services/pokeapi-types';
import { buildShareMessage } from '@/utils/share';

import { useFavorites } from './use-favorites';

/**
 * The Options sheet of a card's ⋮ button (#22). A screen renders `sheet` once and passes
 * `openOptions` to its grid.
 */
export function usePokemonOptions() {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selected, setSelected] = useState<PokemonSummary | null>(null);

  const sheet = (
    <PokemonOptionsSheet
      pokemon={selected}
      isFavorite={selected ? isFavorite(selected.id) : false}
      onClose={() => setSelected(null)}
      onOpen={(pokemon) => router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } })}
      onToggleFavorite={(pokemon) => {
        toggleFavorite(pokemon);
      }}
      onShare={(pokemon) => {
        Share.share({ message: buildShareMessage(pokemon) });
      }}
    />
  );

  return { openOptions: setSelected, sheet };
}
