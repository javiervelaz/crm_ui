'use client';

import {
  listarClases,
  listarInscripciones,
  listarPersonas,
  type Clase,
  type Inscripcion,
  type Profesor,
} from '@/app/lib/edu/edu.api';
import { hoy } from '@/app/lib/edu/reglas';
import { logError } from '@/app/lib/logger';
import { TableSkeleton } from '@/app/ui/TableSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import InscripcionesTabla from '../componentes/InscripcionesTabla';
import { BotonPrimario, claseCampo, Encabezado } from '../componentes/ui';

export default function InscripcionesPage() {
  const router = useRouter();
  const anio = Number(hoy().slice(0, 4));
  const [datos, setDatos] = useState<Inscripcion[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [ciclo, setCiclo] = useState<number | ''>(anio);
  const [profesorId, setProfesorId] = useState<number | ''>('');
  const [claseId, setClaseId] = useState<number | ''>('');
  const [conBajas, setConBajas] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    Promise.all([listarPersonas('profesores'), listarClases()])
      .then(([ps, cs]) => {
        setProfesores(ps);
        setClases(cs);
      })
      .catch((err) => logError('Error al cargar filtros', err));
  }, []);

  const cargar = useCallback(async () => {
    try {
      setError(false);
      setCargando(true);
      setDatos(
        await listarInscripciones({
          ciclo: ciclo || undefined,
          profesor_id: profesorId || undefined,
          clase_id: claseId || undefined,
          todas: conBajas ? 'true' : undefined,
        }),
      );
    } catch (err) {
      logError('Error al cargar inscripciones', err);
      setError(true);
    } finally {
      setCargando(false);
    }
  }, [ciclo, profesorId, claseId, conBajas]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? datos.filter((i) => i.alumno.toLowerCase().includes(t)) : datos;
  }, [datos, q]);

  const filtrosActivos = !!(
    profesorId ||
    claseId ||
    conBajas ||
    q ||
    ciclo !== anio
  );

  return (
    <div>
      <Encabezado
        titulo="Inscripciones"
        subtitulo="Alumno, clase, profesor y horarios por ciclo lectivo"
        acciones={
          <BotonPrimario
            type="button"
            onClick={() =>
              router.push('/dashboard/academia/inscripciones/nueva')
            }
          >
            Nueva inscripción
          </BotonPrimario>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="relative lg:col-span-2">
          <span className="sr-only">Buscar alumno</span>
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-300"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar alumno"
            className={`${claseCampo} pl-9`}
          />
        </label>
        <label>
          <span className="sr-only">Profesor</span>
          <select
            value={profesorId}
            onChange={(e) =>
              setProfesorId(e.target.value ? Number(e.target.value) : '')
            }
            className={claseCampo}
          >
            <option value="">Todos los profesores</option>
            {profesores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.apellido}, {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Clase</span>
          <select
            value={claseId}
            onChange={(e) =>
              setClaseId(e.target.value ? Number(e.target.value) : '')
            }
            className={claseCampo}
          >
            <option value="">Todas las clases</option>
            {clases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
                {c.es_grupal ? ' (taller)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Ciclo</span>
          <select
            value={ciclo}
            onChange={(e) =>
              setCiclo(e.target.value ? Number(e.target.value) : '')
            }
            className={claseCampo}
          >
            {[anio + 1, anio, anio - 1].map((a) => (
              <option key={a} value={a}>
                Ciclo {a}
              </option>
            ))}
            <option value="">Todos los ciclos</option>
          </select>
        </label>
      </div>
      <label className="mb-3 inline-flex items-center gap-2 text-sm text-brand-600">
        <input
          type="checkbox"
          checked={conBajas}
          onChange={(e) => setConBajas(e.target.checked)}
          className="h-4 w-4 rounded border-brand-300 text-brand-600"
        />
        Incluir dadas de baja
      </label>

      {cargando ? (
        <TableSkeleton rows={5} cols={5} withFilter={false} />
      ) : error ? (
        <ErrorState onRetry={cargar} />
      ) : (
        <InscripcionesTabla
          datos={filtradas}
          vacio={
            filtrosActivos
              ? {
                  titulo: 'Sin resultados',
                  mensaje: 'Probá con otros filtros.',
                }
              : {
                  titulo: 'Todavía no hay inscripciones',
                  mensaje:
                    'Inscribí a un alumno en una clase con su profesor y sus horarios.',
                  accion: {
                    label: 'Nueva inscripción',
                    onClick: () =>
                      router.push('/dashboard/academia/inscripciones/nueva'),
                  },
                }
          }
        />
      )}
    </div>
  );
}
