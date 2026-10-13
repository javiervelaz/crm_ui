'use client';

import { agenda, listarPersonas, type Profesor } from '@/app/lib/edu/edu.api';
import { hoy, type TurnoAgenda } from '@/app/lib/edu/reglas';
import { logError } from '@/app/lib/logger';
import ErrorState from '@/components/ui/ErrorState';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import AgendaSemanal from '../componentes/AgendaSemanal';
import { claseCampo, Encabezado } from '../componentes/ui';

function Agenda() {
  const router = useRouter();
  const params = useSearchParams();
  const anio = Number(hoy().slice(0, 4));
  const profesorId = Number(params.get('profesor_id')) || '';
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [turnos, setTurnos] = useState<TurnoAgenda[] | null>(null);
  const [error, setError] = useState(false);
  const [ciclo, setCiclo] = useState(anio);

  useEffect(() => {
    listarPersonas('profesores', { activo: 'true' })
      .then(setProfesores)
      .catch((err) => logError('Error al cargar profesores', err));
  }, []);

  const cargar = useCallback(async () => {
    try {
      setError(false);
      setTurnos(null);
      setTurnos(await agenda({ profesor_id: profesorId || undefined, ciclo }));
    } catch (err) {
      logError('Error al cargar la agenda', err);
      setError(true);
    }
  }, [profesorId, ciclo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <div>
      <Encabezado
        titulo="Agenda semanal"
        subtitulo="Turnos de las inscripciones activas"
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:w-2/3">
        <label>
          <span className="sr-only">Profesor</span>
          <select
            value={profesorId}
            onChange={(e) =>
              router.replace(
                e.target.value
                  ? `/dashboard/academia/agenda?profesor_id=${e.target.value}`
                  : '/dashboard/academia/agenda',
              )
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
          <span className="sr-only">Ciclo</span>
          <select
            value={ciclo}
            onChange={(e) => setCiclo(Number(e.target.value))}
            className={claseCampo}
          >
            {[anio + 1, anio, anio - 1].map((a) => (
              <option key={a} value={a}>
                Ciclo {a}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? (
        <ErrorState onRetry={cargar} />
      ) : turnos === null ? (
        <div className="h-64 animate-pulse rounded-xl bg-white" />
      ) : (
        <AgendaSemanal turnos={turnos} mostrarProfesor={!profesorId} />
      )}
    </div>
  );
}

export default function AgendaPage() {
  return (
    <Suspense fallback={null}>
      <Agenda />
    </Suspense>
  );
}
