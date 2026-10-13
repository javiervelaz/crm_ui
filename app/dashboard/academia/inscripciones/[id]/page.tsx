'use client';

import {
  actualizarHorarios,
  actualizarInscripcion,
  darDeBajaInscripcion,
  getInscripcion,
  listarPersonas,
  type Inscripcion,
  type Profesor,
} from '@/app/lib/edu/edu.api';
import {
  erroresHorarios,
  errorDeApi,
  esFecha,
  fechaCorta,
  hoy,
  lineasConflicto,
  type ErrorApi,
  type Horario,
} from '@/app/lib/edu/reglas';
import { logError } from '@/app/lib/logger';
import { notifySuccess } from '@/app/lib/notificationService';
import Dialog from '@/components/ui/Dialog';
import ErrorState from '@/components/ui/ErrorState';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import HorariosEditor from '../../componentes/HorariosEditor';
import {
  AvisoError,
  BotonPrimario,
  BotonSecundario,
  Campo,
  claseCampo,
  Encabezado,
  Etiqueta,
  Tarjeta,
} from '../../componentes/ui';

export default function InscripcionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const insId = Number(id);
  const [ins, setIns] = useState<Inscripcion | null>(null);
  const [error, setError] = useState(false);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [intento, setIntento] = useState(false);
  const [errorHorarios, setErrorHorarios] = useState<ErrorApi | null>(null);
  const [guardandoHorarios, setGuardandoHorarios] = useState(false);
  const [cambiandoProfesor, setCambiandoProfesor] = useState(false);
  const [dandoBaja, setDandoBaja] = useState(false);
  const [errorAccion, setErrorAccion] = useState<ErrorApi | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(false);
      const i = await getInscripcion(insId);
      setIns(i);
      setHorarios(
        i.horarios.map(({ dia_semana, hora_inicio, hora_fin }) => ({
          dia_semana,
          hora_inicio,
          hora_fin,
        })),
      );
    } catch (err) {
      logError('Error al cargar la inscripción', err);
      setError(true);
    }
  }, [insId]);

  useEffect(() => {
    cargar();
  }, [cargar]);
  useEffect(() => {
    listarPersonas('profesores', { activo: 'true' })
      .then(setProfesores)
      .catch((err) => logError('Error al cargar profesores', err));
  }, []);

  if (error)
    return (
      <ErrorState onRetry={cargar} titulo="No pudimos cargar la inscripción" />
    );
  if (!ins) return <div className="h-40 animate-pulse rounded-xl bg-white" />;

  const deBaja = !!ins.fecha_baja && ins.fecha_baja < hoy();
  const original = JSON.stringify(
    ins.horarios.map(({ dia_semana, hora_inicio, hora_fin }) => ({
      dia_semana,
      hora_inicio,
      hora_fin,
    })),
  );
  const cambiaron = JSON.stringify(horarios) !== original;
  const { general, porFila } = erroresHorarios(horarios);
  const invalidos = !!general || Object.keys(porFila).length > 0;

  const guardarHorarios = async () => {
    setIntento(true);
    if (invalidos || guardandoHorarios) return;
    setGuardandoHorarios(true);
    setErrorHorarios(null);
    try {
      await actualizarHorarios(ins.id, horarios);
      notifySuccess('Horarios actualizados');
      setIntento(false);
      await cargar();
    } catch (err) {
      setErrorHorarios(errorDeApi(err, 'No se pudieron guardar los horarios'));
    } finally {
      setGuardandoHorarios(false);
    }
  };

  const reactivar = async () => {
    setErrorAccion(null);
    try {
      await actualizarInscripcion(ins.id, { fecha_baja: null });
      notifySuccess('Inscripción reactivada');
      cargar();
    } catch (err) {
      setErrorAccion(errorDeApi(err, 'No se pudo reactivar'));
    }
  };

  const conflictos = (errorHorarios?.detalle ?? [])
    .map((d) => d.horario)
    .filter(Boolean) as Horario[];

  return (
    <div className="space-y-4">
      <Encabezado
        volver={{
          href: '/dashboard/academia/inscripciones',
          label: 'Inscripciones',
        }}
        titulo={`${ins.alumno} · ${ins.clase}`}
        subtitulo={
          <span className="flex flex-wrap items-center gap-2">
            Ciclo {ins.ciclo} · alta {fechaCorta(ins.fecha_alta)}
            {ins.es_grupal && <Etiqueta>Taller</Etiqueta>}
            {ins.fecha_baja ? (
              <Etiqueta tono="apagado">
                Baja {fechaCorta(ins.fecha_baja)}
              </Etiqueta>
            ) : (
              <Etiqueta tono="ok">Activa</Etiqueta>
            )}
          </span>
        }
        acciones={
          ins.fecha_baja ? (
            <BotonSecundario type="button" onClick={reactivar}>
              Quitar la baja
            </BotonSecundario>
          ) : (
            <BotonSecundario
              type="button"
              onClick={() => {
                setErrorAccion(null);
                setDandoBaja(true);
              }}
            >
              Dar de baja
            </BotonSecundario>
          )
        }
      />
      {errorAccion && !dandoBaja && (
        <AvisoError
          mensaje={errorAccion.mensaje}
          lineas={lineasConflicto(errorAccion)}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Tarjeta titulo="Datos">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-brand-400">Alumno</dt>
              <dd>
                <Link
                  className="font-medium text-brand-800 underline"
                  href={`/dashboard/academia/alumnos/${ins.alumno_id}`}
                >
                  {ins.alumno}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-brand-400">Clase</dt>
              <dd>
                <Link
                  className="font-medium text-brand-800 underline"
                  href={`/dashboard/academia/clases/${ins.clase_id}`}
                >
                  {ins.clase}
                </Link>{' '}
                <span className="text-brand-400">({ins.tipo_clase})</span>
              </dd>
            </div>
            <div>
              <dt className="text-brand-400">Profesor</dt>
              <dd className="flex items-center justify-between gap-2">
                <Link
                  className="font-medium text-brand-800 underline"
                  href={`/dashboard/academia/profesores/${ins.profesor_id}`}
                >
                  {ins.profesor}
                </Link>
                {!deBaja && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorAccion(null);
                      setCambiandoProfesor(true);
                    }}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50"
                  >
                    Cambiar
                  </button>
                )}
              </dd>
            </div>
          </dl>
        </Tarjeta>

        <div className="lg:col-span-2">
          <Tarjeta titulo="Horarios">
            {deBaja ? (
              <p className="text-sm text-brand-400">
                La inscripción está dada de baja: sus turnos quedaron libres.
              </p>
            ) : (
              <div className="space-y-3">
                <HorariosEditor
                  horarios={horarios}
                  onChange={(h) => {
                    setHorarios(h);
                    setErrorHorarios(null);
                  }}
                  mostrarErrores={intento}
                  conflictos={conflictos}
                />
                {errorHorarios && (
                  <AvisoError
                    mensaje={errorHorarios.mensaje}
                    lineas={lineasConflicto(errorHorarios)}
                  />
                )}
                <div className="flex justify-end gap-2">
                  {cambiaron && (
                    <BotonSecundario
                      type="button"
                      onClick={() => {
                        setHorarios(JSON.parse(original));
                        setErrorHorarios(null);
                        setIntento(false);
                      }}
                    >
                      Descartar
                    </BotonSecundario>
                  )}
                  <BotonPrimario
                    type="button"
                    onClick={guardarHorarios}
                    cargando={guardandoHorarios}
                    disabled={!cambiaron}
                  >
                    Guardar horarios
                  </BotonPrimario>
                </div>
              </div>
            )}
          </Tarjeta>
        </div>
      </div>

      {cambiandoProfesor && (
        <CambiarProfesorDialog
          ins={ins}
          profesores={profesores}
          onClose={() => setCambiandoProfesor(false)}
          onGuardado={() => {
            setCambiandoProfesor(false);
            cargar();
          }}
        />
      )}
      {dandoBaja && (
        <BajaDialog
          ins={ins}
          onClose={() => setDandoBaja(false)}
          onGuardado={() => {
            setDandoBaja(false);
            cargar();
          }}
        />
      )}
    </div>
  );
}

function CambiarProfesorDialog({
  ins,
  profesores,
  onClose,
  onGuardado,
}: {
  ins: Inscripcion;
  profesores: Profesor[];
  onClose: () => void;
  onGuardado: () => void;
}) {
  const [profesorId, setProfesorId] = useState<number>(ins.profesor_id);
  const [error, setError] = useState<ErrorApi | null>(null);
  const [guardando, setGuardando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (profesorId === ins.profesor_id || guardando) return;
    setGuardando(true);
    try {
      await actualizarInscripcion(ins.id, { profesor_id: profesorId });
      notifySuccess('Profesor actualizado');
      onGuardado();
    } catch (err) {
      setError(errorDeApi(err, 'No se pudo cambiar el profesor'));
      setGuardando(false);
    }
  };

  return (
    <Dialog titulo="Cambiar profesor" onClose={onClose} bloquear={guardando}>
      <form onSubmit={enviar} className="space-y-4" noValidate>
        <Campo
          id="nuevo-profesor"
          label="Profesor"
          requerido
          ayuda="Se mantienen los horarios: el nuevo profesor tiene que tenerlos libres."
        >
          <select
            id="nuevo-profesor"
            value={profesorId}
            onChange={(e) => {
              setProfesorId(Number(e.target.value));
              setError(null);
            }}
            className={claseCampo}
          >
            {!profesores.some((p) => p.id === ins.profesor_id) && (
              <option value={ins.profesor_id}>{ins.profesor}</option>
            )}
            {profesores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.apellido}, {p.nombre}
              </option>
            ))}
          </select>
        </Campo>
        {error && (
          <AvisoError mensaje={error.mensaje} lineas={lineasConflicto(error)} />
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <BotonSecundario type="button" onClick={onClose} disabled={guardando}>
            Cancelar
          </BotonSecundario>
          <BotonPrimario
            type="submit"
            cargando={guardando}
            disabled={profesorId === ins.profesor_id}
          >
            Guardar
          </BotonPrimario>
        </div>
      </form>
    </Dialog>
  );
}

function BajaDialog({
  ins,
  onClose,
  onGuardado,
}: {
  ins: Inscripcion;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const [fecha, setFecha] = useState(
    hoy() < ins.fecha_alta ? ins.fecha_alta : hoy(),
  );
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const invalida = !esFecha(fecha) || fecha < ins.fecha_alta;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (invalida || guardando) return;
    setGuardando(true);
    try {
      await darDeBajaInscripcion(ins.id, fecha);
      notifySuccess('Inscripción dada de baja');
      onGuardado();
    } catch (err) {
      setError(errorDeApi(err, 'No se pudo dar de baja').mensaje);
      setGuardando(false);
    }
  };

  return (
    <Dialog
      titulo={`Dar de baja a ${ins.alumno}`}
      onClose={onClose}
      bloquear={guardando}
    >
      <form onSubmit={enviar} className="space-y-4" noValidate>
        <p className="text-sm text-brand-600">
          Deja de cursar {ins.clase}. Sus turnos quedan libres desde el día
          siguiente a la baja.
        </p>
        <Campo
          id="fecha-baja"
          label="Fecha de baja"
          requerido
          error={
            fecha && fecha < ins.fecha_alta
              ? `No puede ser anterior al alta (${fechaCorta(ins.fecha_alta)})`
              : undefined
          }
        >
          <input
            id="fecha-baja"
            type="date"
            min={ins.fecha_alta}
            value={fecha}
            onChange={(e) => {
              setFecha(e.target.value);
              setError(null);
            }}
            className={claseCampo}
          />
        </Campo>
        {error && <AvisoError mensaje={error} />}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <BotonSecundario type="button" onClick={onClose} disabled={guardando}>
            Cancelar
          </BotonSecundario>
          <BotonPrimario type="submit" cargando={guardando} disabled={invalida}>
            Dar de baja
          </BotonPrimario>
        </div>
      </form>
    </Dialog>
  );
}
