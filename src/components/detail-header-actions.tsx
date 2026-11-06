import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useFavorites } from '@/hooks/use-favorites';
import type { Pokemon } from '@/services/pokeapi-types';
import { colors, spacing, text } from '@/theme';
import { formatPokemonName } from '@/utils/format';

/** Compare and the favorite heart, on the right of the native header. */
export function HeaderActions({ pokemon }: { pokemon: Pokemon }) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(pokemon.id);
  const name = formatPokemonName(pokemon.name);
  return (
    <View style={styles.headerActions}>
      <Pressable
        onPress={() => router.push({ pathname: '/compare', params: { first: String(pokemon.id) } })}
        accessibilityRole="button"
        accessibilityLabel={`Compare ${name}`}
        hitSlop={spacing.s}>
        <Text style={[text.labelSmall, styles.compare]}>Compare</Text>
      </Pressable>
      <Pressable
        onPress={() => toggleFavorite(pokemon)}
        accessibilityRole="button"
        accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
        accessibilityState={{ selected: favorite }}
        hitSlop={spacing.s}>
        <Image
          source={require('@/assets/icons/favorite.png')}
          style={styles.heart}
          tintColor={favorite ? colors.purple : colors.midnight}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.l },
  compare: { color: colors.purple },
  heart: { width: 24, height: 24 },
});
