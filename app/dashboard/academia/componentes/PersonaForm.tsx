'use client';

import {
  actualizarPersona,
  crearPersona,
  listarPersonas,
  type Acceso,
  type Alumno,
  type Profesor,
  type Tutor,
} from '@/app/lib/edu/edu.api';
import {
  admiteAccesoPropio,
  edad,
  errorDeApi,
  MAYORIA_EDAD,
  validarPersona,
  type DatosPersona,
  type EntidadPersona,
} from '@/app/lib/edu/reglas';
import { logError } from '@/app/lib/logger';
import { notifySuccess } from '@/app/lib/notificationService';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { TEXTOS } from './personas';
import {
  AvisoError,
  BotonPrimario,
  BotonSecundario,
  Campo,
  claseCampo,
} from './ui';

type Persona = Profesor | Tutor | Alumno;

interface Props {
  entidad: EntidadPersona;
  /** Persona existente = edición. */
  inicial?: Persona;
  /** Prefijados en el alta (ej. tutor desde la ficha del tutor). */
  prefijados?: Partial<DatosPersona>;
  onGuardado: (persona: Persona, acceso?: Acceso) => void;
  onCancelar: () => void;
}

export default function PersonaForm({
  entidad,
  inicial,
  prefijados,
  onGuardado,
  onCancelar,
}: Props) {
  const edicion = !!inicial;
  const t = TEXTOS[entidad];
  const [d, setD] = useState<DatosPersona>(() => ({
    nombre: inicial?.nombre ?? '',
    apellido: inicial?.apellido ?? '',
    telefono: inicial?.telefono ?? '',
    email: inicial?.email ?? '',
    fecha_nacimiento: (inicial as Alumno | undefined)?.fecha_nacimiento ?? '',
    tutor_id: (inicial as Alumno | undefined)?.tutor_id ?? '',
    crear_acceso: false,
    ...prefijados,
  }));
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [intento, setIntento] = useState(false);
  const [errorApi, setErrorApi] = useState<{
    mensaje: string;
    field?: string;
  } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [tutores, setTutores] = useState<Tutor[]>([]);

  useEffect(() => {
    if (entidad !== 'alumnos') return;
    listarPersonas('tutores', { activo: 'true' })
      .then((ts) => {
        // En edición el tutor actual se muestra aunque esté inactivo.
        const actual = (inicial as Alumno | undefined)?.tutor_id;
        setTutores(
          actual && !ts.some((x) => x.id === actual)
            ? [
                ...ts,
                {
                  id: actual,
                  nombre: (inicial as Alumno).tutor ?? 'Tutor actual',
                  apellido: '',
                  activo: false,
                } as Tutor,
              ]
            : ts,
        );
      })
      .catch((err) => logError('Error al cargar tutores', err));
  }, [entidad, inicial]);

  const errores = useMemo(() => validarPersona(entidad, d), [entidad, d]);
  const visible = (campo: string) =>
    intento || tocados[campo] ? errores[campo] : undefined;
  const años = d.fecha_nacimiento ? edad(d.fecha_nacimiento) : null;
  const menor = años !== null && años >= 0 && años < MAYORIA_EDAD;
  const puedeAcceso = !edicion && admiteAccesoPropio(entidad, d);

  const set = <K extends keyof DatosPersona>(k: K, v: DatosPersona[K]) => {
    setD((prev) => ({ ...prev, [k]: v }));
    setErrorApi(null);
  };
  const tocar = (k: string) => setTocados((prev) => ({ ...prev, [k]: true }));

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (guardando) return;
    setIntento(true);
    if (Object.keys(errores).length) return;
    setGuardando(true);
    const body: Record<string, unknown> = {
      nombre: d.nombre.trim(),
      apellido: d.apellido.trim(),
      telefono: d.telefono.trim() || null,
      email: d.email.trim() || null,
    };
    if (entidad === 'alumnos') {
      body.fecha_nacimiento = d.fecha_nacimiento;
      body.tutor_id = d.tutor_id ? Number(d.tutor_id) : null;
    }
    try {
      if (edicion) {
        const p = await actualizarPersona(entidad, inicial!.id, body);
        notifySuccess('Cambios guardados');
        onGuardado(p);
      } else {
        if (puedeAcceso && d.crear_acceso) body.crear_acceso = true;
        const { acceso, ...p } = await crearPersona(entidad, body);
        notifySuccess(
          `${t.singular[0].toUpperCase()}${t.singular.slice(1)} creado`,
        );
        onGuardado(p as Persona, acceso);
      }
    } catch (err) {
      logError(`Error guardando ${t.singular}`, err);
      setErrorApi(errorDeApi(err));
      setGuardando(false);
    }
  };

  const errorCampo = (campo: string) =>
    visible(campo) ??
    (errorApi?.field === campo ? errorApi.mensaje : undefined);

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id="nombre"
          label="Nombre"
          requerido
          error={errorCampo('nombre')}
        >
          <input
            id="nombre"
            value={d.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            onBlur={() => tocar('nombre')}
            className={claseCampo}
            maxLength={80}
            autoComplete="off"
            aria-invalid={!!errorCampo('nombre')}
          />
        </Campo>
        <Campo
          id="apellido"
          label="Apellido"
          requerido
          error={errorCampo('apellido')}
        >
          <input
            id="apellido"
            value={d.apellido}
            onChange={(e) => set('apellido', e.target.value)}
            onBlur={() => tocar('apellido')}
            className={claseCampo}
            maxLength={80}
            autoComplete="off"
            aria-invalid={!!errorCampo('apellido')}
          />
        </Campo>
      </div>

      {entidad === 'alumnos' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            id="fecha_nacimiento"
            label="Fecha de nacimiento"
            requerido
            error={errorCampo('fecha_nacimiento')}
            ayuda={
              años !== null && años >= 0
                ? `${años} años${menor ? ' · menor: necesita tutor' : ''}`
                : undefined
            }
          >
            <input
              id="fecha_nacimiento"
              type="date"
              value={d.fecha_nacimiento}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set('fecha_nacimiento', e.target.value)}
              onBlur={() => tocar('fecha_nacimiento')}
              className={claseCampo}
              aria-invalid={!!errorCampo('fecha_nacimiento')}
            />
          </Campo>
          <Campo
            id="tutor_id"
            label="Tutor"
            requerido={menor}
            error={errorCampo('tutor_id')}
            ayuda={
              <>
                ¿No está?{' '}
                <Link
                  className="underline"
                  href="/dashboard/academia/tutores/nuevo"
                >
                  Cargá al tutor
                </Link>{' '}
                y volvé.
              </>
            }
          >
            <select
              id="tutor_id"
              value={d.tutor_id ?? ''}
              onChange={(e) => {
                set('tutor_id', e.target.value ? Number(e.target.value) : '');
                tocar('tutor_id');
              }}
              className={claseCampo}
              aria-invalid={!!errorCampo('tutor_id')}
            >
              <option value="">{menor ? 'Elegí un tutor' : 'Sin tutor'}</option>
              {tutores.map((tt) => (
                <option key={tt.id} value={tt.id}>
                  {tt.apellido ? `${tt.apellido}, ${tt.nombre}` : tt.nombre}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id="telefono"
          label="Teléfono"
          requerido={entidad === 'tutores'}
          error={errorCampo('telefono')}
        >
          <input
            id="telefono"
            type="tel"
            inputMode="tel"
            value={d.telefono}
            onChange={(e) => set('telefono', e.target.value)}
            onBlur={() => tocar('telefono')}
            className={claseCampo}
            maxLength={30}
            aria-invalid={!!errorCampo('telefono')}
          />
        </Campo>
        <Campo
          id="email"
          label="Email"
          requerido={!!d.crear_acceso && puedeAcceso}
          error={errorCampo('email')}
        >
          <input
            id="email"
            type="email"
            value={d.email}
            onChange={(e) => set('email', e.target.value)}
            onBlur={() => tocar('email')}
            className={claseCampo}
            maxLength={150}
            autoComplete="off"
            aria-invalid={!!errorCampo('email')}
          />
        </Campo>
      </div>

      {!edicion && (
        <div
          className={`rounded-lg border p-3 ${puedeAcceso ? 'border-brand-100 bg-brand-50' : 'border-slate-200 bg-slate-50'}`}
        >
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-brand-300 text-brand-600"
              checked={!!d.crear_acceso && puedeAcceso}
              disabled={!puedeAcceso}
              onChange={(e) => set('crear_acceso', e.target.checked)}
            />
            <span>
              <span className="font-medium text-brand-800">
                Darle acceso al sistema
              </span>
              <span className="block text-brand-400">
                {puedeAcceso
                  ? 'Se genera una contraseña temporal que vas a ver una sola vez.'
                  : 'Un alumno menor o con tutor entra con el acceso de su tutor.'}
              </span>
            </span>
          </label>
        </div>
      )}

      {errorApi && !errorApi.field && <AvisoError mensaje={errorApi.mensaje} />}
      {errorApi?.field &&
        ![
          'nombre',
          'apellido',
          'telefono',
          'email',
          'fecha_nacimiento',
          'tutor_id',
        ].includes(errorApi.field) && <AvisoError mensaje={errorApi.mensaje} />}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <BotonSecundario
          type="button"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </BotonSecundario>
        <BotonPrimario type="submit" cargando={guardando}>
          {guardando ? 'Guardando…' : edicion ? 'Guardar cambios' : 'Crear'}
        </BotonPrimario>
      </div>
    </form>
  );
}
