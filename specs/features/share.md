# Card options and share

Issue: #22

## Goal

From any card, open the Figma Options sheet to open the Pokémon, add or remove it from favorites, or share it with a friend.

## Constraints

- ⋮ button on `PokemonCard` (`onMore`), on Home, search results and Favorites.
- The ⋮ opens the system's own dialog: on iOS the SwiftUI `ConfirmationDialog` (`@expo/ui`, in Expo Go), anchored to a strip at the bottom of the screen so iOS 26 shows it rising from the bottom, with the system Cancel; on Android a native `Alert`. Drawn by the system, so no Figma icons or Rubik: accepted for a native sheet. Options from `usePokemonOptions`.
- Share is the native feature: React Native `Share.share`, the system share sheet, which works in Expo Go. Text from `buildShareMessage` (`src/utils/share.ts`).

## Acceptance Criteria

- [ ] ⋮ opens the system sheet from the bottom with "Open Pokémon", "Add to favorites" (or "Remove from favorites") and "Share", plus Cancel on iOS.
- [ ] Open Pokémon opens the detail; the favorite option changes the favorite.
- [ ] Share opens the native share sheet with "Pikachu #025 on paspokedex: <link>".
- [ ] Cancel (iOS), swiping it down, tapping outside or the Android back button closes it.

## Out of Scope

- Sharing an image of the card.

## Decisions

- **The system sheet, after four tries**: a JS Modal sheet and a formSheet with our rows looked like Figma but weren't native; `ActionSheetIOS` showed in the middle (React Native presents it as a popover, centred by iOS 26); a SwiftUI `Menu` opened at the button. The SwiftUI confirmation dialog anchored at the bottom is drawn by iOS and rises from the bottom. Native wins over the Figma icons.

- **React Native `Share`, not `expo-sharing`**: `expo-sharing` shares files; we share text, which every chat app accepts.
- **The favorite option says "Remove from favorites"** when it already is one, instead of a label that does nothing.
