# paspokedex

A Pokédex for iOS and Android: browse, search, inspect, favorite, compare and share all ~1350 Pokémon, live from [PokeAPI](https://pokeapi.co) (public, no key).

- Expo Router, TanStack Query, expo-sqlite. Must run in Expo Go.
- Screens in `src/app/`, data through hooks in `src/hooks/`, API and SQL in `src/services/`. UI components in `src/components/`, theme tokens in `src/theme/`.
- Shared setup (API client, query client, database): reuse what is listed under "Shared setup", never add a second one. When you set up something new that other features will use, add a line there: what it is and where it lives.
- Before you write code for an issue: post a plan (which files, how, what you are unsure about) and a `- [ ]` task list as one comment on the issue with `gh issue comment`. Wait for my go. Tick off tasks with `gh issue comment --edit-last` while you build.
- Font: Rubik only (`assets/fonts/`), loaded with `useFonts` so it works in Expo Go. Figma also uses Cabinet Grotesk and Inter; we replace them with Rubik.
- Talk to the user in French. Code, specs, docs and commits are in English. Exception: issue #5 (Search) is done in its own English conversation, exported to `chat-history/` for the teacher.

### Shared setup

<None yet. Add one line per shared piece: what it is and where it lives.>

## Documentation

These files, from the course templates in `templates/`, are the project documentation. Keep them up to date; never document a feature anywhere else.

- `specs/product.md`: what the app is, features list, data (API, endpoints, SQLite), technical choices with alternatives and why, technical core and optional checklists.
- `specs/features/<feature>.md`: one per feature and per GitHub issue, with Goal, Constraints, Acceptance Criteria, Out of Scope. Written before the code, updated when a decision changes.
- `docs/explanation.md`: technical choices with file and line, one feature from API to screen, one agent suggestion that was rejected. Every file and line named must exist.
- `chat-history/`: exported agent conversations.
- `docs/backlog.md`: issue tracking and order. `docs/architecture.md`: current folder structure and checks.

## Design source: Figma

Figma file: https://www.figma.com/design/XEmD1t64AlsTeM4nBh6aen/Pokedex-App-React-Native-Assessment?node-id=0-1 (your copy of the original challenge file, so the Figma connector can read it)

- Always use this Figma file as the reference for design decisions: type colours, font, spacing, icons, components and layout.
- Before designing any screen the user asks for, check in Figma whether it already exists. If it does, follow it closely. If it doesn't, say so and design it in the Figma style.
- If the Figma file can't be read, tell the user. Never guess a design value from memory.

Screens in Figma (Page 1, each in an iOS and an Android version):
- **Splashscreen**: logo centred.
- **Home**: search field, "All Pokémon" title, 2-column grid of `Pokecard`, bottom tab bar (Pokémons / Favorites). A `Pokecard` is a white card (radius 8, soft shadow) with the pixel sprite on `#F6F6FF`, a purple number label ("001"), the name in Rubik Medium 16 and a ⋮ button that opens **Options**.
- **Search**: the same grid filtered while typing. On Android the search icon becomes a back arrow.
- **Detail**: name, number, type badges, artwork, `Tabs` with three parts (about = label/value rows, stats = bars, evolution = stacked row-style `Pokecard`s), back button and favorite button. Plus a **Detail - scroll** state with a collapsed header.
- **Favorites**: "My favorites" title, same 2-column grid.
- **Options**: bottom sheet opened from a card's ⋮ button, with "Open Pokémon", "Add to favorites" and "Share" (plus a Cancel button on iOS). Share is the app's native feature.
- **Tokens**: Midnight `#0E0940` (text), Purple `#5631E8` (accent), Daylight `#EDF6FF` (background), Silver `#DBDAE6`, card image background `#F6F6FF`, soft shadow `0 2 15 #30377326`.
- **Not in Figma:** Compare, and the loading, error and empty states. Design these in the Figma style.

## Workflow for every issue or request

For every issue or need the user expresses, always follow these steps in order. Do not skip a step; if a step does not apply, say so explicitly.

1. **Clarify the need**: ask as many questions as needed to remove ambiguity (scope, expected behavior, edge cases, UI/UX, platforms, data, acceptance criteria). Do not start building until the answers are in.
2. **Check for conflicts with the past**: review `specs/`, `docs/`, this file, Figma and the current code. Flag any contradiction with earlier choices and ask the user how to resolve it.
3. **Post the plan on the issue**: files, approach, open doubts and a `- [ ]` task list, as one `gh issue comment`. Wait for the user's go.
4. **Build a code mockup**: a standalone HTML mockup shared in the conversation, even if a Figma screen exists. Iterate until the user validates it.
5. **Write tests**: tests on the logic (hook or service) for every acceptance criterion. Never regress: the full suite stays green on every iteration.
6. **Document**: write or update `specs/features/<feature>.md`, add technical choices (picked, alternatives, why) to `specs/product.md`, and note in `docs/explanation.md` anything the user will need to explain.
7. **Implement**: according to the validated mockup and the spec. Tick tasks on the issue comment as you go.
8. **Run the checks**: `npm test`, `npx expo lint`, `npx tsc --noEmit`. Report the results faithfully; the task is not done until everything passes.

Before the hand-in: check that every Figma screen and state is implemented, on top of the issues.

---

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
