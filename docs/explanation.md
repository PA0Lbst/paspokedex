# Explanation - paspokedex

**Route:** Pokédex. **Tools:** Claude Code.

<Written in your own words before the hand-in. Every file and line named must exist in the repo. The agent keeps notes below as the work goes; turn them into your answers.>

## 1. Your technical choices

<One short paragraph per choice in `specs/product.md` → "Technical choices": where it is in the code (file and line), and whether it changed while building.>

## 2. Pick one feature and explain how it works, from API call to screen.

<Which feature, where the data comes in, where it is cached, how it reaches the screen, what happens while loading or on error. Name the files.>

Notes for the list (#4): `PokemonListScreen` (`src/app/(tabs)/index.tsx`) calls `usePokemonList` (`src/hooks/use-pokemon-list.ts`), a TanStack `useInfiniteQuery` that calls `fetchPokemonPage(offset)` in `src/services/pokeapi.ts` (GET `/pokemon?limit=20&offset=n`). The id comes from each result's URL and the sprite URL is built from it, so there is no call per Pokémon. Pages are cached under `queryKeys.pokemonList` for a day. `PokemonGrid` (FlashList) calls `loadMore` near the end. The first page shows `LoadingView` then `ErrorView` with Try again; a later page that fails keeps the cards and shows Try again under the grid.

## 3. Name a suggestion from the agent that you rejected or changed.

<What the agent suggested, what you did instead and why, how you noticed. Point at the chat in `chat-history/` or the commit.>

Candidates so far:
- List paging: the first version of `loadMore` called `fetchNextPage()` as is. A test ("does not request the same page twice", `src/hooks/__tests__/use-pokemon-list.test.tsx`) showed 3 requests instead of 2, because a second call restarts the page that is loading. Fixed with `{ cancelRefetch: false }` (`src/hooks/use-pokemon-list.ts`).
- Fonts: the Expo docs recommend one font family with several weights; the agent chose one name per weight (`src/hooks/use-app-fonts.ts`) because families only load their default face on older Android versions.
- The agent assumed the icon on each card was a favorite heart; checking Figma showed a ⋮ button that opens the Options sheet (open, add to favorites, share). The native feature became Share from that sheet.
- The agent planned the specs in `docs/specs/`; the course templates put them in `specs/features/`, so the issues were changed.
