import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, type ImageSourcePropType, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type PokemonOption, usePokemonActions } from '@/hooks/use-pokemon-options';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/theme';
import { formatPokemonName } from '@/utils/format';
import { t } from '@/i18n';

/**
 * Figma "Options", as a native bottom sheet (Stack `formSheet`, see the root layout):
 * Open Pokémon, Add to / Remove from favorites, Share, and Cancel on iOS (specs/features/share.md).
 */
export default function PokemonOptionsScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
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
              tintColor={option.key === 'favorite' && isFavorite ? undefined : colors.actionBlue}
            />
            <Text style={styles.label}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      {Platform.OS === 'ios' ? (
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('cancel')} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
          <Text style={styles.cancelLabel}>{t('cancel')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors }) =>
  StyleSheet.create({
  sheet: { paddingTop: spacing.xl, paddingHorizontal: spacing.m, gap: spacing.m, backgroundColor: colors.daylight },
  title: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.midnight, textAlign: 'center' },
  group: { borderRadius: radius.sheet, overflow: 'hidden', backgroundColor: colors.sheetGroup },
  option: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 20, paddingVertical: 18 },
  separator: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.sheetSeparator },
  pressed: { opacity: 0.6 },
  icon: { width: 24, height: 24 },
  label: { fontFamily: fonts.regular, fontSize: 18, color: colors.sheetText },
  cancel: { borderRadius: radius.sheet, backgroundColor: colors.sheetCancel, paddingVertical: spacing.l, alignItems: 'center' },
  cancelLabel: { fontFamily: fonts.bold, fontSize: 20, color: colors.actionBlue },
}),
);
