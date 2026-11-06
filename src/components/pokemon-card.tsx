import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';


import type { PokemonSummary } from '@/services/pokeapi-types';
import { colors, radius, softShadow, spacing, text } from '@/theme';
import { formatPokemonName, formatPokemonNumber } from '@/utils/format';

import { MENU_SIZE } from './menu-size';
import { MoreIcon } from './more-icon';
import { PokeBallOutline } from './state-views';

type Props = {
  pokemon: PokemonSummary;
  onPress: (pokemon: PokemonSummary) => void;
  /** The ⋮ button (#22), shown only when given: opens the Options sheet. */
  onMore?: (pokemon: PokemonSummary) => void;
};

/** Figma "Pokecard": sprite on a light square, Purple number label, name. */
export function PokemonCard({ pokemon, onPress, onMore }: Props) {
  const [spriteFailed, setSpriteFailed] = useState(false);
  const name = formatPokemonName(pokemon.name);
  const number = formatPokemonNumber(pokemon.id);

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => onPress(pokemon)}
        accessibilityRole="button"
        accessibilityLabel={`${name}, number ${number}`}
        style={({ pressed }) => pressed && styles.pressed}>
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
        <View style={styles.footer}>
          <Text style={[text.cardName, styles.name]} numberOfLines={1}>
            {name}
          </Text>
          {/* Keeps room for the ⋮ button, which sits on top of the card. */}
          {onMore ? <View style={styles.menuSpace} /> : null}
        </View>
      </Pressable>
      {onMore ? (
        <Pressable
          onPress={() => onMore(pokemon)}
          hitSlop={spacing.xs}
          accessibilityRole="button"
          accessibilityLabel={`Options for ${name}`}
          style={({ pressed }) => [styles.menu, pressed && styles.pressed]}>
          <MoreIcon />
        </Pressable>
      ) : null}
    </View>
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
  footer: { flexDirection: 'row', alignItems: 'center', padding: spacing.m, gap: spacing.xs },
  name: { flex: 1 },
  menuSpace: { width: MENU_SIZE - spacing.s },
  // Bottom right of the footer: 12 padding + 19 line → 43 high; the 32 pt menu is centred in it.
  menu: {
    position: 'absolute',
    right: spacing.xs,
    bottom: (43 - MENU_SIZE) / 2,
    width: MENU_SIZE,
    height: MENU_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
