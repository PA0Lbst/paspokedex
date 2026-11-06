# Compare

Issue: #8

## Goal

Put two Pokémon side by side and see, stat by stat, who is stronger.

## Constraints

- Not in Figma: built in its Detail style (white card, Rubik, bars as in Stats, Purple for the stronger side).
- Route `src/app/compare.tsx` (stack, title "Compare"), opened from "Compare" in the detail header with that Pokémon in the first slot.
- Picker `src/components/pokemon-picker.tsx`: search over the stored index of every Pokémon (#5), so any Pokémon can be picked.
- Logic in `src/utils/compare.ts` (`compareStats`), data in `src/hooks/use-compare.ts`.

## Acceptance Criteria

- [ ] Two slots; tapping a slot opens the picker; any Pokémon can be chosen, and changed later.
- [ ] For each stat: both values and bars, the stronger side in Purple; equal values are a tie.
- [ ] A total row and a summary ("Pikachu is stronger on 4 of 6 stats").
- [ ] Loading and error (Try again) while the two Pokémon load.

## Out of Scope

- Type matchups, more than two Pokémon.

## Decisions

- **Entry from the detail**, not a third tab: Figma has only two tabs, and comparing starts from a Pokémon you are looking at.
- **Bars out of 255**, like the detail; the total row uses the larger total as its scale.
