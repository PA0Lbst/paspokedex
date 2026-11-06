import { useEffect } from 'react';
import { Alert } from 'react-native';

import type { PokemonOption } from '@/hooks/use-pokemon-options';
import type { PokemonSummary } from '@/services/pokeapi-types';
import { formatPokemonName } from '@/utils/format';

type Props = { pokemon: PokemonSummary | null; options: PokemonOption[]; onClose: () => void };

/** Android: the system dialog with the options (React Native has no Android action sheet). */
export function OptionsDialog({ pokemon, options, onClose }: Props) {
  useEffect(() => {
    if (!pokemon) return;
    Alert.alert(
      formatPokemonName(pokemon.name),
      undefined,
      options.map((option) => ({
        text: option.label,
        style: option.destructive ? 'destructive' : 'default',
        onPress: () => {
          onClose();
          option.run();
        },
      })),
      { cancelable: true, onDismiss: onClose },
    );
    // Opened once per selected Pokémon.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon]);
  return null;
}
