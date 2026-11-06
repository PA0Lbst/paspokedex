# paspokedex

A Pokédex for iOS and Android. It lists all ~1350 Pokémon live from PokeAPI, lets you search them by name, open a detail page with stats and evolution chain, keep favorites, compare two Pokémon stat by stat, and share one with a friend. It is for anyone who wants to look up a Pokémon quickly on their phone. The design follows the course Figma file (see `AGENTS.md`).

## Core action

Find a Pokémon and see what it is worth.

## Features

Each feature is one file in `specs/features/` and one GitHub issue. The file is written when the issue starts.

1. [Browse the list](./features/list.md) (#4, done): all Pokémon in a 2-column grid, loaded page by page.
2. [Search by name](./features/search.md) (#5): part of the name, any case, over all Pokémon.
3. [Detail](./features/detail.md) (#6): name, number, artwork, types, about / stats / evolution chain.
4. [Favorites](./features/favorites.md) (#7): own screen, kept after a restart.
5. [Compare](./features/compare.md) (#8): two Pokémon side by side, who is stronger per stat.
6. [Card options and share](./features/share.md) (#22): the ⋮ sheet on a card: open, add to favorites, share.

## Data

- **API**: [PokeAPI v2](https://pokeapi.co/docs/v2). Public, no login, no key.
- **Endpoints**:
  - `GET /pokemon?limit=20&offset=n`: one page of the list (`name`, `url`). The id is read from the `url`, and the sprite URL is built from the id, so the list needs no call per Pokémon. `count` is 1351.
  - `GET /pokemon?limit=100000`: every `name` and `url` in one call (about 93 KB), the search index (#5).
  - `GET /pokemon/{id}`: types, stats, height, weight, abilities, artwork (detail, compare).
  - `GET /pokemon-species/{id}`: description and the evolution chain URL (detail).
  - `GET /evolution-chain/{id}`: the evolution chain (detail).
- **Images**: sprite `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png` on cards, official artwork `.../sprites/pokemon/other/official-artwork/{id}.png` on the detail.
- **Stored on the phone** (SQLite, one shared database `paspokedex.db`):
  - `pokemon_index(id, name)`: the search index, plus its download date in `meta` (#5).
  - `favorites`: columns decided in #7.

## Technical choices

Each choice: what we picked, what else we could have done, and why.

- **Stored in SQLite**: the favorites (#7) and the search index (#5). Other API data is only cached by TanStack Query. The index was first meant to stay in memory too, but storing it lets search work offline after the first launch and avoids downloading 93 KB at every start; it is refreshed after 7 days or on pull to refresh.
- **Native feature**: Share, from the ⋮ Options sheet on a card (as in Figma), using the native share sheet. Details in #22.
- **Expo Go, fonts with `useFonts`**: the Expo docs recommend the `expo-font` config plugin, but it needs a development build. We run in Expo Go, so the font is loaded at startup with `useFonts`, behind the splash screen.
- **Rubik only**: Figma also uses Cabinet Grotesk (titles) and Inter (search field), but the course provides Rubik only. Titles use Rubik Bold, the search field Rubik Regular. Adding the other two would mean more files and a new dependency for a small visual gain.
- **Fonts as one name per weight** (`Rubik-Regular`, `Rubik-Medium`...), not one `Rubik` family with `fontWeight`: expo-font 58 supports families, but on Android below API 29 a family only loads its default face. Separate names behave the same everywhere in Expo Go.
- **Type colours**: Figma shows four types (grass `#64BC55`, poison `#AB6AC8`, fire `#FF4F68`, electric `#FFCF00`). The other 14 use the usual type palette, as our own choice; unknown types get Silver. The colour is the dot inside a neutral pill, as in Figma, so the text stays readable for every type.
- **Loading, error and empty states**, not in Figma: a Purple spinner, a white card with "Try again", and an outlined Poké Ball (`mockups/01-theme.html`).
- **Icons as PNG exported from Figma**, not an icon library or `react-native-svg`: NativeTabs needs an image source, and PNGs tinted with `tintColor` cover the few icons we have without a new dependency.
- **TanStack Query** for all API data, rather than `fetch` in hand-written hooks: cache, loading and error states, retry and infinite pages come built in, and it prepares the Offline (#16) and Optimistic update (#20) optionals.
- **Typed API data without a library**: `response.json()` is read as `unknown` and checked by small readers (`src/services/json.ts`), rather than trusting it untyped or adding zod. It keeps the Clean TypeScript optional (#12) within reach with no new dependency, and a changed API shows a clear error instead of a crash deeper in the UI.
- **Retry and freshness**: failed calls are retried twice, except 404 and broken responses, which can't get better. Data stays fresh for a day, since Pokémon data barely changes.
- **Pagination, 20 per page** with infinite scroll in FlashList, rather than the whole list at once: the first screen shows fast, and it covers the Pagination optional (#11). Search (#5) needs all names, which it handles on its own.
- **Search over a local index** (#5): PokeAPI has no search endpoint, so the app downloads all names once and filters them on the phone. Alternatives: filtering only the pages already loaded (misses Pokémon not scrolled to yet), or `GET /pokemon/{name}` (exact names only, one call per try). Matching ignores case, spaces, dashes and apostrophes, and also accepts the number.
- **Search inline on Home**, not a separate screen: the Figma Search frame is Home with text in the field. Results reuse the list grid and cards.
- **Pull to refresh on Home** (#5): reloads the search index and the list. It was out of scope in #4; the index needed a way to force a refresh.
- **Pressing the active tab resets it** (#5): the usual iOS/Android pattern. On Pokémons it clears the search and scrolls to the top in one press; Favorites gets the same scroll-to-top in #7. Done in JS from the `tabPress` event (`useTabRePress`), not with the native special effect, so the screen decides what "reset" means.
- **Stack over tabs**: the root is a Stack with the tab group `(tabs)` inside it, so the detail opens on top of the tabs without the tab bar, as in Figma. Putting the detail inside the tabs would keep the tab bar on screen.
- **iOS and Android only**: the brief and Figma only cover mobile, so the template's web support was removed (#21).
- **Template code deleted, not kept in `/example`**: git history keeps it (#21).

## Technical core

- [ ] Runs in Expo Go
- [x] Live data through TanStack Query
- [x] At least 2 screens with Expo Router
- [ ] Something in SQLite that survives a restart
- [ ] Loading and error state on every load
- [ ] One native feature: Share, from the card's Options sheet
- [x] TypeScript and ESLint without errors
- [ ] UI, data and logic in separate files

## Optional

- [ ] Three different Reanimated animations, each with a purpose (#9)
- [ ] Dark mode: every screen looks right, all colours from the theme (#10)
- [x] Pagination: page by page while you scroll, not all at once (#11)
- [ ] Clean TypeScript: no `any`, no `as` casts, no `@ts-ignore` (#12)
- [ ] Design: a consistent own style, same buttons, cards and spacing on every screen (#13)
- [ ] Localization: two languages, follows the phone's language (#14)
- [ ] No warnings: no `console.log`, no warnings in the terminal or on screen (#15)
- [ ] Offline: works in airplane mode with the last loaded data (#16)
- [ ] Tests: at least one logic test per feature; `npm test` passes (#17)
- [x] CI: a GitHub Action runs lint, tsc and tests on every push (#18)
- [ ] Accessibility: labels for VoiceOver/TalkBack, works with the largest text size (#19)
- [ ] Optimistic update: saving or removing shows at once, rolls back on failure (#20)
