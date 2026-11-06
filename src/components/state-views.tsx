import { ActivityIndicator, Image, type ImageSourcePropType, Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { makeStyles, radius, softShadow, spacing, useTheme } from '@/theme';
import { t } from '@/i18n';

/**
 * Loading, error and empty states. Not in Figma: designed in its style
 * (see mockups/01-theme.html).
 */

export function LoadingView({ message = t('loadingPokemon') }: { message?: string }) {
  const { colors } = useTheme();
  const styles = useStyles();
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
  message = t('errorDefault'),
  onRetry,
}: ErrorProps) {
  const { text } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.center}>
      <View style={styles.card}>
        <Text style={text.heading}>{t('somethingWrong')}</Text>
        <Text style={[text.body, styles.message]}>{message}</Text>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={t('tryAgain')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={[text.label, styles.buttonLabel]}>{t('tryAgain')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Outlined Poké Ball in Silver, for empty states and missing sprites. Decorative. */
export function PokeBallOutline({ size = 64, background }: { size?: number; background?: string }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const centerColor = background ?? colors.daylight;
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
          { width: center, height: center, borderRadius: center / 2, borderWidth: border, backgroundColor: centerColor },
        ]}
      />
    </View>
  );
}

type EmptyProps = {
  title: string;
  message?: string;
  /** Shown instead of the outlined Poké Ball (e.g. Snorlax on the empty Favorites tab). */
  image?: ImageSourcePropType;
  /** E.g. to sit higher than the vertical centre. */
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({ title, message, image, style }: EmptyProps) {
  const { text } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.center, style]}>
      {image ? (
        <Image testID="empty-image" source={image} style={styles.emptyImage} resizeMode="contain" accessible={false} />
      ) : (
        <PokeBallOutline />
      )}
      <Text style={text.heading}>{title}</Text>
      {message ? <Text style={[text.body, styles.message]}>{message}</Text> : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors, text }) =>
  StyleSheet.create({
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
  buttonLabel: { color: colors.onAccent },
  emptyImage: { width: 200, height: 200 },
  ball: { borderColor: colors.silver, alignItems: 'center', justifyContent: 'center' },
  ballLine: { position: 'absolute', backgroundColor: colors.silver },
  ballCenter: { borderColor: colors.silver },
}),
);
