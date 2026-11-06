# Card options and share

Issue: #22

## Goal

From any card, open the Figma Options sheet to open the Pokémon, add or remove it from favorites, or share it with a friend.

## Constraints

- ⋮ button on `PokemonCard` (`onMore`), on Home, search results and Favorites.
- The ⋮ opens route `src/app/options/[id].tsx` as a native bottom sheet (Stack `formSheet`, fits its content, grabber, swipe down to close). Its rows are the Figma Options: icon in system blue, label, separators, and Cancel on iOS. Actions from `usePokemonActions` (`src/hooks/use-pokemon-options.tsx`).
- Share is the native feature: React Native `Share.share`, the system share sheet, which works in Expo Go. Text from `buildShareMessage` (`src/utils/share.ts`).

## Acceptance Criteria

- [ ] ⋮ opens the native bottom sheet with "Open Pokémon", "Add to favorites" (or "Remove from favorites") and "Share", plus Cancel on iOS.
- [ ] Open Pokémon opens the detail; the favorite option changes the favorite.
- [ ] Share opens the native share sheet with "Pikachu #025 on paspokedex: <link>".
- [ ] Cancel (iOS), swiping it down, tapping outside or the Android back button closes it.

## Out of Scope

- Sharing an image of the card.

## Decisions

- **A native bottom sheet, after three tries**: a JS Modal sheet didn't feel native; `ActionSheetIOS` had the old alert style and no icons; a SwiftUI `Menu` opened at the button. The user wanted the sheet that rises from the bottom, as in Figma, so the options are a Stack `formSheet` route: native presentation, Figma rows and icons.

- **React Native `Share`, not `expo-sharing`**: `expo-sharing` shares files; we share text, which every chat app accepts.
- **The favorite option says "Remove from favorites"** when it already is one, instead of a label that does nothing.
