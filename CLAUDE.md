@AGENTS.md

## Workflow for every issue or request

For every issue or need the user expresses, always follow these steps in order. Do not skip a step; if a step does not apply, say so explicitly.

1. **Clarify the need** — Ask as many questions as needed to remove ambiguity (scope, expected behavior, edge cases, UI/UX details, platforms, data, acceptance criteria). Do not start building until the answers are in.
2. **Check for conflicts with the past** — Review existing documentation (`docs/`), previously recorded decisions, and the current code. Flag any contradiction with earlier choices and ask the user how to resolve it before going further.
3. **Build a code mockup** — Create a standalone HTML mockup and share it in the conversation so the user can see what it will look like, even if a Figma mockup already exists. Iterate on it until the user validates it.
4. **Write tests** — Systematically write tests covering the new behavior. Never regress: every iteration must keep the full existing test suite green (no-regression on each iteration).
5. **Document the solution** — Record the solution and every decision made during the discussion (what was chosen, the alternatives considered, and why) in `docs/`, so future requests can be checked against it in step 2.
6. **Implement** — Implement the solution according to the validated mockup and the documented decisions.
7. **Run the tests** — Run the full test suite, plus lint and typecheck. Report the results faithfully; the task is not done until everything passes.
