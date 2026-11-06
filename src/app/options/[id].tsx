import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, type ImageSourcePropType, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type PokemonOption, usePokemonActions } from '@/hooks/use-pokemon-options';
import { colors, fonts, radius, spacing } from '@/theme';
import { formatPokemonName } from '@/utils/format';

/** System blue of the Figma Options sheet. */
const ACTION_BLUE = '#006DF8';

/**
 * Figma "Options", as a native bottom sheet (Stack `formSheet`, see the root layout):
 * Open Pokémon, Add to / Remove from favorites, Share, and Cancel on iOS (specs/features/share.md).
 */
export default function PokemonOptionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; name: string }>();
  const pokemon = { id: Number(params.id), name: params.name ?? '' };
  const { options, isFavorite } = usePokemonActions(pokemon);

  const icons: Record<PokemonOption['key'], ImageSourcePropType> = {
    open: require('@/assets/icons/option-open.png'),
    favorite: isFavorite ? require('@/assets/icons/favorite-filled.png') : require('@/assets/icons/option-favorite.png'),
    share: require('@/assets/icons/option-share.png'),
  };

  return (
    <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.m }]}>
      <Text style={styles.title} accessibilityRole="header">
        {formatPokemonName(pokemon.name)}
      </Text>
      <View style={styles.group}>
        {options.map((option, index) => (
          <Pressable
            key={option.key}
            onPress={option.run}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            style={({ pressed }) => [styles.option, index < options.length - 1 && styles.separator, pressed && styles.pressed]}>
            <Image
              source={icons[option.key]}
              style={styles.icon}
              tintColor={option.key === 'favorite' && isFavorite ? undefined : ACTION_BLUE}
            />
            <Text style={styles.label}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      {Platform.OS === 'ios' ? (
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Cancel" style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingTop: spacing.xl, paddingHorizontal: spacing.m, gap: spacing.m, backgroundColor: colors.daylight },
  title: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.midnight, textAlign: 'center' },
  group: { borderRadius: radius.sheet, overflow: 'hidden', backgroundColor: '#F0F0F0' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 20, paddingVertical: 18 },
  separator: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DADADA' },
  pressed: { opacity: 0.6 },
  icon: { width: 24, height: 24 },
  label: { fontFamily: fonts.regular, fontSize: 18, color: '#000000' },
  cancel: { borderRadius: radius.sheet, backgroundColor: '#FEFEFE', paddingVertical: spacing.l, alignItems: 'center' },
  cancelLabel: { fontFamily: fonts.bold, fontSize: 20, color: ACTION_BLUE },
});
