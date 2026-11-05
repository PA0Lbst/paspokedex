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
assets/
  expo.icon/     iOS app icon (still the Expo default)
  images/        App icon, Android adaptive icon, splash icon (still the Expo defaults)
docs/
  backlog.md       Issues and tracking decisions
  architecture.md  This file
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
| `npm test` | not set up yet (#3) |
| CI | not set up yet (#18) |

## Decisions

### Green baseline (#21, 2026-11-05)

- **Template demo code deleted**, not moved to `/example`. Git history keeps it.
- **iOS and Android only.** The brief and Figma cover only mobile. Removed the web config, the `web` script, `react-dom`, `react-native-web` and `expo-web-browser`.
- **Two empty tabs** as the navigation skeleton, matching Figma. #4 and #7 fill them in.
- **Template theme helpers deleted.** The theme is rebuilt from Figma in #1, and dark mode is optional (#10).
- **Tab icons are placeholders** (system symbols) until #1 brings in the Figma icons.
- **App icon and splash screen** are still the Expo defaults. Changing them is out of scope for #21.
