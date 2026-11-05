import { formatPokemonNumber } from '../format';

describe('formatPokemonNumber', () => {
  it('pads small numbers to 3 digits', () => {
    expect(formatPokemonNumber(1)).toBe('001');
    expect(formatPokemonNumber(25)).toBe('025');
  });

  it('keeps numbers with 3 or more digits as they are', () => {
    expect(formatPokemonNumber(150)).toBe('150');
    expect(formatPokemonNumber(1025)).toBe('1025');
    expect(formatPokemonNumber(10001)).toBe('10001');
  });
});
