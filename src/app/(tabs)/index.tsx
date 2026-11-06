import type { FlashListRef } from '@shopify/flash-list';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState, type RefObject } from 'react';
import { BackHandler, Keyboard, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PokemonGrid } from '@/components/pokemon-grid';
import { SearchField } from '@/components/search-field';
import { EmptyState, ErrorView, LoadingView } from '@/components/state-views';
import { usePokemonList } from '@/hooks/use-pokemon-list';
import { usePokemonOptions } from '@/hooks/use-pokemon-options';
import { type PokemonSearch, usePokemonSearch } from '@/hooks/use-pokemon-search';
import { useTabRePress } from '@/hooks/use-tab-repress';
import { useTwoPressReset } from '@/hooks/use-two-press-reset';
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
  const options = usePokemonOptions();
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlashListRef<PokemonSummary>>(null);
  const resultsRef = useRef<FlashListRef<PokemonSummary>>(null);

  useBackClearsSearch(search.query !== '', search.clear);

  // Pressing the Pokémons tab while on it: 1st press scrolls to the top, 2nd clears the search
  // (specs/features/search.md).
  const reset = useTwoPressReset({
    query: search.query,
    scrollToTop: () => {
      Keyboard.dismiss();
      (search.isSearching ? resultsRef : listRef).current?.scrollToOffset({ offset: 0, animated: true });
    },
    clearSearch: () => {
      search.clear();
      Keyboard.dismiss();
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    },
  });
  useTabRePress(reset.onRePress);

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
            onMorePokemon={options.openOptions}
            header={title}
            onEndReached={list.loadMore}
            isLoadingMore={list.isLoadingMore}
            loadMoreFailed={list.loadMoreFailed}
            onRetryLoadMore={list.retryLoadMore}
            topInset={spacing.l}
            refreshing={refreshing}
            onRefresh={refresh}
            listRef={listRef}
          />
        )}
      </View>

      {search.isSearching ? (
        <View style={styles.body}>
          <SearchResults
            search={search}
            onPressPokemon={openPokemon}
            onMorePokemon={options.openOptions}
            refreshing={refreshing}
            onRefresh={refresh}
            resultsRef={resultsRef}
            onScrollBeginDrag={reset.cancel}
          />
        </View>
      ) : null}
      {options.sheet}
    </View>
  );
}

function SearchResults({
  search,
  onPressPokemon,
  onMorePokemon,
  refreshing,
  onRefresh,
  resultsRef,
  onScrollBeginDrag,
}: {
  search: PokemonSearch;
  onPressPokemon: (pokemon: PokemonSummary) => void;
  onMorePokemon: (pokemon: PokemonSummary) => void;
  refreshing: boolean;
  onRefresh: () => void;
  resultsRef: RefObject<FlashListRef<PokemonSummary> | null>;
  onScrollBeginDrag: () => void;
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
      onMorePokemon={onMorePokemon}
      topInset={spacing.l}
      refreshing={refreshing}
      onRefresh={onRefresh}
      listRef={resultsRef}
      onScrollBeginDrag={onScrollBeginDrag}
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
