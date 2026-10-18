'use client';

import type { Inscripcion } from '@/app/lib/edu/edu.api';
import { fechaCorta, formatHorario } from '@/app/lib/edu/reglas';
import ResponsiveTable, { Columna } from '@/components/ui/ResponsiveTable';
import Link from 'next/link';
import { Etiqueta } from './ui';

/** Tabla de inscripciones reutilizada en la lista y en las fichas. */
export default function InscripcionesTabla({
  datos,
  ocultar = [],
  vacio,
  base = '/dashboard/academia/inscripciones',
}: {
  datos: Inscripcion[];
  ocultar?: ('alumno' | 'profesor' | 'clase')[];
  vacio?: {
    titulo: string;
    mensaje?: string;
    accion?: { label: string; onClick: () => void };
  };
  /** null = sin link al detalle (vista propia). */
  base?: string | null;
}) {
  const columnas: Columna<Inscripcion>[] = [];
  if (!ocultar.includes('alumno')) {
    columnas.push({
      key: 'alumno',
      header: 'Alumno',
      mobile: 'primary',
      sortValue: (i) => i.alumno.toLowerCase(),
      render: (i) =>
        base ? (
          <Link
            href={`${base}/${i.id}`}
            className="font-semibold text-brand-800 hover:underline"
          >
            {i.alumno}
          </Link>
        ) : (
          <span className="font-semibold text-brand-800">{i.alumno}</span>
        ),
    });
  }
  if (!ocultar.includes('clase')) {
    columnas.push({
      key: 'clase',
      header: 'Clase',
      mobile: ocultar.includes('alumno') ? 'primary' : 'secondary',
      sortValue: (i) => i.clase.toLowerCase(),
      render: (i) => (
        <span className="flex flex-wrap items-center gap-1">
          {base && ocultar.includes('alumno') ? (
            <Link
              href={`${base}/${i.id}`}
              className="font-semibold text-brand-800 hover:underline"
            >
              {i.clase}
            </Link>
          ) : (
            i.clase
          )}
          {i.es_grupal && <Etiqueta>Taller</Etiqueta>}
        </span>
      ),
    });
  }
  if (!ocultar.includes('profesor')) {
    columnas.push({
      key: 'profesor',
      header: 'Profesor',
      mobile: 'secondary',
      sortValue: (i) => i.profesor.toLowerCase(),
      render: (i) => i.profesor,
    });
  }
  columnas.push(
    {
      key: 'horarios',
      header: 'Horarios',
      mobile: 'secondary',
      render: (i) =>
        i.horarios.length
          ? i.horarios.map((h) => formatHorario(h)).join(' · ')
          : '—',
    },
    {
      key: 'ciclo',
      header: 'Ciclo',
      mobile: 'meta',
      sortValue: (i) => i.ciclo,
      render: (i) => i.ciclo,
    },
    {
      key: 'estado',
      header: 'Estado',
      mobile: 'meta',
      render: (i) =>
        i.fecha_baja ? (
          <Etiqueta tono="apagado">Baja {fechaCorta(i.fecha_baja)}</Etiqueta>
        ) : (
          <Etiqueta tono="ok">Activa</Etiqueta>
        ),
    },
  );

  return (
    <ResponsiveTable
      datos={datos}
      columnas={columnas}
      rowKey={(i) => i.id}
      vacio={vacio ?? { titulo: 'Sin inscripciones' }}
      acciones={
        base
          ? (i) => (
              <Link
                href={`${base}/${i.id}`}
                className="rounded-lg px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
              >
                Ver
              </Link>
            )
          : undefined
      }
    />
  );
}
