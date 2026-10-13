/**
 * Campo vacío para validar formularios. Acepta cualquier tipo: la API devuelve
 * algunos campos como número (profile.dni) y `.trim()` sobre un número
 * rompía el guardado (CP-10).
 */
export function estaVacio(valor: unknown): boolean {
  if (valor === null || valor === undefined) return true;
  return String(valor).trim() === '';
}
