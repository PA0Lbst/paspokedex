import { Alert, Pressable } from 'react-native';

import type { PokemonOption } from '@/hooks/use-pokemon-options';
import { spacing } from '@/theme';

import { MoreIcon } from './more-icon';

/** Android: a native dialog with the options (React Native has no Android action sheet). */
export function PokemonOptionsMenu({ name, options }: { name: string; options: PokemonOption[] }) {
  return (
    <Pressable
      hitSlop={spacing.s}
      accessibilityRole="button"
      accessibilityLabel={`Options for ${name}`}
      onPress={() =>
        Alert.alert(name, undefined, options.map((option) => ({ text: option.label, onPress: option.run })), {
          cancelable: true,
        })
      }>
      <MoreIcon />
    </Pressable>
  );
}
