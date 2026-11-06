import { getLocales } from 'expo-localization';

/**
 * Two languages (#14): English and French. The app follows the phone's language, read once at
 * start (changing the phone's language restarts the app). Pokémon and ability names stay as the
 * API gives them (English).
 */

export type Language = 'en' | 'fr';

/** The first of the phone's preferred languages that the app speaks, English otherwise. */
export function pickLanguage(languageCodes: (string | null | undefined)[]): Language {
  for (const code of languageCodes) {
    if (code === 'fr') return 'fr';
    if (code === 'en') return 'en';
  }
  return 'en';
}

const en = {
  tabPokemon: 'Pokémons',
  tabFavorites: 'Favorites',
  allPokemon: 'All Pokémon',
  myFavorites: 'My favorites',
  searchPlaceholder: 'Search for Pokémon..',
  searchLabel: 'Search for Pokémon',
  closeSearch: 'Close search',
  noResults: 'No Pokémon found for “{query}”',
  noResultsHint: 'Check the spelling, or try part of the name or the number.',
  loadingPokemon: 'Loading Pokémon…',
  loadingMore: 'Loading more Pokémon',
  loadMoreFailed: "Couldn't load more.",
  tryAgain: 'Try again',
  somethingWrong: 'Something went wrong',
  errorDefault: "We couldn't load the Pokémon. Check your connection and try again.",
  errorOffline: 'You seem to be offline. Check your connection and try again.',
  errorNotFound: "This Pokémon doesn't exist.",
  loadingFavorites: 'Loading favorites…',
  favoritesError: "We couldn't read your favorites.",
  noFavorites: 'No favorites yet',
  back: 'Back',
  compare: 'Compare',
  compareNamed: 'Compare {name}',
  addFavorite: 'Add to favorites',
  removeFavorite: 'Remove from favorites',
  openPokemon: 'Open Pokémon',
  share: 'Share',
  cancel: 'Cancel',
  optionsFor: 'Options for {name}',
  cardLabel: '{name}, number {number}',
  shareMessage: '{name} #{number} on paspokedex: {link}',
  tabAbout: 'About',
  tabStats: 'Stats',
  tabEvolution: 'Evolution',
  aboutName: 'Name',
  aboutId: 'ID',
  aboutBase: 'Base',
  aboutWeight: 'Weight',
  aboutHeight: 'Height',
  aboutTypes: 'Types',
  aboutAbilities: 'Abilities',
  artwork: '{name} artwork',
  typeLabel: 'Type {type}',
  loadingEvolutions: 'Loading evolutions…',
  evolutionError: "We couldn't load the evolution chain.",
  noEvolution: 'This Pokémon does not evolve.',
  openNamed: 'Open {name}',
  shownNow: '{name}, shown now',
  statHp: 'HP',
  statAttack: 'Attack',
  statDefense: 'Defense',
  statSpAttack: 'Sp. Atk',
  statSpDefense: 'Sp. Def',
  statSpeed: 'Speed',
  total: 'Total',
  pickTwo: 'Pick two Pokémon to see who is stronger on each stat.',
  pickAPokemon: 'Pick a Pokémon',
  tapToChange: 'Tap to change',
  pickSlot: 'Pick the {slot} Pokémon',
  slotPokemon: '{slot} Pokémon: {name}. Change',
  slotFirst: 'First',
  slotSecond: 'Second',
  vs: 'VS',
  strongerOn: '{name} is stronger on {count} of {total} stats',
  closeMatch: 'A close match: as many stats each.',
  statVersus: '{stat}: {first} against {second}',
  statTie: '{stat}: {first} against {second}, a tie',
  chooseAPokemon: 'Choose a Pokémon',
  pickHint: 'Type part of its name or its number.',
  pickNamed: 'Pick {name}',
} as const;

export type MessageKey = keyof typeof en;

const fr: Record<MessageKey, string> = {
  tabPokemon: 'Pokémons',
  tabFavorites: 'Favoris',
  allPokemon: 'Tous les Pokémon',
  myFavorites: 'Mes favoris',
  searchPlaceholder: 'Rechercher un Pokémon..',
  searchLabel: 'Rechercher un Pokémon',
  closeSearch: 'Fermer la recherche',
  noResults: 'Aucun Pokémon trouvé pour « {query} »',
  noResultsHint: "Vérifie l'orthographe, ou essaie une partie du nom ou le numéro.",
  loadingPokemon: 'Chargement des Pokémon…',
  loadingMore: 'Chargement de Pokémon supplémentaires',
  loadMoreFailed: 'Impossible de charger la suite.',
  tryAgain: 'Réessayer',
  somethingWrong: 'Un problème est survenu',
  errorDefault: 'Impossible de charger les Pokémon. Vérifie ta connexion et réessaie.',
  errorOffline: 'Tu sembles hors ligne. Vérifie ta connexion et réessaie.',
  errorNotFound: "Ce Pokémon n'existe pas.",
  loadingFavorites: 'Chargement des favoris…',
  favoritesError: 'Impossible de lire tes favoris.',
  noFavorites: 'Aucun favori pour le moment',
  back: 'Retour',
  compare: 'Comparer',
  compareNamed: 'Comparer {name}',
  addFavorite: 'Ajouter aux favoris',
  removeFavorite: 'Retirer des favoris',
  openPokemon: 'Ouvrir le Pokémon',
  share: 'Partager',
  cancel: 'Annuler',
  optionsFor: 'Options pour {name}',
  cardLabel: '{name}, numéro {number}',
  shareMessage: '{name} n°{number} sur paspokedex : {link}',
  tabAbout: 'Infos',
  tabStats: 'Stats',
  tabEvolution: 'Évolution',
  aboutName: 'Nom',
  aboutId: 'N°',
  aboutBase: 'Base',
  aboutWeight: 'Poids',
  aboutHeight: 'Taille',
  aboutTypes: 'Types',
  aboutAbilities: 'Talents',
  artwork: 'Illustration de {name}',
  typeLabel: 'Type {type}',
  loadingEvolutions: 'Chargement des évolutions…',
  evolutionError: "Impossible de charger la chaîne d'évolution.",
  noEvolution: "Ce Pokémon n'évolue pas.",
  openNamed: 'Ouvrir {name}',
  shownNow: '{name}, affiché',
  statHp: 'PV',
  statAttack: 'Attaque',
  statDefense: 'Défense',
  statSpAttack: 'Atq. Spé.',
  statSpDefense: 'Déf. Spé.',
  statSpeed: 'Vitesse',
  total: 'Total',
  pickTwo: 'Choisis deux Pokémon pour voir qui est le plus fort pour chaque stat.',
  pickAPokemon: 'Choisir un Pokémon',
  tapToChange: 'Toucher pour changer',
  pickSlot: 'Choisir le {slot} Pokémon',
  slotPokemon: '{slot} Pokémon : {name}. Changer',
  slotFirst: 'premier',
  slotSecond: 'second',
  vs: 'VS',
  strongerOn: '{name} est plus fort sur {count} stats sur {total}',
  closeMatch: 'Match serré : autant de stats chacun.',
  statVersus: '{stat} : {first} contre {second}',
  statTie: '{stat} : {first} contre {second}, égalité',
  chooseAPokemon: 'Choisir un Pokémon',
  pickHint: 'Tape une partie de son nom ou son numéro.',
  pickNamed: 'Choisir {name}',
};

const messages: Record<Language, Record<MessageKey, string>> = { en, fr };

const TYPE_NAMES_FR: Record<string, string> = {
  normal: 'Normal', fire: 'Feu', water: 'Eau', electric: 'Électrik', grass: 'Plante', ice: 'Glace',
  fighting: 'Combat', poison: 'Poison', ground: 'Sol', flying: 'Vol', psychic: 'Psy', bug: 'Insecte',
  rock: 'Roche', ghost: 'Spectre', dragon: 'Dragon', dark: 'Ténèbres', steel: 'Acier', fairy: 'Fée',
};

/** The language the app uses, from the phone's settings. */
export const language: Language = pickLanguage(getLocales().map((locale) => locale.languageCode));

/** A message in `lang`, with `{name}`-style parameters filled in. */
export function translate(lang: Language, key: MessageKey, params: Record<string, string | number> = {}): string {
  return messages[lang][key].replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** A message in the phone's language. */
export function t(key: MessageKey, params?: Record<string, string | number>): string {
  return translate(language, key, params);
}

/** A type name from the API ("grass") in the app's language ("Grass" / "Plante"). */
export function typeName(type: string, lang: Language = language): string {
  const key = type.toLowerCase();
  if (lang === 'fr' && key in TYPE_NAMES_FR) return TYPE_NAMES_FR[key];
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/** A decimal number with the language's separator: 6.9 / 6,9. */
export function formatDecimal(value: number, lang: Language = language): string {
  const fixed = value.toFixed(1);
  return lang === 'fr' ? fixed.replace('.', ',') : fixed;
}
