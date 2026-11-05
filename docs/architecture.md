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
  (tabs)/index.tsx     Pokémons tab: the grid (#4)
  (tabs)/favorites.tsx Favorites tab (placeholder, built in #7)
  pokemon/[id].tsx     Detail, pushed over the tabs (placeholder, built in #6)
src/test-utils/  Query wrapper and fake list pages for tests
src/theme/       Colours, type colours, spacing, typography (Figma tokens)
src/hooks/       use-app-fonts.ts (Rubik), use-pokemon-list.ts
src/components/  type-badge.tsx, state-views.tsx, pokemon-card.tsx, pokemon-grid.tsx
src/services/    PokeAPI client, JSON readers, ApiError, QueryClient + __tests__/
src/utils/       Pure helpers (format.ts) + __tests__/
src/__tests__/screens/  Screen tests (kept out of src/app/)
assets/
  expo.icon/     iOS app icon (still the Expo default)
  images/        App icon, Android adaptive icon, splash icon (still the Expo defaults)
assets/fonts/    Rubik (all weights), from the course fonts.zip
assets/icons/    Figma icons as PNG (@1x/@2x/@3x); figma/ holds the SVG sources
mockups/         HTML mockups shown before each UI issue
specs/
  product.md       What the app is, data, technical choices
  features/        One spec per feature (written when its issue starts)
docs/
  backlog.md       Issues and tracking order
  architecture.md  This file
  explanation.md   Hand-in explanation (filled before hand-in)
chat-history/      Exported agent conversations
templates/         Course templates (reference)
```

Non-route code (components, hooks, services) goes in folders next to `src/app/`, never inside it.

## Navigation

A root Stack holds the tab group and the screens pushed over it. Two tabs, as in Figma: **Pokémons** (`index`) and **Favorites** (`favorites`), with `NativeTabs` from `expo-router/native-tabs`. Tapping a card pushes `pokemon/[id]`. The tab icons are the Figma Pokémon and Favorite icons (PNG), Midnight by default and Purple when selected.

## Checks

| Command | Status |
|---|---|
| `npx expo lint` | passes |
| `npx tsc --noEmit` | passes |
| `npx expo-doctor` | 20/20 |
| `npm test` | passes (Jest + RNTL, #3) |
| CI | GitHub Actions: lint, tsc, tests on every push (#18) |

## Decisions

Technical choices live in [specs/product.md](../specs/product.md) → "Technical choices".
