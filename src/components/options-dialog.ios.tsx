import { Button, ConfirmationDialog, Host, Spacer } from '@expo/ui/swift-ui';
import { StyleSheet } from 'react-native';

import type { PokemonOption } from '@/hooks/use-pokemon-options';
import type { PokemonSummary } from '@/services/pokeapi-types';
import { formatPokemonName } from '@/utils/format';

type Props = { pokemon: PokemonSummary | null; options: PokemonOption[]; onClose: () => void };

/**
 * iOS: the system confirmation dialog (SwiftUI), drawn by iOS. iOS 26 presents it from the
 * view it is attached to, so it hangs on an invisible full-width strip at the bottom of the
 * screen: the sheet rises from the bottom, like the Figma Options.
 * (ActionSheetIOS can't do this: React Native presents it as a centred popover on iOS 26.)
 */
export function OptionsDialog({ pokemon, options, onClose }: Props) {
  const run = (option: PokemonOption) => {
    onClose();
    option.run();
  };

  return (
    <Host style={styles.anchor} pointerEvents="none">
      <ConfirmationDialog
        title={pokemon ? formatPokemonName(pokemon.name) : ''}
        titleVisibility="visible"
        isPresented={pokemon !== null}
        onIsPresentedChange={(presented) => {
          if (!presented) onClose();
        }}>
        <ConfirmationDialog.Trigger>
          <Spacer />
        </ConfirmationDialog.Trigger>
        <ConfirmationDialog.Actions>
          {options.map((option) => (
            <Button
              key={option.key}
              label={option.label}
              role={option.destructive ? 'destructive' : 'default'}
              onPress={() => run(option)}
            />
          ))}
          <Button label="Cancel" role="cancel" onPress={onClose} />
        </ConfirmationDialog.Actions>
      </ConfirmationDialog>
    </Host>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 1 },
});
