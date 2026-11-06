import type { EvolutionStage } from '@/services/pokeapi-types';

import { formatPokemonName } from './format';

/** Helpers for the detail screen (specs/features/detail.md). */

/** The API gives hectograms: 69 → "6.9 kg". */
export function formatWeight(hectograms: number): string {
  return `${(hectograms / 10).toFixed(1)} kg`;
}

/** The API gives decimetres: 7 → "0.7 m". */
export function formatHeight(decimetres: number): string {
  return `${(decimetres / 10).toFixed(1)} m`;
}

export function formatBaseExperience(value: number | null): string {
  return value === null ? '—' : `${value} XP`;
}

/** "grass", "lightning-rod" → "Grass, Lightning rod". */
export function formatNameList(names: string[]): string {
  return names.length === 0 ? '—' : names.map(formatPokemonName).join(', ');
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

export function statLabel(name: string): string {
  return STAT_LABELS[name] ?? formatPokemonName(name);
}

/** Highest base stat in the games (Blissey's HP), so bars compare across Pokémon. */
export const MAX_STAT = 255;

/** Share of the bar to fill, between 0 and 1. */
export function statRatio(value: number, max: number = MAX_STAT): number {
  if (max <= 0) return 0;
  return Math.min(Math.max(value / max, 0), 1);
}

export type EvolutionRow = Omit<EvolutionStage, 'evolvesTo'> & { depth: number };

/** The chain as rows, in order: each stage, then what it evolves into (branches one after another). */
export function flattenEvolution(stage: EvolutionStage, depth = 0): EvolutionRow[] {
  const { evolvesTo, ...row } = stage;
  return [{ ...row, depth }, ...evolvesTo.flatMap((next) => flattenEvolution(next, depth + 1))];
}
