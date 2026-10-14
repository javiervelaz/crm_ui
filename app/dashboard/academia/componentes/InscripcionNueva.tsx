'use client';

import {
  crearInscripcion,
  listarClases,
  listarPersonas,
  type Alumno,
  type Clase,
  type Profesor,
} from '@/app/lib/edu/edu.api';
import {
  erroresHorarios,
  errorDeApi,
  esFecha,
  hoy,
  lineasConflicto,
  pesos,
  type ErrorApi,
  type Horario,
} from '@/app/lib/edu/reglas';
import { logError } from '@/app/lib/logger';
import { notifySuccess } from '@/app/lib/notificationService';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import HorariosEditor from './HorariosEditor';
import {
  AvisoError,
  BotonPrimario,
  BotonSecundario,
  Campo,
  claseCampo,
  Encabezado,
  Tarjeta,
} from './ui';

export default function InscripcionNueva() {
  const router = useRouter();
  const params = useSearchParams();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [alumnoId, setAlumnoId] = useState<number | ''>(
    Number(params.get('alumno_id')) || '',
  );
  const [claseId, setClaseId] = useState<number | ''>('');
  const [profesorId, setProfesorId] = useState<number | ''>('');
  const [fechaAlta, setFechaAlta] = useState(hoy());
  const [ciclo, setCiclo] = useState(Number(hoy().slice(0, 4)));
  const anioAlta = Number((esFecha(fechaAlta) ? fechaAlta : hoy()).slice(0, 4));
  const [horarios, setHorarios] = useState<Horario[]>([
    { dia_semana: 1, hora_inicio: '17:00', hora_fin: '18:00' },
  ]);
  const [intento, setIntento] = useState(false);
  const [errorApi, setErrorApi] = useState<ErrorApi | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    Promise.all([
      listarPersonas('alumnos', { activo: 'true' }),
      listarClases(true),
      listarPersonas('profesores', { activo: 'true' }),
    ])
      .then(([a, c, p]) => {
        setAlumnos(a);
        setClases(c);
        setProfesores(p);
      })
      .catch((err) => logError('Error al cargar datos de la inscripción', err));
  }, []);

  const clase = clases.find((c) => c.id === claseId);
  const errores: Record<string, string> = {};
  if (!alumnoId) errores.alumno_id = 'Elegí el alumno';
  if (!claseId) errores.clase_id = 'Elegí la clase';
  if (!profesorId) errores.profesor_id = 'Elegí el profesor';
  if (!esFecha(fechaAlta)) errores.fecha_alta = 'Fecha inválida';
  const horariosInvalidos =
    !!erroresHorarios(horarios).general ||
    Object.keys(erroresHorarios(horarios).porFila).length > 0;
  const ver = (k: string) =>
    (intento ? errores[k] : undefined) ??
    (errorApi?.field === k ? errorApi.mensaje : undefined);

  const actualizar =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setErrorApi(null);
    };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (guardando) return;
    setIntento(true);
    if (Object.keys(errores).length || horariosInvalidos) return;
    setGuardando(true);
    setErrorApi(null);
    try {
      const i = await crearInscripcion({
        alumno_id: Number(alumnoId),
        clase_id: Number(claseId),
        profesor_id: Number(profesorId),
        ciclo,
        fecha_alta: fechaAlta,
        horarios,
      });
      notifySuccess('Inscripción creada');
      router.push(`/dashboard/academia/inscripciones/${i.id}`);
    } catch (err) {
      logError('Error al inscribir', err);
      setErrorApi(errorDeApi(err, 'No se pudo inscribir'));
      setGuardando(false);
    }
  };

  const conflictos = (errorApi?.detalle ?? [])
    .map((d) => d.horario)
    .filter(Boolean) as Horario[];
  const errorGeneral =
    errorApi &&
    !['alumno_id', 'clase_id', 'profesor_id', 'fecha_alta', 'ciclo'].includes(
      errorApi.field ?? '',
    );

  return (
    <div className="mx-auto max-w-3xl">
      <Encabezado
        titulo="Nueva inscripción"
        volver={{
          href: '/dashboard/academia/inscripciones',
          label: 'Inscripciones',
        }}
      />
      <Tarjeta>
        <form onSubmit={enviar} noValidate className="space-y-4">
          <Campo
            id="alumno_id"
            label="Alumno"
            requerido
            error={ver('alumno_id')}
            ayuda={
              <>
                ¿Es nuevo?{' '}
                <Link
                  className="underline"
                  href="/dashboard/academia/alumnos/nuevo"
                >
                  Cargalo primero
                </Link>
                .
              </>
            }
          >
            <select
              id="alumno_id"
              value={alumnoId}
              onChange={(e) =>
                actualizar(setAlumnoId)(
                  e.target.value ? Number(e.target.value) : '',
                )
              }
              className={claseCampo}
            >
              <option value="">Elegí el alumno</option>
              {alumnos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.apellido}, {a.nombre}
                  {a.es_menor ? ` (${a.edad} años)` : ''}
                </option>
              ))}
            </select>
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              id="clase_id"
              label="Clase"
              requerido
              error={ver('clase_id')}
              ayuda={
                clase
                  ? `${clase.es_grupal ? `Taller${clase.cupo ? ` · cupo ${clase.cupo}` : ''}` : 'Individual'} · ${clase.precio_vigente ? `cuota ${pesos(clase.precio_vigente)}` : 'sin precio cargado'}`
                  : undefined
              }
            >
              <select
                id="clase_id"
                value={claseId}
                onChange={(e) =>
                  actualizar(setClaseId)(
                    e.target.value ? Number(e.target.value) : '',
                  )
                }
                className={claseCampo}
              >
                <option value="">Elegí la clase</option>
                {clases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                    {c.es_grupal ? ' (taller)' : ''}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo
              id="profesor_id"
              label="Profesor"
              requerido
              error={ver('profesor_id')}
            >
              <select
                id="profesor_id"
                value={profesorId}
                onChange={(e) =>
                  actualizar(setProfesorId)(
                    e.target.value ? Number(e.target.value) : '',
                  )
                }
                className={claseCampo}
              >
                <option value="">Elegí el profesor</option>
                {profesores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.apellido}, {p.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              id="fecha_alta"
              label="Fecha de alta"
              requerido
              error={ver('fecha_alta')}
            >
              <input
                id="fecha_alta"
                type="date"
                value={fechaAlta}
                onChange={(e) => {
                  setFechaAlta(e.target.value);
                  if (esFecha(e.target.value))
                    setCiclo(Number(e.target.value.slice(0, 4)));
                }}
                className={claseCampo}
              />
            </Campo>
            <Campo
              id="ciclo"
              label="Ciclo lectivo"
              requerido
              ayuda="El año del alta o el siguiente. Un alumno no puede repetir clase en el mismo ciclo."
              error={ver('ciclo')}
            >
              {/* La API sólo acepta el año del alta o el siguiente: un año a mano
                  (ej. 2099) dejaba la inscripción fuera de Mis clases y la agenda. */}
              <select
                id="ciclo"
                value={ciclo}
                onChange={(e) => actualizar(setCiclo)(Number(e.target.value))}
                className={claseCampo}
              >
                {[anioAlta, anioAlta + 1].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <HorariosEditor
            horarios={horarios}
            onChange={actualizar(setHorarios)}
            mostrarErrores={intento}
            conflictos={conflictos}
          />

          {errorGeneral && (
            <AvisoError
              mensaje={errorApi!.mensaje}
              lineas={lineasConflicto(errorApi!)}
            />
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <BotonSecundario
              type="button"
              onClick={() => router.push('/dashboard/academia/inscripciones')}
              disabled={guardando}
            >
              Cancelar
            </BotonSecundario>
            <BotonPrimario type="submit" cargando={guardando}>
              {guardando ? 'Guardando…' : 'Inscribir'}
            </BotonPrimario>
          </div>
        </form>
      </Tarjeta>
    </div>
  );
}
