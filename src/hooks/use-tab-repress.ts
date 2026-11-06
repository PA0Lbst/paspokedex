import { useNavigation } from 'expo-router';
import { useEffect } from 'react';

/** The part of the NativeTabs navigation this hook uses (the event map type isn't exported). */
type TabNavigation = {
  isFocused: () => boolean;
  addListener: (event: 'tabPress', callback: () => void) => () => void;
};

/**
 * Calls `onRePress` when the user presses the tab they are already on (the usual
 * "tap the active tab to reset" pattern). A press that switches to this tab from
 * another one does nothing: `tabPress` fires before the switch, so the tab isn't focused yet.
 */
export function useTabRePress(onRePress: () => void) {
  const navigation = useNavigation<TabNavigation>();

  useEffect(
    () =>
      navigation.addListener('tabPress', () => {
        if (navigation.isFocused()) onRePress();
      }),
    [navigation, onRePress],
  );
}
