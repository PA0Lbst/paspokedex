# Detail

Issue: #6

## Goal

See everything about one Pokémon: name, number, artwork, types, then About, Stats and the evolution chain, and walk the chain from one stage to the next.

## Constraints

- Route `src/app/pokemon/[id].tsx`, pushed over the tabs (no tab bar). Reached from the list, search results, favorites, the Options sheet and the evolution chain.
- Data through `usePokemonDetail` (`src/hooks/use-pokemon-detail.ts`): `fetchPokemon`, then `fetchSpecies`, then `fetchEvolutionChain`, each cached by TanStack Query.
- Figma Detail: Daylight top with name (Rubik Bold 32, replaces Cabinet Grotesk), `#001` at 30%, type badges; 200 px artwork overlapping a white panel; `Tabs` About / Stats / Evolution.
- Own header (`ScreenHeader`), not the native one: iOS 26 puts native header buttons in glass capsules that Figma doesn't have. iOS chevron + "Back" (Figma "Vorige"), Android back arrow; on the right "Compare" (#8) and the favorite heart (#7). The name appears in it once the big name scrolls away (Figma "Detail - scroll").

## Acceptance Criteria

- [ ] Name, number, artwork and types in the type colour.
- [ ] About: Name, ID, Base XP, Weight (kg), Height (m), Types, Abilities.
- [ ] Stats: the six base stats with a bar out of 255.
- [ ] Evolution: every stage from the API (branches included); tapping another stage opens its detail.
- [ ] Switching tabs is instant (no new request).
- [ ] The heart adds or removes the favorite.
- [ ] Loading and error (Try again) for the detail; the Evolution tab has its own loading and error, and the rest of the detail stays.

## Out of Scope

- Moves, locations, cries, shiny artwork.

## Decisions

- **Bars out of 255** (the highest base stat), so bars mean the same on every Pokémon and in Compare.
- **Metric units with a dot** ("6.9 kg"), not the comma in Figma ("7,0 kg"), since the app is in English.
