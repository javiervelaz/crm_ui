import { TIPOS_EXTERNOS } from './modules';

/**
 * Usuarios y Roles gestionan sólo al staff: profesores, tutores y alumnos se
 * manejan desde Academia. La API marca esos roles con `externo` (GET /rol/list)
 * y rechaza asignarlos, quitarlos o editarlos (400 ROL_EXTERNO / USUARIO_EXTERNO).
 */
export interface RolConTipo {
  id: number;
  descripcion: string;
  externo?: boolean;
}

export const esRolExterno = (
  r: { externo?: boolean } | null | undefined,
): boolean => r?.externo === true;

/** Roles que se pueden asignar desde el perfil de un usuario (sin los de Academia). */
export const rolesAsignables = <R extends { externo?: boolean }>(
  roles: R[],
): R[] => roles.filter((r) => !esRolExterno(r));

/** ¿Alguno de los roles del usuario es de Academia? Entonces no se edita acá. */
export const tieneRolExterno = (
  idsDelUsuario: number[],
  roles: { id: number; externo?: boolean }[],
): boolean => {
  const externos = new Set(roles.filter(esRolExterno).map((r) => Number(r.id)));
  return idsDelUsuario.some((id) => externos.has(Number(id)));
};

/** Tipos de usuario para las solapas de Usuarios: sin profesor, tutor ni alumno. */
export const tiposDeStaff = <T extends { codigo: string }>(tipos: T[]): T[] =>
  tipos.filter(
    (t) => !(TIPOS_EXTERNOS as readonly string[]).includes(t.codigo),
  );

export const MENSAJE_ACADEMIA =
  'Profesores, tutores y alumnos se gestionan desde Academia.';
