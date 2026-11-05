import { fallbackTypeColor, getTypeColor, isPokemonType, typeColors } from '../type-colors';

describe('type colours', () => {
  it('has a colour for all 18 types', () => {
    expect(Object.keys(typeColors)).toHaveLength(18);
  });

  it('uses the Figma colours for grass, poison, fire and electric', () => {
    expect(getTypeColor('grass')).toBe('#64BC55');
    expect(getTypeColor('poison')).toBe('#AB6AC8');
    expect(getTypeColor('fire')).toBe('#FF4F68');
    expect(getTypeColor('electric')).toBe('#FFCF00');
  });

  it('ignores case', () => {
    expect(getTypeColor('Water')).toBe(typeColors.water);
  });

  it('falls back for a type it does not know', () => {
    expect(getTypeColor('stellar')).toBe(fallbackTypeColor);
    expect(getTypeColor('')).toBe(fallbackTypeColor);
  });

  it('does not treat object keys like toString as types', () => {
    expect(isPokemonType('toString')).toBe(false);
  });
});
