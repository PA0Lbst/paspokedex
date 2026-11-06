# Search by name

Issue: #5

## Goal

Find any Pokémon by typing part of its name or its number in the field on Home, even one the list hasn't loaded yet. It is the fastest way to a Pokémon, so results show while typing and search still works offline after the first launch.

## Constraints

- Inline on the Pokémons tab, `src/app/(tabs)/index.tsx`. No new route. Field as in the Figma Home and Search frames: white, radius 8, shadow `0 2 7.5 rgba(48,55,115,0.15)`, padding 12 vertical / 16 horizontal, gap 12, 16 from the screen edges, search icon 24, placeholder "Search for Pokémon.." in Rubik Regular 16 at 30%. "All Pokémon" sits 32 below the field.
- PokeAPI has no search endpoint. `GET /pokemon?limit=100000` returns all 1351 `{ name, url }` in one call (about 93 KB). That index is downloaded through `fetchPokemonIndex` (`src/services/pokeapi.ts`), stored in SQLite (`pokemon_index` table in the shared database, `src/services/database.ts`), and filtered on the phone. No call per keystroke.
- Index refresh: download when nothing is stored, again when the stored copy is older than 7 days, and on pull to refresh. If a download fails while a copy is stored, keep that copy and try again at the next launch.
- Results reuse `PokemonGrid` and `PokemonCard`, the same 2-column grid as the list (Figma Search frame).
- Matching and order logic in `src/utils/search.ts`, state in `src/hooks/use-pokemon-search.ts`, UI in `src/components/search-field.tsx`. Colours, spacing and fonts from `@/theme`; state views from `state-views.tsx`.

## Acceptance Criteria

- [x] A search field at the top of Home, as in Figma. Results show from the first character and update 200 ms after the last keystroke. While a query is shown, the "All Pokémon" title is hidden.
- [x] Partial name, any case, anywhere in the name: "pika" and "PIKA" find Pikachu, "chu" finds Pikachu and Raichu.
- [x] Spaces, dashes and apostrophes are ignored: "mr mime" finds Mr. Mime (`mr-mime`), "farfetchd" finds Farfetch'd.
- [x] A number finds that Pokémon: "25" and "025" find Pikachu. Digits also match names that contain them ("2" finds Porygon2).
- [x] Finds every Pokémon, including ones the list hasn't loaded yet (for example "zygarde" on first launch). Results are in number order, forms (ids above 10000) last.
- [x] No match shows the empty state "No Pokémon found for "xyz"". A blank or whitespace-only field shows the normal list again, at the scroll position it had.
- [x] While the index downloads for the first time, the loading state shows under the field. If it fails with nothing stored, the error state shows with "Try again".
- [x] After a first successful launch, search works in airplane mode. A copy older than 7 days is refreshed in the background, and the old results keep showing meanwhile.
- [x] Pull to refresh on Home (list or results) downloads the index again and reloads the list from page 1.
- [x] Android: while the field is focused or has text, the search icon becomes a back arrow (Figma Search frame). The arrow and the system back button clear the query and hide the keyboard.
- [x] Dragging the grid or pressing the keyboard's Search key hides the keyboard and keeps the query.
- [x] Opening a result and coming back shows the same query and results.
- [ ] Pressing the Pokémons tab while already on it resets Home in one press: the search is cleared, the keyboard closes and the list scrolls back to the top. Without a search, it just scrolls the list to the top. Pressing it from the Favorites tab only switches tabs.

Checked by logic and screen tests, and in Expo Go on an iPhone (2026-11-06). The Android back arrow and system back are covered by screen tests only so far. The tab re-press reset (added 2026-11-06) still needs a check in Expo Go.

## Out of Scope

- Search on the Favorites tab.
- Filters by type or generation, and sorting other than by number.
- Fuzzy matching or typo tolerance ("pikachuu" finds nothing).
- Keeping the query after the app restarts, and search history or suggestions.
- A ✕ clear button (not in Figma).

## Decisions

- **Inline on Home, not a separate route**, as in Figma, where the Search frame is Home with text in the field. The field stays fixed above the grid instead of scrolling inside it, so it never loses focus when the results change.
- **Same grid as the list** for results. The issue's "results look like list rows" means the same cards as the list.
- **One index call stored in SQLite**, not filtering only the loaded pages (misses Pokémon not scrolled to yet) and not `GET /pokemon/{name}` (exact names only). 93 KB once a week is cheap, and SQLite makes search work offline.
- **Normalised matching**: query and name are lowercased and stripped of everything except letters and digits before comparing.
- **Pressing the active tab resets Home** (common iOS and Android pattern, added after the first phone test): one press clears the search, hides the keyboard and scrolls the list to the top, rather than one step per press. It listens to the `tabPress` event of `NativeTabs` (`react-native-screens` reports repeated selections on both platforms) and acts only when Home was already focused. The native iOS scroll-to-top is turned off on this tab (`disableScrollToTop`), because with the hidden list and the results grid it could scroll the wrong one.
- **The list stays mounted while searching**, hidden behind the results, so clearing the field returns to the same scroll position.
