import type { FlashListRef } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PokemonGrid } from '@/components/pokemon-grid';
import { EmptyState, ErrorView, LoadingView } from '@/components/state-views';
import { useFavorites } from '@/hooks/use-favorites';
import { usePokemonOptions } from '@/hooks/use-pokemon-options';
import { useTabRePress } from '@/hooks/use-tab-repress';
import type { PokemonSummary } from '@/services/pokeapi-types';
import { makeStyles, spacing, useTheme } from '@/theme';
import { t } from '@/i18n';

/** Favorites tab: the favorites stored in SQLite, newest first (specs/features/favorites.md). */
export default function FavoritesScreen() {
  const { text } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favorites, isLoading, isError, retry } = useFavorites();
  const options = usePokemonOptions();
  const listRef = useRef<FlashListRef<PokemonSummary>>(null);

  useTabRePress(useCallback(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }), []));

  const openPokemon = (pokemon: PokemonSummary) => {
    router.push({ pathname: '/pokemon/[id]', params: { id: String(pokemon.id) } });
  };

  const title = <Text style={[text.title, styles.title]}>{t('myFavorites')}</Text>;

  let body;
  if (isLoading) body = <LoadingView message={t('loadingFavorites')} />;
  else if (isError) body = <ErrorView message={t('favoritesError')} onRetry={retry} />;
  else if (favorites.length === 0) {
    body = <EmptyState title={t('noFavorites')} image={require('@/assets/images/snorlax.png')} style={styles.emptyHigh} />;
  }

  return (
    <View style={styles.screen}>
      {body ? (
        <View style={[styles.body, { paddingTop: insets.top + spacing.l }]}>
          <View style={styles.titleRow}>{title}</View>
          {body}
        </View>
      ) : (
        <PokemonGrid
          pokemon={favorites}
          onPressPokemon={openPokemon}
          onMorePokemon={options.openOptions}
          header={title}
          topInset={insets.top}
          listRef={listRef}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles(({ colors }) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.daylight },
  body: { flex: 1 },
  titleRow: { paddingHorizontal: spacing.xl },
  // Snorlax sits in the upper part of the screen, not at its centre.
  emptyHigh: { justifyContent: 'flex-start', paddingTop: spacing.xxl * 2 },
  title: { marginBottom: spacing.l, marginHorizontal: spacing.s / 2 },
}),
);
