import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PokemonSummary } from '@/services/pokeapi-types';
import { colors, radius, softShadow, spacing, text } from '@/theme';
import { formatPokemonName, formatPokemonNumber } from '@/utils/format';

import { PokeBallOutline } from './state-views';

type Props = {
  pokemon: PokemonSummary;
  onPress: (pokemon: PokemonSummary) => void;
};

/** Figma "Pokecard": sprite on a light square, Purple number label, name. */
export function PokemonCard({ pokemon, onPress }: Props) {
  const [spriteFailed, setSpriteFailed] = useState(false);
  const name = formatPokemonName(pokemon.name);
  const number = formatPokemonNumber(pokemon.id);

  return (
    <Pressable
      onPress={() => onPress(pokemon)}
      accessibilityRole="button"
      accessibilityLabel={`${name}, number ${number}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageBox}>
        {spriteFailed ? (
          <PokeBallOutline size={48} background={colors.cardImage} />
        ) : (
          <Image
            testID="pokemon-sprite"
            source={pokemon.spriteUrl}
            style={styles.sprite}
            contentFit="contain"
            transition={150}
            onError={() => setSpriteFailed(true)}
            accessible={false}
          />
        )}
        <View style={styles.numberLabel}>
          <Text style={text.badge}>{number}</Text>
        </View>
      </View>
      <Text style={[text.cardName, styles.name]} numberOfLines={1}>
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radius.card,
    backgroundColor: colors.white,
    ...softShadow,
  },
  pressed: { opacity: 0.85 },
  imageBox: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardImage,
  },
  sprite: { width: '85%', height: '85%' },
  numberLabel: {
    position: 'absolute',
    top: spacing.s,
    left: spacing.s,
    paddingHorizontal: 6,
    paddingTop: spacing.xs,
    paddingBottom: 2,
    borderRadius: 4,
    backgroundColor: colors.purple,
  },
  name: { padding: spacing.m },
});
