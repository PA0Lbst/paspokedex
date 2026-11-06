# Explanation - paspokedex

**Route:** Pokédex. **Tools:** Claude Code (desktop app), GitHub CLI, Figma connector.

## 1. Your technical choices

**What I store in SQLite.** My favorites, in a `favorites` table with the id, the name and the date I added them (`src/services/database.ts:30`). I picked SQLite and not AsyncStorage because I want them newest first and never twice, and SQLite does both with `ORDER BY` and a primary key. Only `src/services/favorites-store.ts` reads that table. Later I used the same database for two more things: the list of all 1351 names for search (`src/services/pokemon-index.ts:35`), so search works offline, and a saved copy of the API cache for offline mode (`src/services/database.ts:37`). I kept one database on purpose instead of adding AsyncStorage next to it.

**My native feature.** Sharing a Pokémon. The ⋮ on a card opens the Options sheet from Figma, and "Share" calls React Native's `Share.share` (`src/hooks/use-pokemon-options.tsx:58`), which opens the phone's own share sheet. I didn't take `expo-sharing` because it shares files and I only send text. This choice changed a lot while building, see question 3.

**Live data.** Everything from PokeAPI goes through TanStack Query with one QueryClient (`src/services/query-client.ts`). It retries a failed call twice, but not a 404 or a broken answer, because those won't get better (`src/services/query-client.ts:17`). The list loads 20 Pokémon at a time with an infinite query (`src/hooks/use-pokemon-list.ts:31`).

**Fonts in Expo Go.** The Expo docs recommend the `expo-font` config plugin, but that needs a development build, and I run the app in Expo Go. So I load Rubik with `useFonts` at startup, behind the splash screen (`src/hooks/use-app-fonts.ts:18`). Figma also uses Cabinet Grotesk and Inter, but the course only gives Rubik, so Rubik is used everywhere.

**No `any` in the API code.** I read every API answer as `unknown` and check its shape with small functions (`src/services/json.ts:18`) instead of adding zod. That keeps TypeScript strict without a new library, and a changed API shows the error screen instead of crashing somewhere else.

**The optionals I added.** The favorite changes on screen before SQLite is done and goes back if saving fails (`src/hooks/use-favorites.ts:40` and `:46`). The API cache is saved in SQLite so the app works in airplane mode (`src/services/query-persister.ts:26`). Colours come from a light and a dark palette through `useTheme` (`src/theme/use-theme.ts:18`). The app speaks English or French, whichever the phone prefers (`src/i18n/index.ts:177`). And there are three animations, each with a reason: the stat bars fill up (`src/components/pokemon-detail-sections.tsx:95`), the heart pops when I add a favorite (`src/components/detail-header-actions.tsx:18`), and a detail tab fades in when I switch to it (`src/app/pokemon/[id].tsx:94`).

## 2. Pick one feature and explain how it works, from API call to screen.

**The list on the Pokémons tab.** `PokemonListScreen` (`src/app/(tabs)/index.tsx`) calls my hook `usePokemonList` (`src/hooks/use-pokemon-list.ts:31`). That hook is a TanStack infinite query whose `queryFn` calls `fetchPokemonPage(offset)` (`src/services/pokeapi.ts:65`), which is `GET /pokemon?limit=20&offset=n`.

The API only gives a name and a URL for each Pokémon. I read the id from the URL and build the sprite URL from the id, so I don't need one extra call per Pokémon. The pages are cached by TanStack under one key, and saved to SQLite for offline use.

The grid is a FlashList with 2 columns. When I scroll near the end it calls `loadMore`, which asks for the next 20 with `{ cancelRefetch: false }` (`src/hooks/use-pokemon-list.ts:52`): without it, a second scroll event restarted the page that was already loading.

While the first page loads I see the loading view. If it fails I see the error view with "Try again" (`src/app/(tabs)/index.tsx:83`). If a later page fails, the cards I already have stay, and a "Try again" appears under the grid.

## 3. Name a suggestion from the agent that you rejected or changed.

**Keeping the search list in memory only.** For search, the agent suggested keeping the downloaded list of all names in the TanStack cache only. It even matched my product spec at that time, which said SQLite was only for favorites. I said no: I wanted it stored in SQLite, so search still works offline after the first launch and the 93 KB isn't downloaded at every start. I changed the spec to match. It is `loadPokemonIndex` (`src/services/pokemon-index.ts:35`) with the `pokemon_index` table. Chat: `docs/chat-history/issue-05-search.md`, in the clarification questions at the start.

Other times I steered the agent:
- **The Options menu.** I asked for a native menu. The agent tried `ActionSheetIOS` (it showed in the middle of the screen on iOS 26), a SwiftUI menu (it opened next to the button), a native sheet with our own rows, and the iOS confirmation dialog. I tried each on my phone and kept the sheet with the Figma rows and icons (`src/app/_layout.tsx:65`), because it matches the design and still rises from the bottom.
- **Clearing the search with one press.** The agent made one press on the active tab clear my search. On my iPhone that was too easy to do by mistake, so I asked for two presses: the first goes to the top, the second clears (`src/hooks/use-two-press-reset.ts:13`, commit `c12f257`, chat line 509). In the same message I reported the "(tabs)" back button label, now "Back" (`src/app/_layout.tsx:56`).
- **Small design fixes I asked for:** a filled red heart instead of a purple one, Snorlax on the empty favorites screen, and the header without the iOS 26 glass buttons.
