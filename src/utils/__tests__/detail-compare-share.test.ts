import type { EvolutionStage } from '@/services/pokeapi-types';

import { compareStats, winnerOf } from '../compare';
import {
  flattenEvolution,
  formatBaseExperience,
  formatHeight,
  formatNameList,
  formatWeight,
  shouldShowTitle,
  statLabel,
  statRatio,
} from '../pokemon-detail';
import { buildShareMessage } from '../share';

const stage = (id: number, name: string, evolvesTo: EvolutionStage[] = []): EvolutionStage => ({
  id,
  name,
  spriteUrl: `s/${id}`,
  evolvesTo,
});

describe('detail helpers', () => {
  it('formats weight, height and base experience from API units', () => {
    expect(formatWeight(69)).toBe('6.9 kg');
    expect(formatHeight(7)).toBe('0.7 m');
    expect(formatBaseExperience(64)).toBe('64 XP');
    expect(formatBaseExperience(null)).toBe('—');
  });

  it('lists types and abilities with capitals', () => {
    expect(formatNameList(['grass', 'poison'])).toBe('Grass, Poison');
    expect(formatNameList(['lightning-rod'])).toBe('Lightning rod');
    expect(formatNameList([])).toBe('—');
  });

  it('labels stats and fills bars out of 255', () => {
    expect(statLabel('special-attack')).toBe('Sp. Atk');
    expect(statLabel('hp')).toBe('HP');
    expect(statRatio(51)).toBeCloseTo(0.2);
    expect(statRatio(300)).toBe(1);
    expect(statRatio(-1)).toBe(0);
  });

  it('flattens a linear chain in order', () => {
    const rows = flattenEvolution(stage(1, 'bulbasaur', [stage(2, 'ivysaur', [stage(3, 'venusaur')])]));
    expect(rows.map((r) => [r.id, r.depth])).toEqual([
      [1, 0],
      [2, 1],
      [3, 2],
    ]);
  });

  it('keeps every branch (Eevee)', () => {
    const rows = flattenEvolution(stage(133, 'eevee', [stage(134, 'vaporeon'), stage(135, 'jolteon')]));
    expect(rows.map((r) => r.name)).toEqual(['eevee', 'vaporeon', 'jolteon']);
  });
});

describe('collapsing header', () => {
  it('shows the name in the nav bar only after the big name scrolled away', () => {
    expect(shouldShowTitle(0)).toBe(false);
    expect(shouldShowTitle(56)).toBe(false);
    expect(shouldShowTitle(57)).toBe(true);
  });
});

describe('compare', () => {
  const pikachu = [
    { name: 'hp', value: 35 },
    { name: 'attack', value: 55 },
    { name: 'speed', value: 90 },
  ];
  const bulbasaur = [
    { name: 'hp', value: 45 },
    { name: 'attack', value: 55 },
    { name: 'speed', value: 45 },
  ];

  it('tells who wins each stat, ties included', () => {
    const { rows } = compareStats(pikachu, bulbasaur);
    expect(rows.map((r) => [r.label, r.winner])).toEqual([
      ['HP', 'second'],
      ['Attack', 'tie'],
      ['Speed', 'first'],
    ]);
  });

  it('counts wins and totals', () => {
    const { wins, total } = compareStats(pikachu, bulbasaur);
    expect(wins).toEqual({ first: 1, second: 1 });
    expect(total).toEqual({ first: 180, second: 145, winner: 'first' });
  });

  it('counts a missing stat as 0', () => {
    const { rows } = compareStats([{ name: 'hp', value: 10 }], []);
    expect(rows[0]).toMatchObject({ first: 10, second: 0, winner: 'first' });
  });

  it('compares two numbers', () => {
    expect(winnerOf(1, 1)).toBe('tie');
    expect(winnerOf(2, 1)).toBe('first');
  });
});

describe('share', () => {
  it('builds the text sent to the share sheet', () => {
    expect(buildShareMessage({ id: 25, name: 'pikachu' })).toBe(
      'Pikachu #025 on paspokedex: https://pokeapi.co/api/v2/pokemon/25',
    );
  });
});
