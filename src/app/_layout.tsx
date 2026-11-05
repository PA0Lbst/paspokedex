import { NativeTabs } from 'expo-router/native-tabs';

// Placeholder icons (system symbols) until #1 brings in the Figma icons.
export default function RootLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Pokémons</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="square.grid.2x2" md="grid_view" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="favorites">
        <NativeTabs.Trigger.Label>Favorites</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="heart" md="favorite" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
