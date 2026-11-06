import { Image, StyleSheet } from 'react-native';

import { colors } from '@/theme';

/** The ⋮ of a Pokecard. With a `name`, it is the accessible trigger itself (iOS menu label). */
export function MoreIcon({ name }: { name?: string }) {
  return (
    <Image
      source={require('@/assets/icons/more.png')}
      style={styles.icon}
      tintColor={colors.midnight}
      accessible={name !== undefined}
      accessibilityRole={name !== undefined ? 'button' : undefined}
      accessibilityLabel={name !== undefined ? `Options for ${name}` : undefined}
    />
  );
}

const styles = StyleSheet.create({ icon: { width: 24, height: 24 } });
