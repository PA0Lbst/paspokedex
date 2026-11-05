import { StyleSheet, Text, View } from 'react-native';

import { colors, getTypeColor, radius, spacing, text } from '@/theme';

type Props = {
  /** Type name as the API gives it, e.g. "grass". */
  type: string;
};

export function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Figma "Type": a neutral pill with a dot in the type colour. */
export function TypeBadge({ type }: Props) {
  return (
    <View style={styles.badge} accessibilityLabel={`Type ${capitalize(type)}`}>
      <View testID="type-dot" style={[styles.dot, { backgroundColor: getTypeColor(type) }]} />
      <Text style={text.label}>{capitalize(type)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.s,
    paddingLeft: spacing.m,
    paddingRight: 14,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.chip,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
