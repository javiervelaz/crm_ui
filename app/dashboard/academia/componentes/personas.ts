import type { EntidadPersona } from '@/app/lib/edu/reglas';

/** Textos por entidad para las pantallas genéricas de personas. */
export const TEXTOS: Record<
  EntidadPersona,
  {
    singular: string;
    plural: string;
    nuevo: string;
    articulo: 'el' | 'la';
    vacio: string;
    base: string;
  }
> = {
  profesores: {
    singular: 'profesor',
    plural: 'Profesores',
    nuevo: 'Nuevo profesor',
    articulo: 'el',
    vacio: 'Cargá a los profesores para poder asignarles inscripciones.',
    base: '/dashboard/academia/profesores',
  },
  tutores: {
    singular: 'tutor',
    plural: 'Tutores',
    nuevo: 'Nuevo tutor',
    articulo: 'el',
    vacio:
      'Los tutores son los responsables de los alumnos menores. Con su acceso ven las clases de sus hijos.',
    base: '/dashboard/academia/tutores',
  },
  alumnos: {
    singular: 'alumno',
    plural: 'Alumnos',
    nuevo: 'Nuevo alumno',
    articulo: 'el',
    vacio:
      'Cargá al primer alumno; si es menor de 18, primero cargá a su tutor.',
    base: '/dashboard/academia/alumnos',
  },
};

export const nombreCompleto = (p: { nombre: string; apellido: string }) =>
  `${p.nombre} ${p.apellido}`;
