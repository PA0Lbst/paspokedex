import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { useFavorites } from '@/hooks/use-favorites';
import type { Pokemon } from '@/services/pokeapi-types';
import { makeStyles, spacing, useTheme } from '@/theme';
import { formatPokemonName } from '@/utils/format';
import { t } from '@/i18n';

/** Compare and the favorite heart, on the right of the native header. */
export function HeaderActions({ pokemon }: { pokemon: Pokemon }) {
  const { colors, text } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(pokemon.id);
  // Animation 2 (#9): the heart pops when added, to confirm the tap at a glance.
  const scale = useSharedValue(1);
  const pop = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const toggle = () => {
    if (!favorite) scale.set(withSequence(withSpring(1.35, { duration: 150 }), withSpring(1, { duration: 250 })));
    toggleFavorite(pokemon);
  };
  const name = formatPokemonName(pokemon.name);
  return (
    <View style={styles.headerActions}>
      <Pressable
        onPress={() => router.push({ pathname: '/compare', params: { first: String(pokemon.id) } })}
        accessibilityRole="button"
        accessibilityLabel={t('compareNamed', { name })}
        hitSlop={spacing.s}>
        <Text style={[text.labelSmall, styles.compare]}>{t('compare')}</Text>
      </Pressable>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={favorite ? t('removeFavorite') : t('addFavorite')}
        accessibilityState={{ selected: favorite }}
        hitSlop={spacing.s}>
        {/* Favorite: filled red heart; not yet: Midnight outline (Figma Favorite icon). */}
        <Animated.View style={pop}>
        {favorite ? (
          <Image testID="heart-filled" source={require('@/assets/icons/favorite-filled.png')} style={styles.heart} />
        ) : (
          <Image testID="heart-outline" source={require('@/assets/icons/favorite.png')} style={styles.heart} tintColor={colors.midnight} />
        )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles(({ colors }) =>
  StyleSheet.create({
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.l },
  compare: { color: colors.purple },
  heart: { width: 24, height: 24 },
}),
);
