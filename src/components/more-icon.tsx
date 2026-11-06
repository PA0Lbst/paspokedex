import { Image, StyleSheet } from 'react-native';

import { useTheme } from '@/theme';

/** The ⋮ of a Pokecard (Figma icon), for the Android menu trigger. */
export function MoreIcon() {
  const { colors } = useTheme();
  return <Image source={require('@/assets/icons/more.png')} style={styles.icon} tintColor={colors.midnight} />;
}

const styles = StyleSheet.create({ icon: { width: 24, height: 24 } });
