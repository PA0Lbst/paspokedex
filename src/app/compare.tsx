import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatBar } from '@/components/pokemon-detail-sections';
import { PokemonPicker } from '@/components/pokemon-picker';
import { ErrorView, LoadingView } from '@/components/state-views';
import { useCompare } from '@/hooks/use-compare';
import { getErrorMessage } from '@/services/api-error';
import type { Pokemon } from '@/services/pokeapi-types';
import { colors, radius, softShadow, spacing, text } from '@/theme';
import type { CompareRow, Winner } from '@/utils/compare';
import { formatPokemonName, formatPokemonNumber } from '@/utils/format';
import { MAX_STAT, statRatio } from '@/utils/pokemon-detail';

type Slot = 'first' | 'second';

function parseId(value: string | undefined): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Compare two Pokémon stat by stat (specs/features/compare.md). Not in Figma: built in its Detail style. */
export default function CompareScreen() {
  const params = useLocalSearchParams<{ first?: string; second?: string }>();
  const [ids, setIds] = useState<Record<Slot, number | null>>({
    first: parseId(params.first),
    second: parseId(params.second),
  });
  const [picking, setPicking] = useState<Slot | null>(null);
  const compare = useCompare(ids.first, ids.second);

  let result = null;
  if (ids.first === null || ids.second === null) {
    result = <Text style={[text.body, styles.hint]}>Pick two Pokémon to see who is stronger on each stat.</Text>;
  } else if (compare.isError) {
    result = <ErrorView message={getErrorMessage(compare.error)} onRetry={compare.retry} />;
  } else if (compare.isLoading || !compare.comparison || !compare.first || !compare.second) {
    result = <LoadingView />;
  } else {
    const { comparison, first, second } = compare;
    result = (
      <View style={styles.card}>
        <Text style={[text.heading, styles.summary]}>{summary(first, second, comparison.wins)}</Text>
        {comparison.rows.map((row) => (
          <StatRow key={row.name} row={row} />
        ))}
        <StatRow
          row={{ name: 'total', label: 'Total', ...comparison.total }}
          max={Math.max(comparison.total.first, comparison.total.second)}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.slots}>
        <SlotCard label="First" pokemon={compare.first} hasId={ids.first !== null} onPress={() => setPicking('first')} />
        <Text style={[text.title, styles.vs]}>vs</Text>
        <SlotCard label="Second" pokemon={compare.second} hasId={ids.second !== null} onPress={() => setPicking('second')} />
      </View>
      {result}
      <PokemonPicker
        visible={picking !== null}
        onClose={() => setPicking(null)}
        onPick={(pokemon) => {
          if (picking) setIds((current) => ({ ...current, [picking]: pokemon.id }));
          setPicking(null);
        }}
      />
    </ScrollView>
  );
}

function summary(first: Pokemon, second: Pokemon, wins: { first: number; second: number }): string {
  if (wins.first === wins.second) return 'A close match: as many stats each.';
  const [winner, count] = wins.first > wins.second ? [first, wins.first] : [second, wins.second];
  return `${formatPokemonName(winner.name)} is stronger on ${count} of ${first.stats.length} stats`;
}

function SlotCard({ label, pokemon, hasId, onPress }: { label: string; pokemon?: Pokemon; hasId: boolean; onPress: () => void }) {
  const name = pokemon ? formatPokemonName(pokemon.name) : null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name ? `${label} Pokémon: ${name}. Change` : `Pick the ${label.toLowerCase()} Pokémon`}
      style={({ pressed }) => [styles.slot, pressed && styles.pressed]}>
      <View style={styles.slotImage}>
        {pokemon ? <Image source={pokemon.spriteUrl} style={styles.slotSprite} contentFit="contain" accessible={false} /> : null}
        {!pokemon ? <Text style={[text.title, styles.plus]}>{hasId ? '…' : '+'}</Text> : null}
      </View>
      <Text style={[text.cardName, styles.slotName]} numberOfLines={1}>
        {name ?? `Pick ${label.toLowerCase()}`}
      </Text>
      {pokemon ? <Text style={text.body}>#{formatPokemonNumber(pokemon.id)}</Text> : null}
    </Pressable>
  );
}

const sideColor = (winner: Winner, side: Slot) => (winner === side ? colors.purple : colors.silver);

/** One stat: value and bar on each side, the stronger side in Purple. */
function StatRow({ row, max = MAX_STAT }: { row: CompareRow; max?: number }) {
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${row.label}: ${row.first} against ${row.second}${row.winner === 'tie' ? ', a tie' : ''}`}>
      <Text style={[text.labelSmall, styles.rowLabel]}>{row.label}</Text>
      <View style={styles.rowSides}>
        <View style={styles.side}>
          <Text style={[text.body, row.winner === 'first' && styles.strong]}>{row.first}</Text>
          <View style={styles.mirror}>
            <StatBar ratio={statRatio(row.first, max)} color={sideColor(row.winner, 'first')} />
          </View>
        </View>
        <View style={styles.side}>
          <StatBar ratio={statRatio(row.second, max)} color={sideColor(row.winner, 'second')} />
          <Text style={[text.body, row.winner === 'second' && styles.strong]}>{row.second}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.daylight },
  content: { padding: spacing.xl, gap: spacing.xl },
  slots: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
  vs: { color: colors.midnightFaint },
  slot: { flex: 1, alignItems: 'center', gap: spacing.xs, paddingBottom: spacing.m, borderRadius: radius.card, backgroundColor: colors.white, overflow: 'hidden', ...softShadow },
  pressed: { opacity: 0.85 },
  slotImage: { alignSelf: 'stretch', aspectRatio: 1.4, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardImage, marginBottom: spacing.s },
  slotSprite: { width: '70%', height: '90%' },
  plus: { color: colors.purple },
  slotName: { paddingHorizontal: spacing.s },
  hint: { textAlign: 'center' },
  card: { gap: spacing.l, padding: spacing.xl, borderRadius: radius.card, backgroundColor: colors.white, ...softShadow },
  summary: { textAlign: 'center' },
  row: { gap: spacing.s },
  rowLabel: { textAlign: 'center' },
  rowSides: { flexDirection: 'row', gap: spacing.m },
  side: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  mirror: { flex: 1, transform: [{ scaleX: -1 }] },
  strong: { fontFamily: text.labelSmall.fontFamily, color: colors.purple },
});
