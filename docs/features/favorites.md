# Favorites

Issue: #7

## Goal

Keep the Pokémon I like on their own tab, still there after I close the app.

## Constraints

- Stored in SQLite: table `favorites (id, name, added_at)`, migration step 2 in `src/services/database.ts`, queries in `src/services/favorites-store.ts`.
- `useFavorites` (`src/hooks/use-favorites.ts`) is the only way screens read or change favorites; it shares one query (`queryKeys.favorites`) so the tab, the detail heart and the Options sheet agree.
- Favorites tab `src/app/(tabs)/favorites.tsx`: Figma Favorites ("My favorites", same 2-column grid).

## Acceptance Criteria

- [ ] Add or remove from the detail heart and from the Options sheet.
- [ ] The Favorites tab lists them, most recently added first, as cards; tapping one opens its detail.
- [ ] They are still there after a restart.
- [ ] No favorites: Snorlax (bundled artwork, works offline) above "No favorites yet", nothing else.
- [ ] Pressing the active Favorites tab scrolls back to the top.

## Out of Scope

- Reordering, sync between devices, optimistic update (optional #20).

## Decisions

- **SQLite, not AsyncStorage**: the course requires SQLite, and `added_at` gives the order for free.
- **Name stored with the id**, so the tab shows cards without any API call (the sprite URL comes from the id).
