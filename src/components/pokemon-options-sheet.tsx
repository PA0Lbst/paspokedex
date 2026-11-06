import { Image, type ImageSourcePropType, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { PokemonSummary } from '@/services/pokeapi-types';
import { colors, fonts, radius, spacing } from '@/theme';
import { formatPokemonName } from '@/utils/format';

/** System blue used by the Figma Options sheet (iOS action sheet look). */
const ACTION_BLUE = '#006DF8';

type Props = {
  pokemon: PokemonSummary | null;
  isFavorite: boolean;
  onOpen: (pokemon: PokemonSummary) => void;
  onToggleFavorite: (pokemon: PokemonSummary) => void;
  onShare: (pokemon: PokemonSummary) => void;
  onClose: () => void;
};

/** Figma "Options": Open Pokémon, Add to favorites, Share, and Cancel (iOS). */
export function PokemonOptionsSheet({ pokemon, isFavorite, onOpen, onToggleFavorite, onShare, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const run = (action: (p: PokemonSummary) => void) => () => {
    if (!pokemon) return;
    onClose();
    action(pokemon);
  };

  return (
    <Modal visible={pokemon !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close options" accessibilityRole="button" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.s }]}>
        {pokemon ? (
          <Text style={styles.heading} accessibilityRole="header">
            {formatPokemonName(pokemon.name)}
          </Text>
        ) : null}
        <View style={styles.group}>
          <Option icon={require('@/assets/icons/option-open.png')} label="Open Pokémon" onPress={run(onOpen)} />
          <Option
            icon={require('@/assets/icons/option-favorite.png')}
            label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onPress={run(onToggleFavorite)}
          />
          <Option icon={require('@/assets/icons/option-share.png')} label="Share" onPress={run(onShare)} last />
        </View>
        {Platform.OS === 'ios' ? (
          <Pressable style={styles.cancel} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cancel">
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
}

function Option({ icon, label, onPress, last = false }: { icon: ImageSourcePropType; label: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.option, !last && styles.optionBorder, pressed && styles.pressed]}>
      <Image source={icon} style={styles.icon} tintColor={ACTION_BLUE} />
      <Text style={styles.optionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
  sheet: { position: 'absolute', left: spacing.m, right: spacing.m, bottom: 0, gap: spacing.m },
  heading: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.white, textAlign: 'center' },
  group: { borderRadius: radius.sheet, overflow: 'hidden', backgroundColor: '#F0F0F0' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 20, paddingVertical: 18 },
  optionBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DADADA' },
  pressed: { backgroundColor: '#E4E4E4' },
  icon: { width: 24, height: 24 },
  optionLabel: { fontFamily: fonts.regular, fontSize: 18, color: '#000000' },
  cancel: { borderRadius: radius.sheet, backgroundColor: '#FEFEFE', paddingVertical: spacing.l, alignItems: 'center' },
  cancelLabel: { fontFamily: fonts.bold, fontSize: 20, color: ACTION_BLUE },
});
