# Product spec template

Copy this into your own repo as `specs/product.md` and fill it in. Delete the
comments in `<>`. Keep it short: one page is plenty.

This file says what the app **is**. What the app **does** goes in
`specs/features/`, one file per feature. See [feature.md](./feature.md).

What a filled-in spec looks like: [example](./product-example.md).

---

# <App name>

<One paragraph: what does the app do, and who is it for?>

## Core action

<The one thing a user does with this app: search, fight, plan, collect, ...>

## Features

<One line per feature, linking to its file in `specs/features/`. 3 to 6, not
more. Each one becomes a GitHub issue.>

1. [Browse the list](./features/browse-list.md)
2. [Search by name](./features/search.md)
3. ...

## Data

- **API**: <name and link. Key or login? Say so. A key goes in `.env`, never in the repo.>
- **Endpoints**: <which ones you use, and for what>
- **Stored on the phone**: <what goes into SQLite, which columns>

## Technical choices

<Fill in the two below: every app makes these choices. For each one: what
you picked, what else you could have done, and why. Write it before you
build. If you change your mind later, change it here too.>

- **Stored in SQLite**: <what, and why that and not something else>
- **Native feature**: <which one, and where in the app>

## Technical core

<Tick these off as you build. They are required for a pass.>

- [ ] Runs in Expo Go
- [ ] Live data through TanStack Query
- [ ] At least 2 screens with Expo Router
- [ ] Something in SQLite that survives a restart
- [ ] Loading and error state on every load
- [ ] One native feature: <which one, and where>
- [ ] TypeScript and ESLint without errors
- [ ] UI, data and logic in separate files

## Optional

<Tick the ones you built, +0.5 each. Delete the rest or leave them unticked.>

- [ ] Three different Reanimated animations, each with a purpose
- [ ] Dark mode: every screen looks right, all colours from the theme
- [ ] Pagination: page by page while you scroll, not all at once
- [ ] Clean TypeScript: no `any`, no `as` casts, no `@ts-ignore`
- [ ] Design (not Pokédex): a consistent own style with your own font
- [ ] Localization: two languages
- [ ] No warnings: no `console.log`, none in the terminal or on screen
- [ ] Offline: works in airplane mode with the last data
- [ ] Tests: one per feature on the logic, `npm test` passes
- [ ] CI: lint and tsc on every push
- [ ] Accessibility: button labels, largest text size
- [ ] Optimistic update

## Out of scope

<What the app as a whole does not do: accounts, a web version, other APIs, ...
Limits of one feature go in that feature's file.>
