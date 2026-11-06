import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image as NativeImage, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  AboutSection,
  type DetailTab,
  DetailTabs,
  EvolutionSection,
  StatsSection,
} from '@/components/pokemon-detail-sections';
import { ErrorView, LoadingView } from '@/components/state-views';
import { TypeBadge } from '@/components/type-badge';
import { useFavorites } from '@/hooks/use-favorites';
import { usePokemonDetail } from '@/hooks/use-pokemon-detail';
import { getErrorMessage } from '@/services/api-error';
import { colors, spacing, text } from '@/theme';
import { formatPokemonName, formatPokemonNumber } from '@/utils/format';

/** Figma Detail: name, number, types, artwork, then About / Stats / Evolution (specs/features/detail.md). */
export default function PokemonDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const detail = usePokemonDetail(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [tab, setTab] = useState<DetailTab>('About');
  const pokemon = detail.pokemon;
  const favorite = isFavorite(id);

  const header = (
    <Stack.Screen
      options={{
        title: '',
        headerRight: () =>
          pokemon ? (
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => router.push({ pathname: '/compare', params: { first: String(id) } })}
                accessibilityRole="button"
                accessibilityLabel={`Compare ${formatPokemonName(pokemon.name)}`}
                hitSlop={spacing.s}>
                <Text style={[text.labelSmall, styles.compare]}>Compare</Text>
              </Pressable>
              <Pressable
                onPress={() => toggleFavorite(pokemon)}
                accessibilityRole="button"
                accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
                accessibilityState={{ selected: favorite }}
                hitSlop={spacing.s}>
                <NativeImage
                  source={require('@/assets/icons/favorite.png')}
                  style={styles.heart}
                  tintColor={favorite ? colors.purple : colors.midnight}
                />
              </Pressable>
            </View>
          ) : null,
      }}
    />
  );

  if (detail.isLoading) return <>{header}<LoadingView /></>;
  if (detail.isError || !pokemon) {
    return <>{header}<ErrorView message={getErrorMessage(detail.error)} onRetry={detail.retry} /></>;
  }

  const openStage = (stageId: number) => router.push({ pathname: '/pokemon/[id]', params: { id: String(stageId) } });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {header}
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <Text style={[text.display, styles.name]} numberOfLines={1} adjustsFontSizeToFit>
            {formatPokemonName(pokemon.name)}
          </Text>
          <Text style={styles.number}>#{formatPokemonNumber(pokemon.id)}</Text>
        </View>
        <View style={styles.types}>
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </View>
        <Image
          source={pokemon.artworkUrl}
          style={styles.artwork}
          contentFit="contain"
          transition={200}
          accessibilityLabel={`${formatPokemonName(pokemon.name)} artwork`}
        />
      </View>
      <View style={styles.panel}>
        <DetailTabs active={tab} onChange={setTab} />
        {tab === 'About' ? <AboutSection pokemon={pokemon} /> : null}
        {tab === 'Stats' ? <StatsSection pokemon={pokemon} /> : null}
        {tab === 'Evolution' ? (
          <EvolutionSection currentId={pokemon.speciesId} {...detail.evolution} onRetry={detail.evolution.retry} onOpen={openStage} />
        ) : null}
      </View>
    </ScrollView>
  );
}

const ARTWORK = 200;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.daylight },
  content: { flexGrow: 1 },
  top: { paddingHorizontal: spacing.xl, paddingTop: spacing.l, gap: spacing.m },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.m },
  name: { flex: 1 },
  number: { ...text.title, fontFamily: text.body.fontFamily, color: colors.midnightFaint },
  types: { flexDirection: 'row', gap: spacing.s },
  artwork: { width: ARTWORK, height: ARTWORK, alignSelf: 'center', marginTop: spacing.l, marginBottom: -ARTWORK / 4, zIndex: 1 },
  panel: { flexGrow: 1, backgroundColor: colors.white, paddingTop: ARTWORK / 4 + spacing.xl, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.l },
  compare: { color: colors.purple },
  heart: { width: 24, height: 24 },
});
