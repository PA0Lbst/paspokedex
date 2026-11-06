# Explanation - paspokedex

**Route:** Pokédex. **Tools:** Claude Code (desktop app), GitHub CLI, Figma connector.

> **Draft written by the agent from the code and the chats.** The template asks for your own words: check each answer against the code and rewrite it before the hand-in. Every file and line named exists at commit time.

## 1. Your technical choices

**Stored in SQLite.** Two things. Favorites, in the table `favorites (id, name, added_at)` created by migration step 2 (`src/services/database.ts:30`) and used only in `src/services/favorites-store.ts`: SQLite rather than AsyncStorage because they are listed newest first (`ORDER BY added_at DESC`) and can't be duplicated (`id` is the primary key). And the search index of all 1351 names (`src/services/pokemon-index.ts:35`), so search finds Pokémon not scrolled to yet and works offline after the first launch.

**Native feature.** Share, from the ⋮ Options sheet on every card, as in Figma: `Share.share` (`src/hooks/use-pokemon-options.tsx:30`) opens the system share sheet with the text from `src/utils/share.ts`. React Native `Share` rather than `expo-sharing`, which shares files; we send text, and it works in Expo Go.

**Live data through TanStack Query.** One QueryClient (`src/services/query-client.ts`), retrying twice except on 404 and broken responses (`src/services/query-client.ts:16`). The list is an infinite query, 20 per page (`src/hooks/use-pokemon-list.ts:31`).

**Expo Go and fonts.** The Expo docs recommend the `expo-font` config plugin, but it needs a development build. We run in Expo Go, so Rubik is loaded at startup with `useFonts` (`src/hooks/use-app-fonts.ts:18`), one name per weight, behind the splash screen.

**Typed API data without a library.** Responses are read as `unknown` and checked by small readers (`src/services/json.ts:18`) instead of zod: no new dependency, no `any`, and a changed API shows the error view instead of a crash.

**What changed while building.** The specs moved from `docs/specs/` to `specs/features/` to follow the course templates. The card icon turned out to be a ⋮ menu in Figma, which became the native feature. The search index moved from memory to SQLite (see 3). The tab re-press went from one press to two.

## 2. Pick one feature and explain how it works, from API call to screen.

**The list (#4).** `PokemonListScreen` (`src/app/(tabs)/index.tsx`) calls `usePokemonList` (`src/hooks/use-pokemon-list.ts:31`), a TanStack `useInfiniteQuery` whose `queryFn` calls `fetchPokemonPage(offset)` (`src/services/pokeapi.ts:65`): `GET /pokemon?limit=20&offset=n`. Each result only has a name and a URL; the id is read from the URL and the sprite URL is built from it, so there is no call per Pokémon. Pages are cached under `queryKeys.pokemonList`. `PokemonGrid` (FlashList, 2 columns) calls `loadMore` near the end, which passes `{ cancelRefetch: false }` (`src/hooks/use-pokemon-list.ts:52`) so a second scroll event doesn't restart the page that is loading. While the first page loads the screen shows `LoadingView`; if it fails, `ErrorView` with Try again (`src/app/(tabs)/index.tsx:80`). If a later page fails, the cards stay and Try again shows under the grid.

## 3. Name a suggestion from the agent that you rejected or changed.

**The search index in memory only.** For search (#5), the agent recommended keeping the downloaded list of all names in the TanStack cache only, which matched `specs/product.md` at the time (SQLite for favorites only). I chose to store it in SQLite instead, so search works offline after the first launch and the 93 KB isn't downloaded at every start, and the spec was changed. It is `loadPokemonIndex` (`src/services/pokemon-index.ts:35`) with the table `pokemon_index` (`src/services/database.ts`). Chat: `chat-history/issue-05-search.md` (clarification questions at the start).

Other moments, if you prefer one:
- **The Options menu.** I asked for a native sheet; the agent tried `ActionSheetIOS` (centred on iOS 26: React Native presents it as a popover), a SwiftUI `Menu` (at the button), a Stack `formSheet` with our Figma rows, then the SwiftUI confirmation dialog. Seeing them on my phone, I went back to the formSheet with the Figma rows and icons (`src/app/options/[id].tsx`): it rises from the bottom and matches Figma, which the system dialog can't. Same for the heart: tinted Purple at first, I asked for a filled red heart.
- **Tab re-press in one press.** The agent's first version cleared the search with one press on the active tab. Testing on my iPhone, I said it clears too fast and asked for the common rule: first press scrolls to the top, second clears (`src/hooks/use-two-press-reset.ts:13`, commit `c12f257`, chat line 509). In the same message I reported the "(tabs)" back button label, fixed with `headerBackTitle` in `src/app/_layout.tsx`.
- **The card icon.** The agent assumed it was a favorite heart; Figma showed a ⋮ that opens the Options sheet, which became Share.
- **Android back.** The first search plan used a plain `BackHandler`; the tab stays mounted under the detail, so it is registered with `useFocusEffect` (`src/app/(tabs)/index.tsx`).
- **A test caught a bug.** The first `loadMore` restarted pages; "does not request the same page twice" (`src/hooks/__tests__/use-pokemon-list.test.tsx`) showed 3 requests instead of 2.
