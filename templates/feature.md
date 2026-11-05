# Feature spec template

One file per feature in `specs/features/`, for example
`specs/features/search.md`. Three to six features is enough. Every feature
becomes one GitHub issue. Delete the comments in `<>`. Half a page is plenty.

Same four headings as in Dan's lessons: Goal, Constraints, Acceptance
Criteria, Out of Scope. This is a worked example. Replace it with your own.

---

# Search a city

## Goal

<What can the user do when this is done, and why? One or two sentences.>

Find a city by typing its name, so I can see its week forecast.

## Constraints

<The walls the agent cannot see: which screen, which data, what to reuse,
what not to add.>

- Lives on the home screen, `src/app/index.tsx`. No new screen.
- Uses the Open-Meteo geocoding API (`/v1/search?name=...`). Starts from two
  letters.
- Colors and spacing from `src/constants/theme.ts`.
- No new dependencies.

## Acceptance Criteria

<Three to six things someone else can tick off without asking you anything.
What is on screen, what happens on press, what a failure looks like.>

- [ ] A search field at the top, placeholder "Search a city".
- [ ] Results show name and country while I type.
- [ ] No match shows the text "No city found".
- [ ] Tapping a result opens the week forecast for that city.
- [ ] A loading state while searching, an error with a Retry button when it fails.

## Out of Scope

<What this feature does not do. The agent will not invent it.>

- Search by postcode or coordinates.
- Search history or suggestions.
- My location (GPS).
