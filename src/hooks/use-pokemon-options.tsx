import { useRouter } from 'expo-router';
import { ActionSheetIOS, Alert, Platform, Share } from 'react-native';

import type { PokemonSummary } from '@/services/pokeapi-types';
import { formatPokemonName } from '@/utils/format';
import { buildShareMessage } from '@/utils/share';

import { useFavorites } from './use-favorites';

/** Labels of the Figma Options menu, in order. The favorite one depends on the current state. */
export function optionLabels(isFavorite: boolean): [string, string, string] {
  return ['Open Pokémon', isFavorite ? 'Remove from favorites' : 'Add to favorites', 'Share'];
}

/**
 * The Options menu of a card's ⋮ button (#22), as the system's own menu: the iOS action
 * sheet, and a native dialog on Android (React Native has no Android action sheet).
 */
export function usePokemonOptions() {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();

  const openOptions = (pokemon: PokemonSummary) => {
    const favorite = isFavorite(pokemon.id);
    const labels = optionLabels(favorite);
    const actions = [
      () => router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } }),
      () => {
        toggleFavorite(pokemon);
      },
      () => {
        Share.share({ message: buildShareMessage(pokemon) });
      },
    ];
    const title = formatPokemonName(pokemon.name);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { title, options: [...labels, 'Cancel'], cancelButtonIndex: labels.length, destructiveButtonIndex: favorite ? 1 : undefined },
        (index) => actions[index]?.(),
      );
    } else {
      Alert.alert(title, undefined, labels.map((text, i) => ({ text, onPress: actions[i] })), { cancelable: true });
    }
  };

  return { openOptions };
}
