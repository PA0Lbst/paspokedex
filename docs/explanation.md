# Explanation - paspokedex

**Route:** Pokédex. **Tools:** Claude Code.

<Written in your own words before the hand-in. Every file and line named must exist in the repo. The agent keeps notes below as the work goes; turn them into your answers.>

## 1. Your technical choices

<One short paragraph per choice in `specs/product.md` → "Technical choices": where it is in the code (file and line), and whether it changed while building.>

## 2. Pick one feature and explain how it works, from API call to screen.

<Which feature, where the data comes in, where it is cached, how it reaches the screen, what happens while loading or on error. Name the files.>

## 3. Name a suggestion from the agent that you rejected or changed.

<What the agent suggested, what you did instead and why, how you noticed. Point at the chat in `chat-history/` or the commit.>

Candidates so far:
- The agent assumed the icon on each card was a favorite heart; checking Figma showed a ⋮ button that opens the Options sheet (open, add to favorites, share). The native feature became Share from that sheet.
- The agent planned the specs in `docs/specs/`; the course templates put them in `specs/features/`, so the issues were changed.
