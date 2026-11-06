import type { PokemonStat } from '@/services/pokeapi-types';

import { statLabel } from './pokemon-detail';

/** Who is stronger, stat by stat (docs/features/compare.md). */

export type Winner = 'first' | 'second' | 'tie';

export type CompareRow = { name: string; label: string; first: number; second: number; winner: Winner };

export type Comparison = {
  rows: CompareRow[];
  total: { first: number; second: number; winner: Winner };
  /** How many stats each side wins. */
  wins: { first: number; second: number };
};

export function winnerOf(first: number, second: number): Winner {
  if (first === second) return 'tie';
  return first > second ? 'first' : 'second';
}

/** Compares the stats both Pokémon have, in the first one's order; a missing stat counts as 0. */
export function compareStats(first: PokemonStat[], second: PokemonStat[]): Comparison {
  const names = [...first.map((s) => s.name), ...second.map((s) => s.name)].filter((n, i, all) => all.indexOf(n) === i);
  const valueOf = (stats: PokemonStat[], name: string) => stats.find((s) => s.name === name)?.value ?? 0;

  const rows = names.map((name) => {
    const a = valueOf(first, name);
    const b = valueOf(second, name);
    return { name, label: statLabel(name), first: a, second: b, winner: winnerOf(a, b) };
  });
  const totalFirst = rows.reduce((sum, row) => sum + row.first, 0);
  const totalSecond = rows.reduce((sum, row) => sum + row.second, 0);

  return {
    rows,
    total: { first: totalFirst, second: totalSecond, winner: winnerOf(totalFirst, totalSecond) },
    wins: {
      first: rows.filter((row) => row.winner === 'first').length,
      second: rows.filter((row) => row.winner === 'second').length,
    },
  };
}
