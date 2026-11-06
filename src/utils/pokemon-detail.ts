import type { EvolutionStage } from '@/services/pokeapi-types';

import { formatPokemonName } from './format';
import { formatDecimal, type MessageKey, t, typeName } from '@/i18n';

/** Helpers for the detail screen (docs/features/detail.md). */

/** The API gives hectograms: 69 → "6.9 kg". */
export function formatWeight(hectograms: number): string {
  return `${formatDecimal(hectograms / 10)} kg`;
}

/** The API gives decimetres: 7 → "0.7 m". */
export function formatHeight(decimetres: number): string {
  return `${formatDecimal(decimetres / 10)} m`;
}

export function formatBaseExperience(value: number | null): string {
  return value === null ? '—' : `${value} XP`;
}

/** Types in the app's language: ["grass", "poison"] → "Grass, Poison" / "Plante, Poison". */
export function formatTypeList(types: string[]): string {
  return types.length === 0 ? '—' : types.map((type) => typeName(type)).join(', ');
}

/** "grass", "lightning-rod" → "Grass, Lightning rod". */
export function formatNameList(names: string[]): string {
  return names.length === 0 ? '—' : names.map(formatPokemonName).join(', ');
}

const STAT_LABELS: Record<string, MessageKey> = {
  hp: 'statHp',
  attack: 'statAttack',
  defense: 'statDefense',
  'special-attack': 'statSpAttack',
  'special-defense': 'statSpDefense',
  speed: 'statSpeed',
};

export function statLabel(name: string): string {
  const key = STAT_LABELS[name];
  return key ? t(key) : formatPokemonName(name);
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

/** Scroll offset after which the big name has left the screen (top padding + name line). */
export const TITLE_SCROLL_OFFSET = 56;

/** Figma "Detail - scroll": the name moves into the nav bar once it scrolls away. */
export function shouldShowTitle(scrollY: number): boolean {
  return scrollY > TITLE_SCROLL_OFFSET;
}
