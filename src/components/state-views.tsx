import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, softShadow, spacing, text } from '@/theme';

/**
 * Loading, error and empty states. Not in Figma: designed in its style
 * (see mockups/01-theme.html).
 */

export function LoadingView({ message = 'Loading Pokémon…' }: { message?: string }) {
  return (
    <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={colors.purple} />
      <Text style={styles.muted}>{message}</Text>
    </View>
  );
}

type ErrorProps = {
  message?: string;
  onRetry: () => void;
};

export function ErrorView({
  message = "We couldn't load the Pokémon. Check your connection and try again.",
  onRetry,
}: ErrorProps) {
  return (
    <View style={styles.center}>
      <View style={styles.card}>
        <Text style={text.heading}>Something went wrong</Text>
        <Text style={[text.body, styles.message]}>{message}</Text>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Try again"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={[text.label, styles.buttonLabel]}>Try again</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Outlined Poké Ball in Silver, for empty states and missing sprites. Decorative. */
export function PokeBallOutline({ size = 64, background = colors.daylight }: { size?: number; background?: string }) {
  const border = size / 16;
  const center = (size * 3) / 8;
  return (
    <View
      testID="poke-ball-outline"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.ball, { width: size, height: size, borderRadius: size / 2, borderWidth: border }]}>
      <View style={[styles.ballLine, { height: border, left: -border, right: -border }]} />
      <View
        style={[
          styles.ballCenter,
          { width: center, height: center, borderRadius: center / 2, borderWidth: border, backgroundColor: background },
        ]}
      />
    </View>
  );
}

type EmptyProps = {
  title: string;
  message?: string;
};

export function EmptyState({ title, message }: EmptyProps) {
  return (
    <View style={styles.center}>
      <PokeBallOutline />
      <Text style={text.heading}>{title}</Text>
      {message ? <Text style={[text.body, styles.message]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.m,
    padding: spacing.xl,
  },
  muted: { ...text.cardName, opacity: 0.6 },
  card: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.s,
    paddingVertical: spacing.xl,
    paddingHorizontal: 20,
    borderRadius: radius.card,
    backgroundColor: colors.white,
    ...softShadow,
  },
  message: { textAlign: 'center', maxWidth: 260, marginBottom: spacing.s },
  button: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.card,
    backgroundColor: colors.purple,
  },
  pressed: { opacity: 0.8 },
  buttonLabel: { color: colors.white },
  ball: { borderColor: colors.silver, alignItems: 'center', justifyContent: 'center' },
  ballLine: { position: 'absolute', backgroundColor: colors.silver },
  ballCenter: { borderColor: colors.silver },
});
