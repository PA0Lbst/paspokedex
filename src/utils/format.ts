/** Pokédex number as shown on cards and the detail: at least 3 digits ("001", "025", "1025"). */
export function formatPokemonNumber(id: number): string {
  return String(id).padStart(3, '0');
}

/** API name as shown in the app: "bulbasaur" → "Bulbasaur", "deoxys-attack" → "Deoxys attack". */
export function formatPokemonName(name: string): string {
  const spaced = name.replace(/-/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
