import { Image } from 'expo-image';
import { type ComponentRef, useRef, useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, fieldShadow, radius, spacing, text } from '@/theme';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  /** Android back arrow: clear the search and leave the field. */
  onClear: () => void;
};

const ICON_SIZE = 24;

/**
 * Figma search field (Home and Search frames). On Android the search icon becomes a
 * back arrow while the field is focused or has text, as in the Android Search frame.
 */
export function SearchField({ value, onChangeText, onClear }: Props) {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  const showBack = Platform.OS === 'android' && (focused || value !== '');

  const leave = () => {
    onClear();
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  return (
    <View style={styles.field}>
      {showBack ? (
        <Pressable
          onPress={leave}
          accessibilityRole="button"
          accessibilityLabel="Close search"
          hitSlop={spacing.m}
          style={({ pressed }) => pressed && styles.pressed}>
          {/* TODO(#5): placeholder arrow; replace with the Figma "Back" icon export. */}
          <Image source={require('@/assets/icons/back.png')} style={styles.icon} tintColor={colors.midnight} />
        </Pressable>
      ) : (
        <Image
          testID="search-icon"
          source={require('@/assets/icons/search.png')}
          style={styles.icon}
          tintColor={colors.midnight}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      )}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSubmitEditing={() => Keyboard.dismiss()}
        placeholder="Search for Pokémon.."
        placeholderTextColor={colors.midnightFaint}
        accessibilityLabel="Search for Pokémon"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        style={[text.input, styles.input]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radius.card,
    backgroundColor: colors.white,
    ...fieldShadow,
  },
  icon: { width: ICON_SIZE, height: ICON_SIZE },
  // Figma: 19 px text line inside a 24 px row; padding 0 keeps the field at 48 like Figma.
  input: { flex: 1, padding: 0, minHeight: ICON_SIZE },
  pressed: { opacity: 0.6 },
});
