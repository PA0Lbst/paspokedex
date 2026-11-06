import { formatDecimal, pickLanguage, translate, typeName } from '..';

describe('two languages, following the phone', () => {
  it('uses the first of the phone languages the app speaks', () => {
    expect(pickLanguage(['fr', 'en'])).toBe('fr');
    expect(pickLanguage(['de', 'fr'])).toBe('fr');
    expect(pickLanguage(['en', 'fr'])).toBe('en');
  });

  it('falls back to English for any other language', () => {
    expect(pickLanguage(['de', 'es'])).toBe('en');
    expect(pickLanguage([null])).toBe('en');
  });

  it('translates and fills parameters', () => {
    expect(translate('en', 'allPokemon')).toBe('All Pokémon');
    expect(translate('fr', 'allPokemon')).toBe('Tous les Pokémon');
    expect(translate('fr', 'noResults', { query: 'pika' })).toBe('Aucun Pokémon trouvé pour « pika »');
    expect(translate('en', 'strongerOn', { name: 'Snorlax', count: 4, total: 6 })).toBe('Snorlax is stronger on 4 of 6 stats');
  });

  it('uses the same parameters in both languages', () => {
    const keys = ['noResults', 'optionsFor', 'cardLabel', 'shareMessage', 'strongerOn', 'statVersus', 'slotPokemon'] as const;
    const params = (message: string) => [...message.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const key of keys) expect(params(translate('fr', key))).toEqual(params(translate('en', key)));
  });

  it('translates type names and decimal separators', () => {
    expect(typeName('grass', 'fr')).toBe('Plante');
    expect(typeName('electric', 'fr')).toBe('Électrik');
    expect(typeName('grass', 'en')).toBe('Grass');
    expect(typeName('stellar', 'fr')).toBe('Stellar');
    expect(formatDecimal(6.9, 'fr')).toBe('6,9');
    expect(formatDecimal(6.9, 'en')).toBe('6.9');
  });
});
