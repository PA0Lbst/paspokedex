import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatBar } from '@/components/pokemon-detail-sections';
import { PokemonPicker } from '@/components/pokemon-picker';
import { ScreenHeader } from '@/components/screen-header';
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
    <View style={styles.screen}>
      <ScreenHeader title="Compare" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.slots}>
          <SlotCard label="First" pokemon={compare.first} hasId={ids.first !== null} onPress={() => setPicking('first')} />
          <Text style={[text.label, styles.vs]}>VS</Text>
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
    </View>
  );
}

function summary(first: Pokemon, second: Pokemon, wins: { first: number; second: number }): string {
  if (wins.first === wins.second) return 'A close match: as many stats each.';
  const [winner, count] = wins.first > wins.second ? [first, wins.first] : [second, wins.second];
  return `${formatPokemonName(winner.name)} is stronger on ${count} of ${first.stats.length} stats`;
}

/** A Figma Pokecard for one side; empty, it invites to pick a Pokémon. Both sides keep the same size. */
function SlotCard({ label, pokemon, hasId, onPress }: { label: string; pokemon?: Pokemon; hasId: boolean; onPress: () => void }) {
  const name = pokemon ? formatPokemonName(pokemon.name) : null;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name ? `${label} Pokémon: ${name}. Change` : `Pick the ${label.toLowerCase()} Pokémon`}
      style={({ pressed }) => [styles.slot, pressed && styles.pressed]}>
      <View style={styles.slotImage}>
        {pokemon ? (
          <Image source={pokemon.spriteUrl} style={styles.slotSprite} contentFit="contain" accessible={false} />
        ) : (
          <View style={styles.plusCircle}>
            <Text style={[text.title, styles.plus]}>{hasId ? '…' : '+'}</Text>
          </View>
        )}
        {pokemon ? (
          <View style={styles.numberLabel}>
            <Text style={text.badge}>{formatPokemonNumber(pokemon.id)}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.slotFooter}>
        <Text style={[text.cardName, !pokemon && styles.pickLabel]} numberOfLines={1}>
          {name ?? 'Pick a Pokémon'}
        </Text>
        <Text style={[text.body, styles.change]}>{pokemon ? 'Tap to change' : ' '}</Text>
      </View>
    </Pressable>
  );
}

/** The stronger side in Purple; the other one still visible on the Silver track. */
const sideColor = (winner: Winner, side: Slot) => (winner === side ? colors.purple : colors.midnightFaint);

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
          <Text style={[text.body, styles.value, row.winner === 'first' && styles.strong]}>{row.first}</Text>
          <View style={styles.mirror}>
            <StatBar ratio={statRatio(row.first, max)} color={sideColor(row.winner, 'first')} />
          </View>
        </View>
        <View style={styles.side}>
          <View style={styles.bar}>
            <StatBar ratio={statRatio(row.second, max)} color={sideColor(row.winner, 'second')} />
          </View>
          <Text style={[text.body, styles.value, styles.valueRight, row.winner === 'second' && styles.strong]}>{row.second}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.daylight },
  scroll: { flex: 1 },
  content: { padding: spacing.xl, gap: spacing.xl },
  slots: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
  vs: { color: colors.purple },
  slot: { flex: 1, overflow: 'hidden', borderRadius: radius.card, backgroundColor: colors.white, ...softShadow },
  pressed: { opacity: 0.85 },
  slotImage: { width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardImage },
  slotSprite: { width: '85%', height: '85%' },
  plusCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.purple, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  plus: { color: colors.purple, lineHeight: 32 },
  numberLabel: { position: 'absolute', top: spacing.s, left: spacing.s, paddingHorizontal: 6, paddingTop: spacing.xs, paddingBottom: 2, borderRadius: 4, backgroundColor: colors.purple },
  slotFooter: { padding: spacing.m, gap: 2 },
  pickLabel: { color: colors.purple },
  change: { fontSize: 12 },
  hint: { textAlign: 'center' },
  card: { gap: spacing.l, padding: spacing.xl, borderRadius: radius.card, backgroundColor: colors.white, ...softShadow },
  summary: { textAlign: 'center' },
  row: { gap: spacing.s },
  rowLabel: { textAlign: 'center' },
  rowSides: { flexDirection: 'row', gap: spacing.m },
  side: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  mirror: { flex: 1, transform: [{ scaleX: -1 }] },
  bar: { flex: 1 },
  // Same width for 2 and 3 digits, so every bar starts at the same place.
  value: { width: 32 },
  valueRight: { textAlign: 'right' },
  strong: { fontFamily: text.labelSmall.fontFamily, color: colors.purple },
});
