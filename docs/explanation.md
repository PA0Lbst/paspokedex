# Explanation - paspokedex

**Route:** Pokédex. **Tools:** Claude Code.

<Written in your own words before the hand-in. Every file and line named must exist in the repo. The agent keeps notes below as the work goes; turn them into your answers.>

## 1. Your technical choices

<One short paragraph per choice in `specs/product.md` → "Technical choices": where it is in the code (file and line), and whether it changed while building.>

## 2. Pick one feature and explain how it works, from API call to screen.

<Which feature, where the data comes in, where it is cached, how it reaches the screen, what happens while loading or on error. Name the files.>

Notes for the list (#4): `PokemonListScreen` (`src/app/(tabs)/index.tsx`) calls `usePokemonList` (`src/hooks/use-pokemon-list.ts`), a TanStack `useInfiniteQuery` that calls `fetchPokemonPage(offset)` in `src/services/pokeapi.ts` (GET `/pokemon?limit=20&offset=n`). The id comes from each result's URL and the sprite URL is built from it, so there is no call per Pokémon. Pages are cached under `queryKeys.pokemonList` for a day. `PokemonGrid` (FlashList) calls `loadMore` near the end. The first page shows `LoadingView` then `ErrorView` with Try again; a later page that fails keeps the cards and shows Try again under the grid.

Notes for search (#5): PokeAPI has no search endpoint, so `fetchPokemonIndex` (`src/services/pokeapi.ts:80`) gets every name in one call (GET `/pokemon?limit=100000`, about 93 KB). `loadPokemonIndex` (`src/services/pokemon-index.ts:35`) returns the copy stored in SQLite (`src/services/pokemon-index-store.ts`, database in `src/services/database.ts:33`), or downloads and stores it on first launch. A copy older than 7 days is still returned, flagged `isStale`, and `usePokemonIndex` refreshes it in the background (`src/hooks/use-pokemon-index.ts:40`). If that refresh fails, the old copy stays and its date doesn't change, so the next launch tries again. `usePokemonSearch` (`src/hooks/use-pokemon-search.ts:33`) waits 200 ms after the last keystroke and filters with `searchPokemon` (`src/utils/search.ts:26`): lowercase, letters and digits only, anywhere in the name, or the exact number. Clearing the field skips the debounce (`src/hooks/use-pokemon-search.ts:39`). The screen (`src/app/(tabs)/index.tsx`) shows the results in the same `PokemonGrid`, and hides the list with `display: 'none'` instead of unmounting it, so its scroll position is kept (`src/app/(tabs)/index.tsx:137`). States: `LoadingView` during the first download, `ErrorView` if it fails with nothing stored, `EmptyState` when nothing matches. Android: the back arrow in `SearchField` and the system back (`src/app/(tabs)/index.tsx:118`, registered with `useFocusEffect` so it doesn't fire on the detail screen) clear the search.

Notes for the tab re-press (#5, added after the first phone test): `useTabRePress` (`src/hooks/use-tab-repress.ts`) listens to the NativeTabs `tabPress` event and fires only if the tab was already focused, since the event comes before the switch. Home passes the press to `useTwoPressReset` (`src/app/(tabs)/index.tsx:35`, `src/hooks/use-two-press-reset.ts`): the first press hides the keyboard and calls `scrollToOffset(0)` on the grid that is shown (through `PokemonGrid`'s `listRef`), the second clears the search. Typing (a new query) or dragging the results (`onScrollBeginDrag` → `cancel`) starts over.

## 3. Name a suggestion from the agent that you rejected or changed.

<What the agent suggested, what you did instead and why, how you noticed. Point at the chat in `chat-history/` or the commit.>

Candidates so far:
- List paging: the first version of `loadMore` called `fetchNextPage()` as is. A test ("does not request the same page twice", `src/hooks/__tests__/use-pokemon-list.test.tsx`) showed 3 requests instead of 2, because a second call restarts the page that is loading. Fixed with `{ cancelRefetch: false }` (`src/hooks/use-pokemon-list.ts`).
- Fonts: the Expo docs recommend one font family with several weights; the agent chose one name per weight (`src/hooks/use-app-fonts.ts`) because families only load their default face on older Android versions.
- The agent assumed the icon on each card was a favorite heart; checking Figma showed a ⋮ button that opens the Options sheet (open, add to favorites, share). The native feature became Share from that sheet.
- Search index: the agent recommended keeping the downloaded index in memory only (TanStack cache), which matched `specs/product.md` (SQLite for favorites only). I chose to store it in SQLite, so search works offline after the first launch and the 93 KB isn't downloaded at every start, and changed the spec (`chat-history/`, issue #5 clarification).
- Search, Android back: the first plan only said "BackHandler on Android". The tab stays mounted under the detail, so a plain listener would have cleared the search instead of leaving the detail. It is registered with `useFocusEffect` (`src/app/(tabs)/index.tsx:118`).
- Tab re-press: not in the first plan or the spec. I asked for the usual "press the active tab to reset" behaviour after testing on the phone; the agent had missed it. Its first version cleared the search in one press, which was too easy to trigger by mistake on the phone, so it became two presses.
- The agent planned the specs in `docs/specs/`; the course templates put them in `specs/features/`, so the issues were changed.
