'use client';

/**
 * Cliente de /api/edu (crm_api feat/edu-catalogo). El tenant sale del JWT:
 * ningún request manda cliente_id.
 */
import apiClient from '@/app/lib/apiClient';
import type { Horario, TurnoAgenda } from './reglas';

export interface TipoClase {
  id: number;
  nombre: string;
  es_grupal: boolean;
  activo: boolean;
}

export interface Precio {
  id: number;
  clase_id: number;
  vigente_desde: string;
  importe_mensual: string;
  importe_clase: string | null;
}

export interface Clase {
  id: number;
  nombre: string;
  cupo: number | null;
  activa: boolean;
  tipo_clase_id: number;
  tipo_clase: string;
  es_grupal: boolean;
  precio_vigente: string | null;
  precio_clase_vigente: string | null;
  precio_vigente_desde: string | null;
  inscripciones_activas: number;
  precios?: Precio[];
}

export interface HorarioInscripcion extends Horario {
  id?: number;
}

export interface Inscripcion {
  id: number;
  alumno_id: number;
  clase_id: number;
  profesor_id: number;
  ciclo: number;
  fecha_alta: string;
  fecha_baja: string | null;
  alumno: string;
  tutor_id: number | null;
  clase: string;
  tipo_clase: string;
  es_grupal: boolean;
  profesor: string;
  horarios: HorarioInscripcion[];
}

interface PersonaBase {
  id: number;
  user_id: number | null;
  nombre: string;
  apellido: string;
  telefono: string | null;
  email: string | null;
  activo: boolean;
}
export interface Profesor extends PersonaBase {
  inscripciones_activas: number;
  inscripciones?: Inscripcion[];
}
export interface Alumno extends PersonaBase {
  tutor_id: number | null;
  tutor: string | null;
  fecha_nacimiento: string;
  edad: number;
  es_menor: boolean;
  inscripciones_activas: number;
  inscripciones?: Inscripcion[];
}
export interface Tutor extends PersonaBase {
  alumnos_activos: number;
  alumnos?: Alumno[];
}

export interface Acceso {
  user_id: number;
  email: string;
  passwordTemporal: string;
}

export type Entidad = 'profesores' | 'tutores' | 'alumnos';
export type PersonaPorEntidad = {
  profesores: Profesor;
  tutores: Tutor;
  alumnos: Alumno;
};

const get = async <T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T> => (await apiClient.get<T>(url, { params })).data;
const post = async <T>(url: string, body?: unknown): Promise<T> =>
  (await apiClient.post<T>(url, body)).data;
const put = async <T>(url: string, body?: unknown): Promise<T> =>
  (await apiClient.put<T>(url, body)).data;
const del = async <T>(url: string): Promise<T> =>
  (await apiClient.delete<T>(url)).data;

// Tipos de clase
export const listarTiposClase = () => get<TipoClase[]>('/edu/tipos-clase');
export const crearTipoClase = (body: { nombre: string; es_grupal: boolean }) =>
  post<TipoClase>('/edu/tipos-clase', body);

// Clases y precios
export const listarClases = (activas = false) =>
  get<Clase[]>('/edu/clases', activas ? { activas: 'true' } : undefined);
export const getClase = (id: number) => get<Clase>(`/edu/clases/${id}`);
export const crearClase = (
  body: Partial<Clase> & {
    precio?: {
      vigente_desde: string;
      importe_mensual: number;
      importe_clase?: number | null;
    };
  },
) => post<Clase>('/edu/clases', body);
export const actualizarClase = (id: number, body: Partial<Clase>) =>
  put<Clase>(`/edu/clases/${id}`, body);
export const desactivarClase = (id: number) => del<Clase>(`/edu/clases/${id}`);
export const crearPrecio = (
  claseId: number,
  body: {
    vigente_desde: string;
    importe_mensual: number;
    importe_clase?: number | null;
  },
) => post<Precio>(`/edu/clases/${claseId}/precios`, body);
export const actualizarPrecio = (
  claseId: number,
  id: number,
  body: { importe_mensual: number; importe_clase?: number | null },
) => put<Precio>(`/edu/clases/${claseId}/precios/${id}`, body);
export const borrarPrecio = (claseId: number, id: number) =>
  del<{ id: number }>(`/edu/clases/${claseId}/precios/${id}`);

// Personas
export const listarPersonas = <E extends Entidad>(
  entidad: E,
  params?: { q?: string; activo?: 'true' | 'false'; tutor_id?: number },
) => get<PersonaPorEntidad[E][]>(`/edu/${entidad}`, params);
export const getPersona = <E extends Entidad>(entidad: E, id: number) =>
  get<PersonaPorEntidad[E]>(`/edu/${entidad}/${id}`);
export const crearPersona = <E extends Entidad>(
  entidad: E,
  body: Record<string, unknown>,
) => post<PersonaPorEntidad[E] & { acceso?: Acceso }>(`/edu/${entidad}`, body);
export const actualizarPersona = <E extends Entidad>(
  entidad: E,
  id: number,
  body: Record<string, unknown>,
) => put<PersonaPorEntidad[E]>(`/edu/${entidad}/${id}`, body);
export const desactivarPersona = (entidad: Entidad, id: number) =>
  del(`/edu/${entidad}/${id}`);
export const crearAcceso = (entidad: Entidad, id: number, email?: string) =>
  post<Acceso>(`/edu/${entidad}/${id}/acceso`, email ? { email } : {});

// Inscripciones y agenda
export const listarInscripciones = (params?: {
  ciclo?: number;
  profesor_id?: number;
  alumno_id?: number;
  clase_id?: number;
  todas?: 'true';
}) => get<Inscripcion[]>('/edu/inscripciones', params);
export const getInscripcion = (id: number) =>
  get<Inscripcion>(`/edu/inscripciones/${id}`);
export const crearInscripcion = (body: {
  alumno_id: number;
  clase_id: number;
  profesor_id: number;
  ciclo?: number;
  fecha_alta?: string;
  horarios: Horario[];
}) => post<Inscripcion>('/edu/inscripciones', body);
export const actualizarInscripcion = (
  id: number,
  body: {
    profesor_id?: number;
    fecha_alta?: string;
    fecha_baja?: string | null;
  },
) => put<Inscripcion>(`/edu/inscripciones/${id}`, body);
export const darDeBajaInscripcion = (id: number, fecha_baja?: string) =>
  post<Inscripcion>(
    `/edu/inscripciones/${id}/baja`,
    fecha_baja ? { fecha_baja } : {},
  );
export const actualizarHorarios = (id: number, horarios: Horario[]) =>
  put<Inscripcion>(`/edu/inscripciones/${id}/horarios`, { horarios });
export const agenda = (params?: { profesor_id?: number; ciclo?: number }) =>
  get<TurnoAgenda[]>('/edu/agenda', params);

// Vista propia (profesor, tutor, alumno)
export const miPerfil = () => get<Profesor | Tutor | Alumno>('/edu/mis/perfil');
export const misInscripciones = (params?: { ciclo?: number; todas?: 'true' }) =>
  get<Inscripcion[]>('/edu/mis/inscripciones', params);
export const miAgenda = (params?: { ciclo?: number }) =>
  get<TurnoAgenda[]>('/edu/mis/agenda', params);

// Cuenta
export const cambiarPassword = (actual: string, nueva: string) =>
  post<{ ok: boolean; token: string }>('/cuenta/password', { actual, nueva });

/** Nueva contraseña temporal para alguien que ya tiene acceso (etapa 3). Requiere módulo usuarios. */
export const resetearAcceso = async (userId: number): Promise<Acceso> => {
  const r = await post<{
    user: { id: number; email: string };
    passwordTemporal: string;
  }>(`/cuenta/credenciales/${userId}/reset`);
  return {
    user_id: r.user.id,
    email: r.user.email,
    passwordTemporal: r.passwordTemporal,
  };
};
