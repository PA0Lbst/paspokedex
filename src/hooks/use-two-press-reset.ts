import { useEffect, useRef } from 'react';

type Options = {
  /** What the search field holds. Typing starts the two presses over. */
  query: string;
  /** First press: hide the keyboard and scroll what is shown back to the top. */
  scrollToTop: () => void;
  /** Second press: clear the search and show the list at the top. */
  clearSearch: () => void;
};

/**
 * Pressing the active tab, in two steps so a search is never lost by one stray press
 * (specs/features/search.md): the first press scrolls to the top, the next one clears
 * the search. Without a search, every press just scrolls to the top.
 */
export function useTwoPressReset({ query, scrollToTop, clearSearch }: Options) {
  const armed = useRef(false);

  // A new query (typing, clearing) starts over.
  useEffect(() => {
    armed.current = false;
  }, [query]);

  return {
    /** Call on each press of the active tab. */
    onRePress: () => {
      if (query === '' || !armed.current) {
        armed.current = query !== '';
        scrollToTop();
        return;
      }
      armed.current = false;
      clearSearch();
    },
    /** Call when the user scrolls the results again: the next press scrolls first. */
    cancel: () => {
      armed.current = false;
    },
  };
}
