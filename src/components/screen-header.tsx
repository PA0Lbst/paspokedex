import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts, makeStyles, spacing, useTheme } from '@/theme';
import { t } from '@/i18n';

type Props = {
  /** Centred title; hidden until `showTitle` (Figma "Detail - scroll"). */
  title?: string;
  showTitle?: boolean;
  right?: ReactNode;
};

/**
 * The Figma Detail header, drawn by us instead of the native one: iOS 26 puts native
 * header buttons in glass capsules, which Figma doesn't have. iOS: chevron + "Back";
 * Android: the Figma back arrow.
 */
export function ScreenHeader({ title, showTitle = true, right }: Props) {
  const { colors, text } = useTheme();
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const ios = Platform.OS === 'ios';

  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          hitSlop={spacing.s}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          {ios ? (
            <SymbolView name="chevron.left" size={22} weight="semibold" tintColor={colors.midnight} />
          ) : (
            <Image source={require('@/assets/icons/back.png')} style={styles.icon} tintColor={colors.midnight} />
          )}
          {ios ? <Text style={styles.backLabel}>{t('back')}</Text> : null}
        </Pressable>
        <Text style={[text.labelSmall, styles.title, !showTitle && styles.hidden]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors }) =>
  StyleSheet.create({
  bar: { backgroundColor: colors.daylight, zIndex: 2 },
  row: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.l },
  back: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 80 },
  pressed: { opacity: 0.6 },
  icon: { width: 24, height: 24 },
  backLabel: { fontFamily: fonts.regular, fontSize: 17, color: colors.midnight },
  title: { flex: 1, textAlign: 'center', fontSize: 16 },
  hidden: { opacity: 0 },
  right: { minWidth: 80, alignItems: 'flex-end' },
}),
);
