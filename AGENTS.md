# paspokedex

A Pokédex for iOS and Android: browse, search, inspect, favorite, compare and share all ~1350 Pokémon, live from [PokeAPI](https://pokeapi.co) (public, no key).

- Expo Router, TanStack Query, expo-sqlite. Must run in Expo Go.
- Screens in `src/app/`, data through hooks in `src/hooks/`, API and SQL in `src/services/`. UI components in `src/components/`, theme tokens in `src/theme/`.
- Shared setup (API client, query client, database): reuse what is listed under "Shared setup", never add a second one. When you set up something new that other features will use, add a line there: what it is and where it lives.
- Before you write code for an issue: post a plan (which files, how, what you are unsure about) and a `- [ ]` task list as one comment on the issue with `gh issue comment`. Wait for my go. Tick off tasks with `gh issue comment --edit-last` while you build.
- Font: Rubik only (`assets/fonts/`), loaded with `useFonts` so it works in Expo Go. Figma also uses Cabinet Grotesk and Inter; we replace them with Rubik.
- Talk to the user in French. Code, specs, docs and commits are in English. Exception: issue #5 (Search) is done in its own English conversation, exported to `chat-history/` for the teacher.

### Shared setup

- **Tests**: Jest 30 + jest-expo preset + React Native Testing Library 14 (`package.json` → `jest`). Run with `npm test`. Logic tests sit next to the code in `__tests__/` (`src/utils/__tests__/`, `src/hooks/__tests__/`...); screen tests go in `src/__tests__/screens/`, never inside `src/app/` (every file there is a route).
- **CI**: `.github/workflows/ci.yml` runs lint, tsc and tests on every push and pull request. Keep it green; never push a red build.
- **Theme**: `src/theme/` (`colors`, `spacing`, `radius`, `softShadow`, `fonts`, `text`, `getTypeColor`). Import from `@/theme`; never hard-code a colour, size or font in a screen.
- **Fonts**: `src/hooks/use-app-fonts.ts` loads Rubik as `Rubik-Regular`, `Rubik-Medium`, `Rubik-SemiBold`, `Rubik-Bold` (one name per weight, no `fontWeight`). The root layout keeps the splash screen up until they are loaded.
- **State views**: `src/components/state-views.tsx` (`LoadingView`, `ErrorView` with Try again, `EmptyState` with an optional `image`, e.g. Snorlax `assets/images/snorlax.png` on the empty Favorites tab). Every screen that loads data uses them.
- **Type badge**: `src/components/type-badge.tsx` (`TypeBadge`, `capitalize`).
- **Icons**: PNGs exported from Figma in `assets/icons/` (@1x/@2x/@3x), SVG sources in `assets/icons/figma/`. Tint them with `tintColor`; don't add an icon library. Exception: `favorite-filled.png` is the filled red heart (`#FF4F68`, Figma red) shown once a Pokémon is a favorite; never tint it, and never show a favorite as a tinted outline.
- **API client**: `src/services/pokeapi.ts` (`fetchPokemonPage`, `fetchPokemon`, `fetchSpecies`, `fetchEvolutionChain`, `getIdFromUrl`, `spriteUrl`, `artworkUrl`, `PAGE_SIZE`). Types in `src/services/pokeapi-types.ts`. Never call `fetch` anywhere else.
- **JSON readers**: `src/services/json.ts` turns `unknown` JSON into typed data and throws `ApiError('invalid')` on a wrong shape. Use them for any new endpoint; no `any`, no `as`, no zod.
- **Errors**: `src/services/api-error.ts` (`ApiError` with `kind` network / http / invalid, `getErrorMessage` for the error views).
- **Query client**: `src/services/query-client.ts` (`createQueryClient`, `queryKeys`, `shouldRetry`), provided once in `src/app/_layout.tsx`. Add new keys to `queryKeys`; never create a second QueryClient.
- **Routes**: `src/app/_layout.tsx` is a Stack (providers, fonts, splash). The tabs live in `src/app/(tabs)/` (`index` = Pokémons, `favorites`), with their NativeTabs in `src/app/(tabs)/_layout.tsx`. Screens pushed on top of the tabs (no tab bar) go next to `(tabs)`, like `src/app/pokemon/[id].tsx`. Open a Pokémon with `router.push({ pathname: '/pokemon/[id]', params: { id: String(id) } })`.
- **List data**: `src/hooks/use-pokemon-list.ts` (`usePokemonList`: infinite query, 20 per page, `loadMore` is safe to call often).
- **Cards and grid**: `src/components/pokemon-card.tsx` (`PokemonCard`, Figma Pokecard, sprite placeholder) and `src/components/pokemon-grid.tsx` (`PokemonGrid`: FlashList, 2 columns, `header` slot above the first row, footer for loading more and its error). Any screen that shows Pokémon as cards (search results, favorites) reuses them.
- **Favorites**: `src/services/favorites-store.ts` (SQLite table `favorites`, migration step 2) and `src/hooks/use-favorites.ts` (`useFavorites`: list, `isFavorite`, `toggleFavorite`). Never read the table anywhere else.
- **Options menu and share**: `src/hooks/use-pokemon-options.tsx` (`usePokemonOptions` → `openOptions` for a grid's `onMorePokemon`). It opens the system's own menu: `ActionSheetIOS` on iOS, a native `Alert` on Android. Never draw the menu in JS. Share text in `src/utils/share.ts`.
- **Detail**: `src/hooks/use-pokemon-detail.ts` (pokemon → species → evolution chain), sections in `src/components/pokemon-detail-sections.tsx` (`DetailTabs`, `AboutSection`, `StatsSection`, `StatBar`, `EvolutionSection`), helpers in `src/utils/pokemon-detail.ts` (incl. `shouldShowTitle` for the collapsing header). Header buttons in `src/components/detail-header-actions.tsx` (`HeaderActions`): a component, so it reads the favorites itself inside the native header.
- **Screen header**: `src/components/screen-header.tsx` (`ScreenHeader`: back, centred title, `right` slot). Screens pushed over the tabs use it with `headerShown: false`, never the native Stack header (see rules).
- **Compare**: `src/app/compare.tsx` (params `first`, `second`), `src/hooks/use-compare.ts`, `src/utils/compare.ts`, picker `src/components/pokemon-picker.tsx` (search over the stored index).
- **Test helpers**: `src/test-utils/query.tsx` (`createWrapper` with a no-retry QueryClient, `makePage` for fake list pages).
- **Formatting helpers**: `src/utils/format.ts` (`formatPokemonNumber`, `formatPokemonName`).
- **Database**: `src/services/database.ts` (`getDatabase`: the one expo-sqlite connection, `paspokedex.db`, migrated with `PRAGMA user_version`). Add a table as a new migration step there; never open a second database.
- **Search index**: `src/services/pokemon-index.ts` (`loadPokemonIndex`, `downloadPokemonIndex`, stored by `pokemon-index-store.ts` in SQLite) and `src/hooks/use-pokemon-index.ts`. All 1351 Pokémon (`id`, `name`) for any feature that needs every name (search, compare picker).
- **Search rules**: `src/utils/search.ts` (`normalizeSearchText`, `isSearchQuery`, `searchPokemon`). Reuse them for any other search field.
- **Search field**: `src/components/search-field.tsx` (`SearchField`, Figma field with the Android back arrow). Theme token `fieldShadow` for its shadow.
- **Debounce**: `src/hooks/use-debounced-value.ts` (`useDebouncedValue`).
- **Tab re-press**: `src/hooks/use-tab-repress.ts` (`useTabRePress(onRePress)`: fires when the user presses the tab they are already on). Every tab screen uses it to reset itself (scroll to top, clear its state; Home goes through `useTwoPressReset` in `src/hooks/use-two-press-reset.ts` so a search needs two presses to clear), and its trigger in `src/app/(tabs)/_layout.tsx` gets `disableScrollToTop` so the native effect doesn't scroll the wrong list.
- **Fake database for tests**: `src/test-utils/fake-database.ts` (`createFakeDatabase`, an in-memory stand-in for expo-sqlite: `jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn(async () => mockDb) }))`). It throws on SQL it doesn't know, so teach it each new statement.

### Rules learned while building

- RNTL 14: `render`, `renderHook` and `fireEvent` are async. Always `await` them, or `screen` throws "render function has not been called" and state updates land after your assertions.
- RNTL skips elements hidden from screen readers (`accessibilityElementsHidden`, `importantForAccessibility="no-hide-descendants"`). Query decorative elements with `{ includeHiddenElements: true }`.
- FlashList ships ESM: it is listed in `transformIgnorePatterns` in `package.json` (the jest-expo default pattern plus `@shopify/flash-list`), and `@shopify/flash-list/jestSetup` is in `setupFiles`. Keep both when changing the Jest config.
- TanStack `fetchNextPage()` restarts a page that is already loading (`cancelRefetch` defaults to true). Pass `{ cancelRefetch: false }` when it is called from scroll events.
- expo-image test events need a `nativeEvent`: `fireEvent(image, 'error', { nativeEvent: { error: '...' } })`.
- No Xcode on this Mac (Command Line Tools only), so no iOS simulator: check UI changes with the user in Expo Go on their phone.
- When a test mocks `@/services/pokeapi`, spread `jest.requireActual('@/services/pokeapi')` and override only the fetchers: stores use its helpers (`spriteUrl`), and a missing helper makes a query fail silently (it keeps its old data).
- The ⋮ Options menu must be native (user's rule): `ActionSheetIOS` / `Alert`, not a JS Modal sheet. System menus show no icons; that is accepted.
- iOS 26 draws native Stack header buttons inside Liquid Glass capsules, which Figma doesn't have. Pushed screens hide the native header and use `ScreenHeader`.
- RN 0.88 removed `StyleSheet.absoluteFillObject`: use `StyleSheet.absoluteFill`.
- Typed routes (`.expo/types/router.d.ts`) only learn a new route when Metro runs: after adding a route, run `npx expo start` or `npx expo export` before `tsc`.
- `npx expo install` puts dev tools in `dependencies`: move test and lint packages to `devDependencies`.
- Jest resolves `@/assets/*` only because of the `moduleNameMapper` in `package.json` (TypeScript and Metro pick the most specific path, Jest the first). Keep `@/assets` above `@/`.
- jest-expo replaces `fetch` in every test environment (node too). Mock it with `jest.spyOn(globalThis, 'fetch')` and real `new Response(...)` objects; tests never hit the network.
- RN 0.88 types: type a TextInput ref as `useRef<ComponentRef<typeof TextInput>>(null)`; `useRef<TextInput>` doesn't compile.
- NativeTabs emits `tabPress` before switching tabs, also for a press on the active tab (`react-native-screens` reports repeated selections on iOS and Android). `navigation.isFocused()` inside the listener tells a re-press from a switch. The event map type isn't exported, so type the navigation yourself (see `use-tab-repress.ts`).
- Tabs stay mounted under pushed screens. A `BackHandler` listener in a tab must be registered with `useFocusEffect`, or it also fires on the detail screen.
- expo-sqlite has no Jest mock and no testing docs: mock `expo-sqlite` with the fake database above, and check real storage in Expo Go.
- The Figma connector is on the Starter plan, with a small call limit. Download the assets you need (they expire after 7 days) and note design values in this file or the spec, so you don't need to call Figma again.

## Documentation

These files, from the course templates in `templates/`, are the project documentation. Keep them up to date; never document a feature anywhere else.

- `specs/product.md`: what the app is, features list, data (API, endpoints, SQLite), technical choices with alternatives and why, technical core and optional checklists.
- `specs/features/<feature>.md`: one per feature and per GitHub issue, with Goal, Constraints, Acceptance Criteria, Out of Scope. Written before the code, updated when a decision changes.
- `docs/explanation.md`: technical choices with file and line, one feature from API to screen, one agent suggestion that was rejected. Every file and line named must exist.
- `chat-history/`: exported agent conversations.
- `docs/backlog.md`: issue tracking and order. `docs/architecture.md`: current folder structure and checks.

## Design source: Figma

Figma file: https://www.figma.com/design/XEmD1t64AlsTeM4nBh6aen/Pokedex-App-React-Native-Assessment?node-id=0-1 (your copy of the original challenge file, so the Figma connector can read it)

- Always use this Figma file as the reference for design decisions: type colours, font, spacing, icons, components and layout.
- Before designing any screen the user asks for, check in Figma whether it already exists. If it does, follow it closely. If it doesn't, say so and design it in the Figma style.
- If the Figma file can't be read, tell the user. Never guess a design value from memory.

Screens in Figma (Page 1, each in an iOS and an Android version):
- **Splashscreen**: logo centred (216 × 79). The app uses its own mark in that slot (`assets/images/splash-logo.png`, see `specs/product.md`) because the Figma image couldn't be exported.
- **Home**: search field, "All Pokémon" title, 2-column grid of `Pokecard`, bottom tab bar (Pokémons / Favorites). A `Pokecard` is a white card (radius 8, soft shadow) with the pixel sprite on `#F6F6FF`, a purple number label ("001"), the name in Rubik Medium 16 and a ⋮ button that opens **Options**.
- **Search**: the same grid filtered while typing. On Android the search icon becomes a back arrow.
- **Detail**: name, number, type badges, artwork, `Tabs` with three parts (about = label/value rows, stats = bars, evolution = stacked row-style `Pokecard`s), back button and favorite button. Plus a **Detail - scroll** state with a collapsed header.
- **Favorites**: "My favorites" title, same 2-column grid.
- **Options**: bottom sheet opened from a card's ⋮ button, with "Open Pokémon", "Add to favorites" and "Share" (plus a Cancel button on iOS). Share is the app's native feature.
- **Tokens**: Midnight `#0E0940` (text), Purple `#5631E8` (accent), Daylight `#EDF6FF` (background), Silver `#DBDAE6`, card image background `#F6F6FF`, soft shadow `0 2 15 #30377326`.
- **Search field** (Home and Search frames): white, radius 8, Figma drop shadow `0 2 7.5 rgba(48,55,115,0.15)`, padding 12 vertical / 16 horizontal, gap 12, 16 from the screen edges, search icon 24 (`assets/icons/search.png`), placeholder "Search for Pokémon.." in Inter Regular 16 at 30% (we use Rubik Regular). It sits above the "All Pokémon" title, which is 32 below it. On the Android Search frame the search icon becomes a back arrow while typing.
- **Not in Figma:** Compare, and the loading, error and empty states. Design these in the Figma style.

## Workflow for every issue or request

For every issue or need the user expresses, always follow these steps in order. Do not skip a step; if a step does not apply, say so explicitly.

1. **Clarify the need**: ask as many questions as needed to remove ambiguity (scope, expected behavior, edge cases, UI/UX, platforms, data, acceptance criteria). Do not start building until the answers are in.
2. **Check for conflicts with the past**: review `specs/`, `docs/`, this file, Figma and the current code. Flag any contradiction with earlier choices and ask the user how to resolve it.
3. **Post the plan on the issue**: files, approach, open doubts and a `- [ ]` task list, as one `gh issue comment`. Wait for the user's go.
4. **Build a code mockup**: a standalone HTML mockup shared in the conversation, even if a Figma screen exists. Iterate until the user validates it.
5. **Write tests**: tests on the logic (hook or service) for every acceptance criterion. Never regress: the full suite stays green on every iteration.
6. **Document**: write or update `specs/features/<feature>.md`, add technical choices (picked, alternatives, why) to `specs/product.md`, and note in `docs/explanation.md` anything the user will need to explain.
7. **Implement**: according to the validated mockup and the spec. Tick tasks on the issue comment as you go.
8. **Run the checks**: `npm test`, `npx expo lint`, `npx tsc --noEmit`. Report the results faithfully; the task is not done until everything passes.

Before the hand-in: check that every Figma screen and state is implemented, on top of the issues.

---

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
