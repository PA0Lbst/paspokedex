import { Image } from 'expo-image';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePokemonIndex } from '@/hooks/use-pokemon-index';
import type { PokemonSummary } from '@/services/pokeapi-types';
import { colors, radius, softShadow, spacing, text } from '@/theme';
import { formatPokemonName, formatPokemonNumber } from '@/utils/format';
import { searchPokemon } from '@/utils/search';

import { SearchField } from './search-field';
import { EmptyState, ErrorView, LoadingView } from './state-views';

type Props = {
  visible: boolean;
  onPick: (pokemon: PokemonSummary) => void;
  onClose: () => void;
};

/** Full-screen picker for Compare: search over the stored index of every Pokémon (#5). */
export function PokemonPicker({ visible, onPick, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const index = usePokemonIndex();
  const [query, setQuery] = useState('');
  const results = searchPokemon(index.items, query);

  const close = () => {
    setQuery('');
    onClose();
  };

  let body;
  if (index.isLoading) body = <LoadingView />;
  else if (index.isError) body = <ErrorView onRetry={index.retry} />;
  else if (query.trim() === '') body = <EmptyState title="Pick a Pokémon" message="Type part of its name or its number." />;
  else if (results.length === 0) body = <EmptyState title={`No Pokémon found for “${query.trim()}”`} />;
  else {
    body = (
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              setQuery('');
              onPick(item);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Pick ${formatPokemonName(item.name)}`}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={styles.rowImage}>
              <Image source={item.spriteUrl} style={styles.sprite} contentFit="contain" accessible={false} />
            </View>
            <Text style={[text.body, styles.rowNumber]}>{formatPokemonNumber(item.id)}</Text>
            <Text style={text.cardName}>{formatPokemonName(item.name)}</Text>
          </Pressable>
        )}
      />
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View style={[styles.screen, { paddingTop: insets.top + spacing.l }]}>
        <View style={styles.head}>
          <Text style={text.title}>Choose a Pokémon</Text>
          <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Cancel" hitSlop={spacing.s}>
            <Text style={[text.label, styles.cancel]}>Cancel</Text>
          </Pressable>
        </View>
        <View style={styles.field}>
          <SearchField value={query} onChangeText={setQuery} onClear={close} />
        </View>
        {body}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.daylight },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl },
  cancel: { color: colors.purple },
  field: { padding: spacing.l },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.m },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.m, borderRadius: radius.card, backgroundColor: colors.white, overflow: 'hidden', ...softShadow },
  pressed: { opacity: 0.85 },
  rowImage: { width: 56, height: 56, backgroundColor: colors.cardImage, alignItems: 'center', justifyContent: 'center' },
  sprite: { width: 48, height: 48 },
  rowNumber: { width: 44 },
});
