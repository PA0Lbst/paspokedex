import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { BackHandler, Keyboard, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PokemonGrid } from '@/components/pokemon-grid';
import { SearchField } from '@/components/search-field';
import { EmptyState, ErrorView, LoadingView } from '@/components/state-views';
import { usePokemonList } from '@/hooks/use-pokemon-list';
import { type PokemonSearch, usePokemonSearch } from '@/hooks/use-pokemon-search';
import { getErrorMessage } from '@/services/api-error';
import type { PokemonSummary } from '@/services/pokeapi-types';
import { colors, spacing, text } from '@/theme';

/**
 * Pokémons tab: the search field (specs/features/search.md) above every Pokémon in a
 * 2-column grid, 20 at a time (specs/features/list.md).
 */
export default function PokemonListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const list = usePokemonList();
  const search = usePokemonSearch();
  const [refreshing, setRefreshing] = useState(false);

  useBackClearsSearch(search.query !== '', search.clear);

  const openPokemon = (pokemon: PokemonSummary) => {
    router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } });
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([list.refresh(), search.refresh()]);
    } finally {
      setRefreshing(false);
    }
  };

  const title = <Text style={[text.title, styles.title]}>All Pokémon</Text>;

  return (
    <View style={styles.screen}>
      <View style={[styles.searchRow, { paddingTop: insets.top + spacing.l }]}>
        <SearchField value={search.query} onChangeText={search.setQuery} onClear={search.clear} />
      </View>

      {/* The list stays mounted while searching, so clearing the field returns to the same scroll position. */}
      <View style={[styles.body, search.isSearching && styles.hidden]}>
        {list.isLoading || list.isError ? (
          <>
            <View style={styles.titleRow}>{title}</View>
            {list.isLoading ? (
              <LoadingView />
            ) : (
              <ErrorView message={getErrorMessage(list.error)} onRetry={list.retry} />
            )}
          </>
        ) : (
          <PokemonGrid
            pokemon={list.pokemon}
            onPressPokemon={openPokemon}
            header={title}
            onEndReached={list.loadMore}
            isLoadingMore={list.isLoadingMore}
            loadMoreFailed={list.loadMoreFailed}
            onRetryLoadMore={list.retryLoadMore}
            topInset={spacing.l}
            refreshing={refreshing}
            onRefresh={refresh}
          />
        )}
      </View>

      {search.isSearching ? (
        <View style={styles.body}>
          <SearchResults search={search} onPressPokemon={openPokemon} refreshing={refreshing} onRefresh={refresh} />
        </View>
      ) : null}
    </View>
  );
}

function SearchResults({
  search,
  onPressPokemon,
  refreshing,
  onRefresh,
}: {
  search: PokemonSearch;
  onPressPokemon: (pokemon: PokemonSummary) => void;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  if (search.isLoading) return <LoadingView />;
  if (search.isError) return <ErrorView message={getErrorMessage(search.error)} onRetry={search.retry} />;
  if (search.results.length === 0) {
    return (
      <EmptyState
        title={`No Pokémon found for “${search.searchedText}”`}
        message="Check the spelling, or try part of the name or the number."
      />
    );
  }
  return (
    <PokemonGrid
      pokemon={search.results}
      onPressPokemon={onPressPokemon}
      topInset={spacing.l}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}

/** Android: while a query is shown, the system back button clears it (like the Figma back arrow). */
function useBackClearsSearch(hasQuery: boolean, clear: () => void) {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android' || !hasQuery) return undefined;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        clear();
        Keyboard.dismiss();
        return true;
      });
      return () => subscription.remove();
    }, [hasQuery, clear]),
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.daylight },
  // Above the grid, so cards scroll under the field and its shadow.
  searchRow: { paddingHorizontal: spacing.l, zIndex: 1 },
  body: { flex: 1 },
  hidden: { display: 'none' },
  titleRow: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  title: { marginBottom: spacing.l, marginHorizontal: spacing.s / 2 },
});
