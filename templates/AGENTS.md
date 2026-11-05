# AGENTS.md template

Put this at the top of `AGENTS.md` in the root of your repo, above Expo's
part. Rewrite it for your product. Add rules if the agent gets
something wrong or when you want to steer it in specific ways.

---

# <App name>

<One sentence: what the app is, and which API it runs on.>

- Expo Router, TanStack Query, expo-sqlite. Must run in Expo Go.
- Screens in `src/app/`, data through hooks in `src/hooks/`, API and SQL in `src/services/`.
- Shared setup (API client, query client, database): reuse what is listed here, never add a second one. When you set up something new that other features will use, add a line here: what it is and where it lives.
- Before you write code for an issue: post a plan (which files, how, what you are unsure about) and a `- [ ]` task list as one comment on the issue with `gh issue comment`. Wait for my go. Tick off tasks with `gh issue comment --edit-last` while you build.