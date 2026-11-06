# Architecture

What exists in the app today. Update this file whenever an issue changes the structure.

## Stack

- **Expo SDK 58**, React Native 0.88, React 19.3, TypeScript 6 (strict).
- **Expo Router** with file-based routes in `src/app/`. Typed routes and the React Compiler are on (`app.json` → `experiments`).
- **Platforms:** iOS and Android only. No web.
- **Lint:** ESLint 9 with `eslint-config-expo` (`eslint.config.js`).
- **Path aliases:** `@/*` → `src/*`, `@/assets/*` → `assets/*`.

## Structure

```
src/app/
  _layout.tsx          Root Stack: QueryClient, fonts, splash screen
  (tabs)/_layout.tsx   Native bottom tabs (Pokémons, Favorites)
  (tabs)/index.tsx     Pokémons tab: search field (#5) above the grid (#4)
  (tabs)/favorites.tsx Favorites tab, from SQLite (#7)
  pokemon/[id].tsx     Detail, pushed over the tabs (#6)
  compare.tsx          Compare two Pokémon (#8)
  options/[id].tsx     Options sheet of a card's ⋮ (#22), a native formSheet
src/test-utils/  Query wrapper, fake list pages and in-memory fake database for tests
src/theme/       Light/dark palettes, useTheme, makeStyles, type colours, spacing, typography
src/i18n/        English and French strings, type names (follows the phone)
src/hooks/       use-app-fonts.ts (Rubik), use-pokemon-list.ts, use-pokemon-index.ts, use-pokemon-search.ts, use-debounced-value.ts, use-tab-repress.ts, use-two-press-reset.ts
src/components/  type-badge.tsx, state-views.tsx, pokemon-card.tsx, pokemon-grid.tsx, search-field.tsx
src/services/    PokeAPI client, JSON readers, ApiError, QueryClient, SQLite database, search index + __tests__/
src/utils/       Pure helpers (format.ts, search.ts) + __tests__/
src/__tests__/screens/  Screen tests (kept out of src/app/)
assets/
  expo.icon/     iOS app icon (still the Expo default)
  images/        Splash logo, Snorlax (empty favorites), app and Android icons (Expo defaults)
assets/fonts/    Rubik (all weights), from the course fonts.zip
assets/icons/    Figma icons as PNG (@1x/@2x/@3x); figma/ holds the SVG sources
mockups/         HTML mockups shown before each UI issue
docs/              All the project documentation, for the teacher
  product.md       What the app is, data, technical choices, checklists
  features/        One spec per feature (list, search, detail, favorites, share, compare)
  explanation.md   Hand-in explanation
  architecture.md  This file
  backlog.md       Issues and tracking order
  chat-history/    Exported agent conversations
templates/         Course templates (reference)
```

Non-route code (components, hooks, services) goes in folders next to `src/app/`, never inside it.

## Navigation

A root Stack holds the tab group and the screens pushed over it. Two tabs, as in Figma: **Pokémons** (`index`) and **Favorites** (`favorites`), with `NativeTabs` from `expo-router/native-tabs`. Tapping a card pushes `pokemon/[id]`. The tab icons are the Figma Pokémon and Favorite icons (PNG), Midnight by default and Purple when selected.

Pressing the tab you are already on resets that tab's screen (`useTabRePress`): on Pokémons the first press scrolls to the top and the second clears the search (`useTwoPressReset`). The native iOS scroll-to-top is turned off on that trigger.

## Storage

One SQLite database, `paspokedex.db` (`src/services/database.ts`), opened once and migrated with `PRAGMA user_version`. Version 1: `pokemon_index(id, name)` and `meta(key, value)` for the search index and its download date (#5). Favorites (#7) add the next migration step. API data other than the index is cached only in memory by TanStack Query.

## Checks

| Command | Status |
|---|---|
| `npx expo lint` | passes |
| `npx tsc --noEmit` | passes |
| `npx expo-doctor` | 20/20 |
| `npm test` | passes (Jest + RNTL, #3) |
| CI | GitHub Actions: lint, tsc, tests on every push (#18) |

## Decisions

Technical choices live in [docs/product.md](../docs/product.md) → "Technical choices".
