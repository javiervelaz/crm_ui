/**
 * Política de contraseñas: la misma que valida la API
 * (crm_api validators/passwordPolicy.js). Se muestra como checklist en vivo.
 */
export const REGLAS_PASSWORD = [
  {
    id: 'largo',
    texto: 'Al menos 10 caracteres',
    ok: (p: string) => p.length >= 10,
  },
  {
    id: 'minuscula',
    texto: 'Una minúscula',
    ok: (p: string) => /[a-z]/.test(p),
  },
  {
    id: 'mayuscula',
    texto: 'Una mayúscula',
    ok: (p: string) => /[A-Z]/.test(p),
  },
  { id: 'numero', texto: 'Un número', ok: (p: string) => /\d/.test(p) },
] as const;

export const passwordValida = (p: string): boolean =>
  REGLAS_PASSWORD.every((r) => r.ok(p));
