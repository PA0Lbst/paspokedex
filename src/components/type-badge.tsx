import { StyleSheet, Text, View } from 'react-native';

import { getTypeColor, makeStyles, radius, spacing, useTheme } from '@/theme';
import { t, typeName } from '@/i18n';

type Props = {
  /** Type name as the API gives it, e.g. "grass". */
  type: string;
};

export function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Figma "Type": a neutral pill with a dot in the type colour. */
export function TypeBadge({ type }: Props) {
  const { text } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.badge} accessibilityLabel={t('typeLabel', { type: typeName(type) })}>
      <View testID="type-dot" style={[styles.dot, { backgroundColor: getTypeColor(type) }]} />
      <Text style={text.label}>{typeName(type)}</Text>
    </View>
  );
}

const useStyles = makeStyles(({ colors }) =>
  StyleSheet.create({
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
}),
);
