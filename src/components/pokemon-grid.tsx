import { FlashList, type FlashListRef } from '@shopify/flash-list';
import type { ReactElement, Ref } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { PokemonSummary } from '@/services/pokeapi-types';
import { makeStyles, radius, spacing, useTheme } from '@/theme';

import { PokemonCard } from './pokemon-card';
import { t } from '@/i18n';

type Props = {
  pokemon: PokemonSummary[];
  onPressPokemon: (pokemon: PokemonSummary) => void;
  /** ⋮ on each card: opens the Options sheet (#22). */
  onMorePokemon?: (pokemon: PokemonSummary) => void;
  /** Shown above the first row (the title). */
  header?: ReactElement;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  loadMoreFailed?: boolean;
  onRetryLoadMore?: () => void;
  /** Top padding, e.g. the safe area inset. */
  topInset?: number;
  /** Pull to refresh: shown only when onRefresh is given. */
  refreshing?: boolean;
  onRefresh?: () => void;
  /** To scroll from outside, e.g. back to the top when the active tab is pressed. */
  listRef?: Ref<FlashListRef<PokemonSummary>>;
  onScrollBeginDrag?: () => void;
};

/** 2-column grid of PokemonCards, with a footer for "loading more" and its error. */
export function PokemonGrid({
  pokemon,
  onPressPokemon,
  onMorePokemon,
  header,
  onEndReached,
  isLoadingMore = false,
  loadMoreFailed = false,
  onRetryLoadMore,
  topInset = 0,
  refreshing = false,
  onRefresh,
  listRef,
  onScrollBeginDrag,
}: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <FlashList
      ref={listRef}
      data={pokemon}
      numColumns={2}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item, index }) => (
        <View style={[styles.cell, index % 2 === 0 ? styles.cellLeft : styles.cellRight]}>
          <PokemonCard pokemon={item} onPress={onPressPokemon} onMore={onMorePokemon} />
        </View>
      )}
      ListHeaderComponent={header}
      ListFooterComponent={
        <GridFooter isLoadingMore={isLoadingMore} loadMoreFailed={loadMoreFailed} onRetry={onRetryLoadMore} />
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onScrollBeginDrag={onScrollBeginDrag}
      contentContainerStyle={{ ...styles.content, paddingTop: topInset + spacing.l }}
      // Dragging the grid hides the keyboard of the search field; a tap on a card still works.
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.purple}
            colors={[colors.purple]}
          />
        ) : undefined
      }
    />
  );
}

function GridFooter({
  isLoadingMore,
  loadMoreFailed,
  onRetry,
}: {
  isLoadingMore: boolean;
  loadMoreFailed: boolean;
  onRetry?: () => void;
}) {
  const { colors, text } = useTheme();
  const styles = useStyles();
  if (loadMoreFailed) {
    return (
      <View style={styles.footer}>
        <Text style={text.body}>{t('loadMoreFailed')}</Text>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={t('tryAgain')}
          style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
          <Text style={[text.labelSmall, styles.retryLabel]}>{t('tryAgain')}</Text>
        </Pressable>
      </View>
    );
  }
  if (isLoadingMore) {
    return (
      <View style={styles.footer} accessibilityRole="progressbar" accessibilityLabel={t('loadingMore')}>
        <ActivityIndicator color={colors.purple} />
      </View>
    );
  }
  return <View style={styles.footerSpace} />;
}

const useStyles = makeStyles(({ colors }) =>
  StyleSheet.create({
  content: { paddingHorizontal: spacing.xl - spacing.s / 2 },
  cell: { flex: 1, paddingBottom: spacing.l },
  cellLeft: { paddingLeft: spacing.s / 2, paddingRight: spacing.s },
  cellRight: { paddingLeft: spacing.s, paddingRight: spacing.s / 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.m,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  footerSpace: { height: spacing.xl },
  retry: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.card,
    backgroundColor: colors.purple,
  },
  retryLabel: { color: colors.onAccent },
  pressed: { opacity: 0.8 },
}),
);
