/** Pokédex number as shown on cards and the detail: at least 3 digits ("001", "025", "1025"). */
export function formatPokemonNumber(id: number): string {
  return String(id).padStart(3, '0');
}
