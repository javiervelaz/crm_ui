'use client';

import {
  miAgenda,
  miPerfil,
  misInscripciones,
  type Alumno,
  type Inscripcion,
  type Profesor,
  type Tutor,
} from '@/app/lib/edu/edu.api';
import {
  clasesPorAlumno,
  formatHorario,
  hoy,
  type TurnoAgenda,
} from '@/app/lib/edu/reglas';
import { logError } from '@/app/lib/logger';
import type { SessionToken } from '@/app/lib/modules';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { jwtDecode } from 'jwt-decode';
import { CalendarDays, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AgendaSemanal from '../academia/componentes/AgendaSemanal';
import { Etiqueta, Tarjeta } from '../academia/componentes/ui';

/**
 * Vista propia de profesor, tutor y alumno (crm_api /api/edu/mis/*).
 * El profesor ve su semana y sus alumnos; el tutor, las clases de sus hijos;
 * el alumno, las suyas. La API filtra: acá no hay nada ajeno que esconder.
 */
export default function MisClasesPage() {
  const [tipo, setTipo] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<Profesor | Tutor | Alumno | null>(null);
  const [inscripciones, setInscripciones] = useState<Inscripcion[] | null>(
    null,
  );
  const [turnos, setTurnos] = useState<TurnoAgenda[]>([]);
  const [error, setError] = useState<string | null>(null);
  const ciclo = Number(hoy().slice(0, 4));

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      setTipo(token ? (jwtDecode<SessionToken>(token).tipo ?? null) : null);
      const [p, ins, ag] = await Promise.all([
        miPerfil(),
        misInscripciones({ ciclo }),
        miAgenda({ ciclo }),
      ]);
      setPerfil(p);
      setInscripciones(ins);
      setTurnos(ag);
    } catch (err) {
      logError('Error al cargar mis clases', err);
      const code = (err as { response?: { data?: { code?: string } } })
        ?.response?.data?.code;
      setError(
        code === 'SIN_FICHA'
          ? 'Tu usuario todavía no está vinculado a una ficha de la academia. Avisale a la academia.'
          : 'No pudimos cargar tus clases.',
      );
    }
  }, [ciclo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Tutor: una tarjeta por alumno a cargo, tenga o no clases este ciclo.
  const porAlumno = useMemo(
    () =>
      clasesPorAlumno(
        (perfil as Tutor | null)?.alumnos ?? [],
        inscripciones ?? [],
      ),
    [perfil, inscripciones],
  );

  if (error)
    return <ErrorState titulo="Mis clases" mensaje={error} onRetry={cargar} />;
  if (!perfil || !inscripciones)
    return <div className="h-48 animate-pulse rounded-xl bg-white" />;

  const esProfesor = tipo === 'PROF';
  const esTutor = tipo === 'TUT';

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <div>
        <h1 className="font-display text-2xl text-brand-800">
          Hola, {perfil.nombre}
        </h1>
        <p className="text-sm text-brand-400">
          {esProfesor
            ? `Tenés ${inscripciones.length} ${inscripciones.length === 1 ? 'alumno' : 'alumnos'} este ciclo.`
            : esTutor
              ? `Alumnos a tu cargo y sus clases del ciclo ${ciclo}.`
              : 'Tus clases de este ciclo.'}
        </p>
      </div>

      {inscripciones.length > 0 && (
        <Tarjeta titulo="Semana">
          <AgendaSemanal
            turnos={turnos}
            mostrarProfesor={!esProfesor}
            linkInscripcion={false}
          />
        </Tarjeta>
      )}

      {esTutor ? (
        porAlumno.length ? (
          porAlumno.map((g) => (
            <Tarjeta key={g.alumno_id} titulo={g.nombre}>
              {g.clases.length ? (
                <ListaClases lista={g.clases} mostrar="profesor" />
              ) : (
                <p className="py-2 text-sm text-brand-400">
                  Sin clases en el ciclo {ciclo}.
                </p>
              )}
            </Tarjeta>
          ))
        ) : (
          <EmptyState
            icono={Users}
            titulo="No tenés alumnos a cargo"
            mensaje="Cuando la academia te asigne un alumno, lo vas a ver acá."
          />
        )
      ) : !inscripciones.length ? (
        <EmptyState
          icono={CalendarDays}
          titulo="Todavía no hay clases"
          mensaje="Cuando la academia cargue una inscripción, la vas a ver acá."
        />
      ) : (
        <Tarjeta titulo={esProfesor ? 'Mis alumnos' : 'Mis clases'}>
          <ListaClases
            lista={inscripciones}
            mostrar={esProfesor ? 'alumno' : 'profesor'}
          />
        </Tarjeta>
      )}
    </div>
  );
}

function ListaClases({
  lista,
  mostrar,
}: {
  lista: Inscripcion[];
  mostrar: 'alumno' | 'profesor';
}) {
  return (
    <ul className="divide-y divide-brand-50">
      {lista.map((i) => (
        <li
          key={i.id}
          className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <p className="font-semibold text-brand-800">
              {mostrar === 'alumno' ? i.alumno : i.clase}{' '}
              {i.es_grupal && <Etiqueta>Taller</Etiqueta>}
            </p>
            <p className="text-sm text-brand-400">
              {mostrar === 'alumno' ? i.clase : `con ${i.profesor}`}
            </p>
          </div>
          <p className="text-sm text-brand-600">
            {i.horarios.map((h) => formatHorario(h)).join(' · ')}
          </p>
        </li>
      ))}
    </ul>
  );
}
