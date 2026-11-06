# Backlog

Source of truth for the GitHub issues and the Project board. Each section below becomes one issue.

## Tracking decisions (2026-11-05)

- **Tracking:** GitHub issues plus a GitHub Project board (Todo / In progress / Done). Board: https://github.com/users/PA0Lbst/projects/1. Issue numbers below match the GitHub issue numbers (#1–#20).
- **Order:** core tasks first. Optionals get issues too, but with the `priority: low` label, and we start them only after the core is done.
- **Constraints** (loading/error states, design font) are not features. They're listed as acceptance criteria in every feature issue, and the font itself is set up in one setup issue (#1).
- **One feature = one spec file + one issue.** Each feature issue starts by writing `specs/features/<feature>.md` (course template: Goal, Constraints, Acceptance Criteria, Out of Scope), following the workflow in AGENTS.md.
- **Course templates** (`templates/`, 2026-11-05): the course expects `specs/product.md`, `specs/features/`, `docs/explanation.md` and `chat-history/`. They are the project documentation. Technical core adds SQLite (favorites, #7; the shared database came first with the search index, #5) and one native feature (Share, #22).

## Labels

| Label | Meaning |
|---|---|
| `setup` | Technical foundation the features build on |
| `feature` | A Pokédex feature from Appendix A (one spec file each) |
| `optional` | Bonus (+0.5 each) |
| `priority: high` | Core: needed for the 6 |
| `priority: low` | Optional: start after the core is done |

## Constraints (go into every feature issue)

- Loading state and error state on list, detail and evolution chain.
- Uses the design font (Expo Font, from `fonts.zip`).
- Follows the Figma closely: type colours, font, spacing, icons.
- Tests on the logic (hook or service), based on the acceptance criteria. `npm test` passes, with no regressions.
- `npx expo lint` and `npx tsc --noEmit` pass.

---

## Core: setup

Order: #21 → #3 → #18 (moved up from the optionals as the no-regression guard) → #1 → #2 → #4. Then #5 Search in its own English conversation (for the teacher), then #6 → #7 → #22 → #8, and #24 (Figma check) and #23 (hand-in) last.

### 21. Setup: green baseline
`setup` `priority: high`
- Remove the Expo template demo code; lint and tsc pass; `.idea/` ignored; `docs/architecture.md` and README written.

### 1. Setup: theme, type colours and design font
`setup` `priority: high`
- Load the font from `fonts.zip` with Expo Font, and keep the splash screen up until it's loaded.
- Theme tokens (colours, spacing, radius, typography) in one place. No hard-coded colours in screens.
- Type colours for all 18 Pokémon types, taken from Figma.
- Shared building blocks: type badge, card/row, loading view, error view (with retry), empty state.

### 2. Setup: PokeAPI data layer
`setup` `priority: high`
- Typed API client for the endpoints we need (pokemon list, pokemon, species, evolution chain).
- Choose how data is fetched and cached (to be decided in the spec).
- Error handling that the loading/error views can use.

### 3. Setup: test tooling
`setup` `priority: high`
- Jest (jest-expo) and React Native Testing Library; `npm test` script.
- One example test on a hook/service so the pattern exists.

## Core: features

### 4. Feature: List
`feature` `priority: high`
- [ ] Shows all ~1300 Pokémon as in the design, live from the API.
- [ ] Loads fast and scrolls smoothly.
- [ ] Tapping a row opens the detail.
- [ ] Loading and error state.

### 5. Feature: Search
`feature` `priority: high`
- [x] Search field as in the design; results update while typing.
- [x] Partial name, any case: "pika" finds Pikachu.
- [x] Finds every Pokémon, including ones not scrolled to yet.
- [x] Results use the same grid cards as the list (Figma Search frame); no match shows an empty state.
- Note: PokeAPI has no search endpoint. Study what the API returns before choosing an approach in the spec.
- Pressing the active Pokémons tab: first press scrolls to the top, second clears the search (added after the first phone test).
- Spec: `specs/features/search.md`. One index call (`/pokemon?limit=100000`) stored in SQLite, filtered on the phone. Also brought pull to refresh into scope.

### 6. Feature: Detail
`feature` `priority: high`
- [ ] Reachable from the list and from favorites.
- [ ] Name, number, artwork, types in their type colour.
- [ ] Three parts: about, stats, evolution chain; quick to switch.
- [ ] Evolution chain from the API; tapping a stage opens its detail.
- [ ] Favorite / unfavorite.
- [ ] Loading and error state on detail and on the evolution chain.
- Found while testing #5: the detail's iOS back button reads "(tabs)". The root Stack shows its native header on `pokemon/[id]`, and iOS labels the back button with the previous screen's title; the `(tabs)` screen has none, so the route group name is used. Fix in #6 with the Figma Detail header (check the back label there).

### 7. Feature: Favorites
`feature` `priority: high`
- [ ] Own screen.
- [ ] Favorites are stored in SQLite and still there after a restart.
- [ ] Empty state.
- [ ] Tapping a favorite opens the detail.
- [ ] Pressing the Favorites tab while on it scrolls the list to the top (same rule as Pokémons, see `useTabRePress`, #5).

### 8. Feature: Compare (own design)
`feature` `priority: high`
- [ ] Pick any two Pokémon and show them side by side.
- [ ] Per stat, it's clear who is stronger.
- [ ] Follows the Figma style (no Figma screen exists; we make our own mockup).
- [ ] Loading and error state.

### 22. Feature: card options and share (native feature)
`feature` `priority: high`
- The ⋮ button on a card opens the Figma Options sheet: Open Pokémon, Add to favorites, Share (native share sheet). Depends on #4 and #7.

## Core: hand-in

### 24. Check: every Figma screen and state is implemented
`setup` `priority: high`

### 23. Hand-in: explanation and chat history
`setup` `priority: high`
- `docs/explanation.md`, `specs/` up to date, conversations in `chat-history/`.

## Optionals (+0.5 each)

All have `optional` and `priority: low`.

9. **Reanimated animations:** three different animations, each with a purpose.
10. **Dark mode:** every screen looks right, all colours from the theme.
11. **Pagination:** the list loads page by page while scrolling (for example, 20 at a time).
12. **Clean TypeScript:** no `any`, no `as` casts (`as const` is fine), no `@ts-ignore`.
13. **Design:** a consistent own style with its own font; buttons, cards and spacing look the same on every screen.
14. **Localization:** two languages; the app follows the phone's language.
15. **No warnings:** no `console.log`, no warnings in the terminal or on screen.
16. **Offline:** works in airplane mode with the last loaded data.
17. **Tests:** at least one logic test per feature, based on its acceptance criteria; `npm test` passes.
18. **CI:** a GitHub Action runs lint, tsc and tests on every push.
19. **Accessibility:** every button has a VoiceOver/TalkBack label; screens work with the largest text size.
20. **Optimistic update:** saving or removing a favorite shows at once and rolls back if it fails.

## Open points

- Pagination (#11) and "all ~1300 in the list" (#4) fit together: the list loads pages, and search (#5) works on a full name index. We'll confirm this in the specs.
- Optionals that overlap the core (Tests #17 vs #3, Design #13 vs #1) mostly come free if the core is done well.
