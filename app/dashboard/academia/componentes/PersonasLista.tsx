'use client';

import {
  listarPersonas,
  type Alumno,
  type Profesor,
  type Tutor,
} from '@/app/lib/edu/edu.api';
import type { EntidadPersona } from '@/app/lib/edu/reglas';
import { logError } from '@/app/lib/logger';
import { TableSkeleton } from '@/app/ui/TableSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import ResponsiveTable, { Columna } from '@/components/ui/ResponsiveTable';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { nombreCompleto, TEXTOS } from './personas';
import { BotonPrimario, Encabezado, Etiqueta, claseCampo } from './ui';

type Persona = Profesor | Tutor | Alumno;
type Filtro = 'true' | 'false' | 'todos';

export default function PersonasLista({
  entidad,
}: {
  entidad: EntidadPersona;
}) {
  const t = TEXTOS[entidad];
  const router = useRouter();
  const [datos, setDatos] = useState<Persona[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [q, setQ] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [activo, setActivo] = useState<Filtro>('true');

  // Búsqueda con espera corta para no pedir en cada tecla.
  useEffect(() => {
    const id = setTimeout(() => setBusqueda(q.trim()), 300);
    return () => clearTimeout(id);
  }, [q]);

  const cargar = useCallback(async () => {
    try {
      setError(false);
      setCargando(true);
      setDatos(
        await listarPersonas(entidad, {
          q: busqueda || undefined,
          activo: activo === 'todos' ? undefined : activo,
        }),
      );
    } catch (err) {
      logError(`Error al cargar ${entidad}`, err);
      setError(true);
    } finally {
      setCargando(false);
    }
  }, [entidad, busqueda, activo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const columnas: Columna<Persona>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      mobile: 'primary',
      sortValue: (p) => `${p.apellido} ${p.nombre}`.toLowerCase(),
      render: (p) => (
        <Link
          href={`${t.base}/${p.id}`}
          className="font-semibold text-brand-800 hover:underline"
        >
          {p.apellido}, {p.nombre}
        </Link>
      ),
    },
  ];
  if (entidad === 'alumnos') {
    columnas.push(
      {
        key: 'edad',
        header: 'Edad',
        mobile: 'meta',
        sortValue: (p) => (p as Alumno).edad,
        render: (p) => `${(p as Alumno).edad} años`,
      },
      {
        key: 'tutor',
        header: 'Tutor',
        mobile: 'secondary',
        render: (p) => (p as Alumno).tutor ?? '—',
      },
      {
        key: 'insc',
        header: 'Clases',
        mobile: 'hidden',
        align: 'right',
        sortValue: (p) => (p as Alumno).inscripciones_activas,
        render: (p) => (p as Alumno).inscripciones_activas,
      },
    );
  }
  if (entidad === 'tutores') {
    columnas.push({
      key: 'alumnos',
      header: 'Alumnos',
      mobile: 'meta',
      align: 'right',
      sortValue: (p) => (p as Tutor).alumnos_activos,
      render: (p) => (p as Tutor).alumnos_activos,
    });
  }
  if (entidad === 'profesores') {
    columnas.push({
      key: 'insc',
      header: 'Alumnos activos',
      mobile: 'meta',
      align: 'right',
      sortValue: (p) => (p as Profesor).inscripciones_activas,
      render: (p) => (p as Profesor).inscripciones_activas,
    });
  }
  columnas.push(
    {
      key: 'contacto',
      header: 'Contacto',
      mobile: 'secondary',
      render: (p) => [p.telefono, p.email].filter(Boolean).join(' · ') || '—',
    },
    {
      key: 'estado',
      header: 'Estado',
      mobile: 'meta',
      render: (p) => (
        <span className="flex flex-wrap gap-1">
          {!p.activo && <Etiqueta tono="apagado">Inactivo</Etiqueta>}
          {p.user_id ? (
            <Etiqueta tono="ok">Con acceso</Etiqueta>
          ) : (
            <Etiqueta>Sin acceso</Etiqueta>
          )}
        </span>
      ),
    },
  );

  return (
    <div>
      <Encabezado
        titulo={t.plural}
        acciones={
          <BotonPrimario
            type="button"
            onClick={() => router.push(`${t.base}/nuevo`)}
          >
            {t.nuevo}
          </BotonPrimario>
        }
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar</span>
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-300"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono"
            className={`${claseCampo} pl-9`}
          />
        </label>
        <label className="sm:w-48">
          <span className="sr-only">Estado</span>
          <select
            value={activo}
            onChange={(e) => setActivo(e.target.value as Filtro)}
            className={claseCampo}
          >
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
            <option value="todos">Todos</option>
          </select>
        </label>
      </div>

      {cargando ? (
        <TableSkeleton rows={5} cols={4} withFilter={false} />
      ) : error ? (
        <ErrorState onRetry={cargar} />
      ) : (
        <ResponsiveTable
          datos={datos}
          columnas={columnas}
          rowKey={(p) => p.id}
          vacio={
            busqueda || activo !== 'true'
              ? {
                  titulo: 'Sin resultados',
                  mensaje: 'Probá con otra búsqueda o filtro.',
                }
              : {
                  titulo: `Todavía no hay ${t.plural.toLowerCase()}`,
                  mensaje: t.vacio,
                  accion: {
                    label: t.nuevo,
                    onClick: () => router.push(`${t.base}/nuevo`),
                  },
                }
          }
          acciones={(p) => (
            <Link
              href={`${t.base}/${p.id}`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
            >
              Ver
            </Link>
          )}
        />
      )}
    </div>
  );
}

export { nombreCompleto };
