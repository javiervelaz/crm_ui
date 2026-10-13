/**
 * Reglas puras de la academia (rubro educación). Espejan las de la API
 * (crm_api services/edu/reglas.js) para avisar antes de enviar; la API sigue
 * siendo la que decide.
 */

export const MAYORIA_EDAD = 18;

export const DIAS = [
  { n: 1, corto: 'Lun', largo: 'Lunes' },
  { n: 2, corto: 'Mar', largo: 'Martes' },
  { n: 3, corto: 'Mié', largo: 'Miércoles' },
  { n: 4, corto: 'Jue', largo: 'Jueves' },
  { n: 5, corto: 'Vie', largo: 'Viernes' },
  { n: 6, corto: 'Sáb', largo: 'Sábado' },
  { n: 7, corto: 'Dom', largo: 'Domingo' },
] as const;

export const nombreDia = (n: number, corto = false): string =>
  DIAS.find((d) => d.n === Number(n))?.[corto ? 'corto' : 'largo'] ??
  `Día ${n}`;

const TZ = 'America/Argentina/Cordoba';

/** Hoy en Córdoba, 'AAAA-MM-DD'. */
export const hoy = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

/** Mes actual 'AAAA-MM'. */
export const mesActual = (now: Date = new Date()): string =>
  hoy(now).slice(0, 7);

export const esFecha = (s: unknown): s is string => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

/** Edad cumplida a la fecha `ref`. null si la fecha no es válida. */
export function edad(
  fechaNacimiento: string,
  ref: string = hoy(),
): number | null {
  if (!esFecha(fechaNacimiento)) return null;
  const [an, mn, dn] = fechaNacimiento.split('-').map(Number);
  const [ar, mr, dr] = ref.split('-').map(Number);
  let e = ar - an;
  if (mr < mn || (mr === mn && dr < dn)) e -= 1;
  return e;
}

export const esMenor = (
  fechaNacimiento: string,
  ref: string = hoy(),
): boolean => {
  const e = edad(fechaNacimiento, ref);
  return e !== null && e < MAYORIA_EDAD;
};

// ─── Horarios ───────────────────────────────────────────────────────────────
export interface Horario {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

const HORA_RE = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
export const aMinutos = (hhmm: string): number => {
  const [h, m] = hhmm.slice(0, 5).split(':').map(Number);
  return h * 60 + m;
};

export const seSuperponen = (a: Horario, b: Horario): boolean =>
  Number(a.dia_semana) === Number(b.dia_semana) &&
  aMinutos(a.hora_inicio) < aMinutos(b.hora_fin) &&
  aMinutos(b.hora_inicio) < aMinutos(a.hora_fin);

/**
 * Errores de una lista de horarios, por índice (vacío = válida). Mismas reglas
 * que la API: al menos uno, día 1-7, HH:MM, fin > inicio y sin pisarse.
 */
export function erroresHorarios(horarios: Horario[]): {
  general?: string;
  porFila: Record<number, string>;
} {
  const porFila: Record<number, string> = {};
  if (!horarios.length)
    return { general: 'Cargá al menos un horario', porFila };
  horarios.forEach((h, i) => {
    if (!(Number(h.dia_semana) >= 1 && Number(h.dia_semana) <= 7))
      porFila[i] = 'Elegí el día';
    else if (!HORA_RE.test(h.hora_inicio) || !HORA_RE.test(h.hora_fin))
      porFila[i] = 'Completá las horas';
    else if (aMinutos(h.hora_fin) <= aMinutos(h.hora_inicio))
      porFila[i] = 'La hora de fin tiene que ser posterior a la de inicio';
  });
  // Sólo los horarios bien formados entran en la comparación de superposición.
  const malFormados = new Set(Object.keys(porFila).map(Number));
  horarios.forEach((h, i) => {
    if (malFormados.has(i)) return;
    for (let j = 0; j < i; j++) {
      if (!malFormados.has(j) && seSuperponen(h, horarios[j])) {
        porFila[i] = `Se pisa con el horario ${j + 1}`;
        break;
      }
    }
  });
  return { porFila };
}

export const formatHorario = (h: Horario, corto = true): string =>
  `${nombreDia(h.dia_semana, corto)} ${h.hora_inicio.slice(0, 5)}–${h.hora_fin.slice(0, 5)}`;

// ─── Agenda semanal ─────────────────────────────────────────────────────────
export interface TurnoAgenda extends Horario {
  inscripcion_id: number;
  profesor_id: number;
  profesor: string;
  alumno: string;
  clase: string;
  es_grupal: boolean;
}

export interface BloqueAgenda {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  clase: string;
  profesor: string;
  profesor_id: number;
  es_grupal: boolean;
  alumnos: string[];
  inscripciones: number[];
  /** Posición en la grilla: minutos desde el inicio visible y duración. */
  top: number;
  alto: number;
}

/**
 * Agrupa los turnos para dibujar la semana: un taller con varios alumnos en el
 * mismo turno es un solo bloque. Devuelve también el rango horario visible
 * (redondeado a la hora) y los días que tienen clases.
 */
export function armarAgenda(turnos: TurnoAgenda[]): {
  bloques: BloqueAgenda[];
  desde: number;
  hasta: number;
  dias: number[];
} {
  const grupos = new Map<string, BloqueAgenda>();
  for (const t of turnos) {
    const clave = [
      t.dia_semana,
      t.hora_inicio,
      t.hora_fin,
      t.profesor_id,
      t.es_grupal ? t.clase : t.inscripcion_id,
    ].join('|');
    const g = grupos.get(clave);
    if (g) {
      g.alumnos.push(t.alumno);
      g.inscripciones.push(t.inscripcion_id);
    } else {
      grupos.set(clave, {
        dia_semana: Number(t.dia_semana),
        hora_inicio: t.hora_inicio.slice(0, 5),
        hora_fin: t.hora_fin.slice(0, 5),
        clase: t.clase,
        profesor: t.profesor,
        profesor_id: t.profesor_id,
        es_grupal: t.es_grupal,
        alumnos: [t.alumno],
        inscripciones: [t.inscripcion_id],
        top: 0,
        alto: 0,
      });
    }
  }
  const lista = [...grupos.values()];
  if (!lista.length)
    return {
      bloques: [],
      desde: 8 * 60,
      hasta: 20 * 60,
      dias: [1, 2, 3, 4, 5],
    };
  const desde =
    Math.floor(Math.min(...lista.map((b) => aMinutos(b.hora_inicio))) / 60) *
    60;
  const hasta =
    Math.ceil(Math.max(...lista.map((b) => aMinutos(b.hora_fin))) / 60) * 60;
  for (const b of lista) {
    b.top = aMinutos(b.hora_inicio) - desde;
    b.alto = aMinutos(b.hora_fin) - aMinutos(b.hora_inicio);
  }
  const conClase = new Set(lista.map((b) => b.dia_semana));
  // Lunes a viernes siempre; sábado y domingo sólo si hay clases.
  const dias = [1, 2, 3, 4, 5, 6, 7].filter((d) => d <= 5 || conClase.has(d));
  lista.sort(
    (a, b) =>
      a.dia_semana - b.dia_semana ||
      aMinutos(a.hora_inicio) - aMinutos(b.hora_inicio),
  );
  return { bloques: lista, desde, hasta, dias };
}

// ─── Errores de la API ──────────────────────────────────────────────────────
export interface ErrorApi {
  mensaje: string;
  code?: string;
  field?: string;
  detalle?: {
    motivo: string;
    horario?: Horario;
    alumno?: string;
    clase?: string;
    hora_inicio?: string;
    hora_fin?: string;
  }[];
}

const MENSAJES_CODIGO: Record<string, string> = {
  MENOR_SIN_TUTOR: 'Un alumno menor de 18 años necesita un tutor.',
  ALUMNO_MENOR: 'Un alumno menor entra con el acceso de su tutor.',
  EMAIL_TAKEN: 'Ya existe un usuario con ese email.',
  PRECIO_DUPLICADO: 'Ya hay un precio para ese mes: editalo en el historial.',
  INSCRIPCION_DUPLICADA:
    'El alumno ya está inscripto en esa clase para ese ciclo.',
  TIENE_INSCRIPCIONES: 'Tiene inscripciones activas: dalas de baja primero.',
  TIENE_ALUMNOS: 'El tutor tiene alumnos activos.',
  SIN_PRECIO: 'La clase no tiene precio cargado para ese mes.',
};

/** Normaliza un error de axios de /api/edu a algo mostrable. */
export function errorDeApi(
  err: unknown,
  porDefecto = 'No se pudo guardar',
): ErrorApi {
  const data = (err as { response?: { data?: Record<string, unknown> } })
    ?.response?.data;
  if (!data || typeof data !== 'object') return { mensaje: porDefecto };
  const code = typeof data.code === 'string' ? data.code : undefined;
  const texto = typeof data.error === 'string' ? data.error : undefined;
  return {
    // El mensaje de la API ya es específico (ej. con qué alumno choca el horario).
    mensaje: texto || (code && MENSAJES_CODIGO[code]) || porDefecto,
    code,
    field: typeof data.field === 'string' ? data.field : undefined,
    detalle: Array.isArray(data.detalle)
      ? (data.detalle as ErrorApi['detalle'])
      : undefined,
  };
}

/** Líneas legibles del detalle de un 409 de horarios. */
export function lineasConflicto(e: ErrorApi): string[] {
  return (e.detalle ?? []).map((d) => {
    const turno = d.horario ? formatHorario(d.horario, false) : '';
    if (d.motivo === 'CUPO_COMPLETO')
      return `${turno}: el taller tiene el cupo completo`;
    if (d.motivo === 'ALUMNO_OCUPADO')
      return `${turno}: el alumno ya tiene ${d.clase ?? 'otra clase'} (${d.hora_inicio}–${d.hora_fin})`;
    return `${turno}: el profesor ya tiene a ${d.alumno ?? 'otro alumno'} en ${d.clase ?? 'otra clase'} (${d.hora_inicio}–${d.hora_fin})`;
  });
}

// ─── Formato ────────────────────────────────────────────────────────────────
export const pesos = (v: number | string | null | undefined): string => {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: n % 1 ? 2 : 0,
  });
};

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];
/** '2026-12-01' o '2026-12' → 'diciembre 2026'. */
export const nombreMes = (periodo: string): string => {
  const [a, m] = periodo.split('-').map(Number);
  return MESES[m - 1] ? `${MESES[m - 1]} ${a}` : periodo;
};

export const fechaCorta = (f: string | null | undefined): string => {
  if (!f) return '—';
  const [a, m, d] = f.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
};

// ─── Formulario de personas ─────────────────────────────────────────────────
export type EntidadPersona = 'profesores' | 'tutores' | 'alumnos';

export interface DatosPersona {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fecha_nacimiento?: string;
  tutor_id?: number | '' | null;
  crear_acceso?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** ¿Puede tener acceso propio? El menor (o el alumno con tutor) entra por su tutor. */
export const admiteAccesoPropio = (
  entidad: EntidadPersona,
  d: Pick<DatosPersona, 'fecha_nacimiento' | 'tutor_id'>,
  ref: string = hoy(),
): boolean =>
  entidad !== 'alumnos' ||
  (!!d.fecha_nacimiento &&
    !esMenor(d.fecha_nacimiento, ref) &&
    edad(d.fecha_nacimiento, ref) !== null &&
    !d.tutor_id);

/** Errores por campo (vacío = válido). Mismas reglas que la API. */
export function validarPersona(
  entidad: EntidadPersona,
  d: DatosPersona,
  ref: string = hoy(),
): Record<string, string> {
  const e: Record<string, string> = {};
  if (d.nombre.trim().length < 2) e.nombre = 'Ingresá el nombre';
  if (d.apellido.trim().length < 2) e.apellido = 'Ingresá el apellido';
  if (entidad === 'tutores' && !d.telefono.trim())
    e.telefono = 'El teléfono del tutor es obligatorio';
  if (d.telefono.trim() && !/^[\d\s()+-]{6,30}$/.test(d.telefono.trim()))
    e.telefono = 'Teléfono inválido';
  if (d.email.trim() && !EMAIL_RE.test(d.email.trim()))
    e.email = 'Email inválido';
  if (entidad === 'alumnos') {
    const años = d.fecha_nacimiento ? edad(d.fecha_nacimiento, ref) : null;
    if (años === null) e.fecha_nacimiento = 'Ingresá la fecha de nacimiento';
    else if (años < 0 || años > 110)
      e.fecha_nacimiento = 'Fecha fuera de rango';
    else if (años < MAYORIA_EDAD && !d.tutor_id)
      e.tutor_id = `Es menor de ${MAYORIA_EDAD}: elegí un tutor`;
  }
  if (d.crear_acceso) {
    if (!admiteAccesoPropio(entidad, d, ref))
      e.crear_acceso =
        'Un alumno menor o con tutor entra con el acceso del tutor';
    else if (!d.email.trim()) e.email = 'Para dar acceso hace falta un email';
  }
  return e;
}
