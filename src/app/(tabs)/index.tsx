import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PokemonGrid } from '@/components/pokemon-grid';
import { ErrorView, LoadingView } from '@/components/state-views';
import { usePokemonList } from '@/hooks/use-pokemon-list';
import { getErrorMessage } from '@/services/api-error';
import type { PokemonSummary } from '@/services/pokeapi-types';
import { colors, spacing, text } from '@/theme';

/** Pokémons tab: every Pokémon in a 2-column grid, 20 at a time (specs/features/list.md). */
export default function PokemonListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const list = usePokemonList();

  const openPokemon = (pokemon: PokemonSummary) => {
    router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } });
  };

  const title = <Text style={[text.title, styles.title]}>All Pokémon</Text>;

  if (list.isLoading || list.isError) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + spacing.l }]}>
        <View style={styles.titleRow}>{title}</View>
        {list.isLoading ? (
          <LoadingView />
        ) : (
          <ErrorView message={getErrorMessage(list.error)} onRetry={list.retry} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <PokemonGrid
        pokemon={list.pokemon}
        onPressPokemon={openPokemon}
        header={title}
        onEndReached={list.loadMore}
        isLoadingMore={list.isLoadingMore}
        loadMoreFailed={list.loadMoreFailed}
        onRetryLoadMore={list.retryLoadMore}
        topInset={insets.top}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.daylight },
  titleRow: { paddingHorizontal: spacing.xl },
  title: { marginBottom: spacing.l, marginHorizontal: spacing.s / 2 },
});
