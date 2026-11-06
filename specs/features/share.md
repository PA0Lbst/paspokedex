# Card options and share

Issue: #22

## Goal

From any card, open the Figma Options sheet to open the Pokémon, add or remove it from favorites, or share it with a friend.

## Constraints

- ⋮ button on `PokemonCard` (`onMore`), on Home, search results and Favorites.
- Sheet `src/components/pokemon-options-sheet.tsx` in a transparent `Modal`; opened through `usePokemonOptions` (`src/hooks/use-pokemon-options.tsx`).
- Share is the native feature: React Native `Share.share`, the system share sheet, which works in Expo Go. Text from `buildShareMessage` (`src/utils/share.ts`).

## Acceptance Criteria

- [ ] ⋮ opens the sheet with "Open Pokémon", "Add to favorites" (or "Remove from favorites") and "Share", plus Cancel on iOS.
- [ ] Open Pokémon opens the detail; the favorite option changes the favorite.
- [ ] Share opens the native share sheet with "Pikachu #025 on paspokedex: <link>".
- [ ] Tapping outside, Cancel or the Android back button closes it.

## Out of Scope

- Sharing an image of the card.

## Decisions

- **React Native `Share`, not `expo-sharing`**: `expo-sharing` shares files; we share text, which every chat app accepts.
- **The favorite option says "Remove from favorites"** when it already is one, instead of a label that does nothing.
