@AGENTS.md

## Design source: Figma

Figma file: https://www.figma.com/design/XEmD1t64AlsTeM4nBh6aen/Pokedex-App-React-Native-Assessment?node-id=0-1 (your copy of the original challenge file, so the Figma connector can read it)

- Always use this Figma file as the reference for design decisions: type colours, font, spacing, icons, components and layout.
- Before designing any screen the user asks for, check in Figma whether it already exists. If it does, follow it closely. If it doesn't, say so and design it in the Figma style.
- If the Figma file can't be read, tell the user. Never guess a design value from memory.

Screens in Figma (Page 1, each in an iOS and an Android version):
- **Splashscreen**: logo centred.
- **Home**: search field, "All Pokémon" title, 2-column grid of `Pokecard`, bottom tab bar (Pokémons / Favorites).
- **Search**: the same grid filtered while typing. On Android the search icon becomes a back arrow.
- **Detail**: name, number, type badges, artwork, `Tabs` with three parts (about = label/value rows, stats = bars, evolution = stacked row-style `Pokecard`s), back button and favorite button. Plus a **Detail - scroll** state with a collapsed header.
- **Favorites**: "My favorites" title, same 2-column grid.
- **Options**: bottom sheet with three `_Option` rows (plus a cancel button on iOS).
- **Not in Figma:** Compare, and the loading, error and empty states. Design these in the Figma style.

## Workflow for every issue or request

For every issue or need the user expresses, always follow these steps in order. Do not skip a step; if a step does not apply, say so explicitly.

1. **Clarify the need** — Ask as many questions as needed to remove ambiguity (scope, expected behavior, edge cases, UI/UX details, platforms, data, acceptance criteria). Do not start building until the answers are in.
2. **Check for conflicts with the past** — Review existing documentation (`docs/`), previously recorded decisions, and the current code. Flag any contradiction with earlier choices and ask the user how to resolve it before going further.
3. **Build a code mockup** — Create a standalone HTML mockup and share it in the conversation so the user can see what it will look like, even if a Figma mockup already exists. Iterate on it until the user validates it.
4. **Write tests** — Systematically write tests covering the new behavior. Never regress: every iteration must keep the full existing test suite green (no-regression on each iteration).
5. **Document the solution** — Record the solution and every decision made during the discussion (what was chosen, the alternatives considered, and why) in `docs/`, so future requests can be checked against it in step 2.
6. **Implement** — Implement the solution according to the validated mockup and the documented decisions.
7. **Run the tests** — Run the full test suite, plus lint and typecheck. Report the results faithfully; the task is not done until everything passes.
