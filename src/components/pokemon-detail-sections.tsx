import { Image } from 'expo-image';
import { Fragment, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import type { Pokemon } from '@/services/pokeapi-types';
import { colors, radius, softShadow, spacing, text } from '@/theme';
import { formatPokemonName, formatPokemonNumber } from '@/utils/format';
import {
  type EvolutionRow,
  formatBaseExperience,
  formatHeight,
  formatNameList,
  formatWeight,
  statLabel,
  statRatio,
} from '@/utils/pokemon-detail';

import { ErrorView, LoadingView } from './state-views';

export const DETAIL_TABS = ['About', 'Stats', 'Evolution'] as const;
export type DetailTab = (typeof DETAIL_TABS)[number];

/** Figma "Tabs": three equal tabs, Purple underline on the active one. */
export function DetailTabs({ active, onChange }: { active: DetailTab; onChange: (tab: DetailTab) => void }) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {DETAIL_TABS.map((tab) => {
        const selected = tab === active;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.tab, selected && styles.tabActive]}>
            <Text style={[text.labelSmall, styles.tabLabel, !selected && styles.tabLabelInactive]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** About: label / value rows, as in Figma. */
export function AboutSection({ pokemon }: { pokemon: Pokemon }) {
  const rows: [string, string][] = [
    ['Name', formatPokemonName(pokemon.name)],
    ['ID', formatPokemonNumber(pokemon.id)],
    ['Base', formatBaseExperience(pokemon.baseExperience)],
    ['Weight', formatWeight(pokemon.weight)],
    ['Height', formatHeight(pokemon.height)],
    ['Types', formatNameList(pokemon.types)],
    ['Abilities', formatNameList(pokemon.abilities)],
  ];
  return (
    <View style={styles.section}>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.aboutRow}>
          <Text style={[text.labelSmall, styles.aboutLabel]}>{label}</Text>
          <Text style={[text.body, styles.aboutValue]}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

/** Stats: name and value, with a bar out of 255 under it. */
export function StatsSection({ pokemon }: { pokemon: Pokemon }) {
  return (
    <View style={[styles.section, styles.statsGap]}>
      {pokemon.stats.map((stat) => (
        <View key={stat.name} accessible accessibilityLabel={`${statLabel(stat.name)} ${stat.value}`}>
          <View style={styles.statHead}>
            <Text style={text.labelSmall}>{statLabel(stat.name)}</Text>
            <Text style={text.body}>{stat.value}</Text>
          </View>
          <StatBar ratio={statRatio(stat.value)} />
        </View>
      ))}
    </View>
  );
}

/**
 * Animation 1 (#9): the bar fills from 0 to its value, so the eye reads the size of each stat
 * and, in Compare, who is ahead. Skipped when the phone asks for reduced motion.
 */
export function StatBar({ ratio, color = colors.purple }: { ratio: number; color?: string }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(withTiming(ratio, { duration: 600, easing: Easing.out(Easing.cubic) }));
  }, [progress, ratio]);
  const fill = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));

  return (
    <View style={styles.barTrack}>
      <Animated.View testID="stat-bar-fill" style={[styles.barFill, { backgroundColor: color }, fill]} />
    </View>
  );
}

type EvolutionProps = {
  currentId: number;
  rows: EvolutionRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onOpen: (id: number) => void;
};

/** Evolution: row-style Pokecards joined by a line; tap a stage to open it. */
export function EvolutionSection({ currentId, rows, isLoading, isError, onRetry, onOpen }: EvolutionProps) {
  if (isLoading) return <LoadingView message="Loading evolutions…" />;
  if (isError) return <ErrorView message="We couldn't load the evolution chain." onRetry={onRetry} />;
  if (rows.length <= 1) return <Text style={[text.body, styles.section]}>This Pokémon does not evolve.</Text>;

  return (
    <View style={styles.section}>
      {rows.map((row, index) => {
        const current = row.id === currentId;
        const name = formatPokemonName(row.name);
        return (
          <Fragment key={row.id}>
            {index > 0 ? <View style={styles.connector} /> : null}
            <Pressable
              onPress={() => onOpen(row.id)}
              disabled={current}
              accessibilityRole="button"
              accessibilityLabel={current ? `${name}, shown now` : `Open ${name}`}
              style={({ pressed }) => [styles.evoCard, current && styles.evoCurrent, pressed && styles.pressed]}>
              <View style={styles.evoImage}>
                <Image source={row.spriteUrl} style={styles.evoSprite} contentFit="contain" accessible={false} />
              </View>
              <View style={styles.evoText}>
                <View style={styles.numberLabel}>
                  <Text style={text.badge}>{formatPokemonNumber(row.id)}</Text>
                </View>
                <Text style={text.cardName}>{name}</Text>
              </View>
            </Pressable>
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row' },
  tab: { flex: 1, paddingTop: 5, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: colors.silver },
  tabActive: { borderBottomColor: colors.purple },
  tabLabel: { textAlign: 'center' },
  tabLabelInactive: { opacity: 0.5 },
  section: { paddingTop: spacing.xl, gap: spacing.l },
  aboutRow: { flexDirection: 'row', gap: spacing.l },
  aboutLabel: { width: 100 },
  aboutValue: { flex: 1 },
  statsGap: { gap: spacing.xl },
  statHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  barTrack: { height: 4, borderRadius: 2, backgroundColor: colors.silver, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
  connector: { width: 2, height: 14, marginLeft: 39, marginVertical: -spacing.l + spacing.xs, backgroundColor: colors.silver },
  evoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
    overflow: 'hidden',
    borderRadius: radius.card,
    backgroundColor: colors.white,
    ...softShadow,
  },
  evoCurrent: { borderWidth: 2, borderColor: colors.purple },
  pressed: { opacity: 0.85 },
  evoImage: { width: 80, height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardImage },
  evoSprite: { width: 64, height: 64 },
  evoText: { flex: 1, paddingHorizontal: spacing.l, gap: spacing.xs, alignItems: 'flex-start' },
  numberLabel: { paddingHorizontal: 6, paddingTop: spacing.xs, paddingBottom: 2, borderRadius: 4, backgroundColor: colors.purple },
});
