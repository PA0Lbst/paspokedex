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
  _layout.tsx    Root navigator: native bottom tabs (NativeTabs)
  index.tsx      Pokémons tab (placeholder, built in #4)
  favorites.tsx  Favorites tab (placeholder, built in #7)
src/utils/       Pure helpers (format.ts) + __tests__/
src/__tests__/screens/  Screen tests (kept out of src/app/)
assets/
  expo.icon/     iOS app icon (still the Expo default)
  images/        App icon, Android adaptive icon, splash icon (still the Expo defaults)
assets/fonts/    Rubik (all weights), from the course fonts.zip
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

Two tabs, as in Figma: **Pokémons** (`index`) and **Favorites** (`favorites`). They use `NativeTabs` from `expo-router/native-tabs`. The tab icons are system symbols for now (`sf` on iOS, `md` on Android).

## Checks

| Command | Status |
|---|---|
| `npx expo lint` | passes |
| `npx tsc --noEmit` | passes |
| `npx expo-doctor` | 20/20 |
| `npm test` | passes (Jest + RNTL, #3) |
| CI | not set up yet (#18) |

## Decisions

Technical choices live in [specs/product.md](../specs/product.md) → "Technical choices".
