# Card options and share

Issue: #22

## Goal

From any card, open the Figma Options sheet to open the Pokémon, add or remove it from favorites, or share it with a friend.

## Constraints

- ⋮ button on `PokemonCard` (`onMore`), on Home, search results and Favorites.
- The menu is the system's own, opened by `usePokemonOptions` (`src/hooks/use-pokemon-options.tsx`): the iOS action sheet (`ActionSheetIOS`, with Cancel) and a native dialog on Android (`Alert`; React Native has no Android action sheet).
- Share is the native feature: React Native `Share.share`, the system share sheet, which works in Expo Go. Text from `buildShareMessage` (`src/utils/share.ts`).

## Acceptance Criteria

- [ ] ⋮ opens the native menu with "Open Pokémon", "Add to favorites" (or "Remove from favorites") and "Share", plus Cancel on iOS.
- [ ] Open Pokémon opens the detail; the favorite option changes the favorite.
- [ ] Share opens the native share sheet with "Pikachu #025 on paspokedex: <link>".
- [ ] Cancel (iOS), tapping outside or the Android back button closes it.

## Out of Scope

- Sharing an image of the card.

## Decisions

- **A native menu, not a JS sheet**: the first version drew the Figma sheet in a Modal; on the phone it didn't feel native, so it became the system menu. The system menu shows no icons, unlike Figma.

- **React Native `Share`, not `expo-sharing`**: `expo-sharing` shares files; we share text, which every chat app accepts.
- **The favorite option says "Remove from favorites"** when it already is one, instead of a label that does nothing.
