# Browse the list

Issue: #4

## Goal

Scroll through every Pokémon in a 2-column grid of cards, as in the Figma Home screen, and tap one to open it. The list is the entry point of the app, so it has to show fast and scroll smoothly.

## Constraints

- Lives on the Pokémons tab, `src/app/index.tsx`. Data through `usePokemonList` (`src/hooks/use-pokemon-list.ts`), UI in `src/components/`.
- Live from PokeAPI with `fetchPokemonPage` and TanStack Query `useInfiniteQuery`: 20 Pokémon per page, the next page loads when the user nears the end of the grid. Never the whole list at once.
- No call per Pokémon: the card shows the sprite built from the id, the number and the name, which all come from the list page.
- `@shopify/flash-list` for the grid (recycled cells), 2 columns.
- Card as in Figma `Pokecard`: white, radius 8, soft shadow; sprite on `#F6F6FF`, square; Purple number label top left ("001"); name in Rubik Medium 16. Grid padding 24, gap 16. Background Daylight. Title "All Pokémon" in Rubik Bold 24.
- Colours, spacing and fonts from `@/theme`. Loading and error states from `state-views.tsx`.

## Acceptance Criteria

- [x] The Pokémons tab shows the title "All Pokémon" and a 2-column grid of cards with sprite, number ("001") and name ("Bulbasaur").
- [x] The first 20 Pokémon show first; scrolling near the end loads the next 20, with a small spinner under the grid while it loads.
- [x] Scrolling to the end reaches the last Pokémon (1351 in total), and no more pages are requested after it.
- [x] Tapping a card opens that Pokémon's detail screen (`/pokemon/[id]`).
- [x] While the first page loads, the loading state shows. If it fails, the error state shows with "Try again", which loads it again.
- [x] If loading a later page fails, the cards already shown stay, and a "Try again" under the grid retries that page.
- [x] A card whose sprite doesn't exist (some alternate forms) shows a neutral placeholder instead of an empty box.

## Out of Scope

- The search field at the top of Home (#5).
- The ⋮ button and the Options sheet on a card (#22).
- Favorites (#7) and the detail content (#6): #4 only adds an empty detail route to navigate to.
- Sorting and filters by type. (Pull to refresh was out of scope here; it came with search, #5.)

## Decisions

- **Names shown with a capital letter** ("bulbasaur" → "Bulbasaur"), as in Figma. Forms keep the API name with dashes turned into spaces ("deoxys-attack" → "Deoxys attack").
- **Alternate forms (ids above 10000) are listed** like the others, with their id as the number. They are part of the API's 1351 entries.
