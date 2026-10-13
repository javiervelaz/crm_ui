'use client';

import {
  actualizarPersona,
  crearAcceso,
  desactivarPersona,
  getPersona,
  resetearAcceso,
  type Acceso,
  type Alumno,
  type Profesor,
  type Tutor,
} from '@/app/lib/edu/edu.api';
import {
  errorDeApi,
  fechaCorta,
  type EntidadPersona,
} from '@/app/lib/edu/reglas';
import { logError } from '@/app/lib/logger';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import Dialog from '@/components/ui/Dialog';
import ErrorState from '@/components/ui/ErrorState';
import ResponsiveTable from '@/components/ui/ResponsiveTable';
import { KeyRound, Pencil, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import CredencialesDialog from './CredencialesDialog';
import InscripcionesTabla from './InscripcionesTabla';
import PersonaForm from './PersonaForm';
import { nombreCompleto, TEXTOS } from './personas';
import {
  AvisoError,
  BotonPrimario,
  BotonSecundario,
  Campo,
  claseCampo,
  Encabezado,
  Etiqueta,
  Tarjeta,
} from './ui';

type Persona = Profesor | Tutor | Alumno;

export default function PersonaDetalle({
  entidad,
  id,
}: {
  entidad: EntidadPersona;
  id: number;
}) {
  const t = TEXTOS[entidad];
  const router = useRouter();
  const [p, setP] = useState<Persona | null>(null);
  const [error, setError] = useState(false);
  const [editando, setEditando] = useState(false);
  const [acceso, setAcceso] = useState<Acceso | null>(null);
  const [pidiendoEmail, setPidiendoEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError(false);
      setP(await getPersona(entidad, id));
    } catch (err) {
      logError(`Error al cargar ${t.singular}`, err);
      setError(true);
    }
  }, [entidad, id, t.singular]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (error)
    return (
      <ErrorState
        onRetry={cargar}
        titulo={`No pudimos cargar ${t.articulo} ${t.singular}`}
      />
    );
  if (!p) return <div className="h-40 animate-pulse rounded-xl bg-white" />;

  const alumno = entidad === 'alumnos' ? (p as Alumno) : null;
  const tutor = entidad === 'tutores' ? (p as Tutor) : null;
  const profesor = entidad === 'profesores' ? (p as Profesor) : null;
  const sinAccesoPropio = !!alumno && (alumno.es_menor || !!alumno.tutor_id);

  const cambiarEstado = async () => {
    setErrorAccion(null);
    if (
      p.activo &&
      !confirm(
        `¿Dar de baja a ${nombreCompleto(p)}? Queda inactivo y no se puede inscribir.`,
      )
    )
      return;
    setTrabajando(true);
    try {
      if (p.activo) await desactivarPersona(entidad, p.id);
      else await actualizarPersona(entidad, p.id, { activo: true });
      notifySuccess(p.activo ? 'Dado de baja' : 'Reactivado');
      await cargar();
    } catch (err) {
      setErrorAccion(errorDeApi(err, 'No se pudo cambiar el estado').mensaje);
    } finally {
      setTrabajando(false);
    }
  };

  const darAcceso = async (e: FormEvent) => {
    e.preventDefault();
    setErrorAccion(null);
    setTrabajando(true);
    try {
      const a = await crearAcceso(entidad, p.id, email.trim() || undefined);
      setPidiendoEmail(false);
      setAcceso(a);
      await cargar();
    } catch (err) {
      setErrorAccion(errorDeApi(err, 'No se pudo crear el acceso').mensaje);
    } finally {
      setTrabajando(false);
    }
  };

  const nuevaPassword = async () => {
    if (
      !p.user_id ||
      !confirm(
        'Se genera una contraseña temporal nueva y la actual deja de funcionar. ¿Seguir?',
      )
    )
      return;
    setTrabajando(true);
    try {
      setAcceso(await resetearAcceso(p.user_id));
    } catch (err) {
      notifyError(errorDeApi(err, 'No se pudo generar la contraseña').mensaje);
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <div className="space-y-4">
      <Encabezado
        volver={{ href: t.base, label: t.plural }}
        titulo={nombreCompleto(p)}
        subtitulo={
          <span className="flex flex-wrap items-center gap-2">
            {alumno && (
              <span>
                {alumno.edad} años{alumno.es_menor ? ' · menor' : ''}
              </span>
            )}
            {!p.activo && <Etiqueta tono="apagado">Inactivo</Etiqueta>}
            {p.user_id ? (
              <Etiqueta tono="ok">Con acceso</Etiqueta>
            ) : (
              <Etiqueta>Sin acceso</Etiqueta>
            )}
          </span>
        }
        acciones={
          <>
            {alumno && p.activo && (
              <BotonPrimario
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard/academia/inscripciones/nueva?alumno_id=${p.id}`,
                  )
                }
              >
                <Plus size={16} /> Inscribir
              </BotonPrimario>
            )}
            <BotonSecundario
              type="button"
              onClick={cambiarEstado}
              disabled={trabajando}
            >
              {p.activo ? 'Dar de baja' : 'Reactivar'}
            </BotonSecundario>
          </>
        }
      />
      {errorAccion && !pidiendoEmail && <AvisoError mensaje={errorAccion} />}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tarjeta
            titulo="Datos"
            acciones={
              !editando && (
                <button
                  type="button"
                  onClick={() => setEditando(true)}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
                >
                  <Pencil size={14} /> Editar
                </button>
              )
            }
          >
            {editando ? (
              <PersonaForm
                entidad={entidad}
                inicial={p}
                onCancelar={() => setEditando(false)}
                onGuardado={() => {
                  setEditando(false);
                  cargar();
                }}
              />
            ) : (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-brand-400">Teléfono</dt>
                  <dd className="text-brand-800">{p.telefono || '—'}</dd>
                </div>
                <div>
                  <dt className="text-brand-400">Email</dt>
                  <dd className="break-all text-brand-800">{p.email || '—'}</dd>
                </div>
                {alumno && (
                  <div>
                    <dt className="text-brand-400">Nacimiento</dt>
                    <dd className="text-brand-800">
                      {fechaCorta(alumno.fecha_nacimiento)}
                    </dd>
                  </div>
                )}
                {alumno && (
                  <div>
                    <dt className="text-brand-400">Tutor</dt>
                    <dd className="text-brand-800">
                      {alumno.tutor_id ? (
                        <Link
                          className="underline"
                          href={`/dashboard/academia/tutores/${alumno.tutor_id}`}
                        >
                          {alumno.tutor}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </Tarjeta>
        </div>

        <Tarjeta titulo="Acceso al sistema">
          {p.user_id ? (
            <div className="space-y-3 text-sm">
              <p className="text-brand-600">
                Entra con{' '}
                <span className="font-medium text-brand-800">{p.email}</span>.
              </p>
              <BotonSecundario
                type="button"
                onClick={nuevaPassword}
                disabled={trabajando}
                className="w-full"
              >
                <KeyRound size={16} /> Generar contraseña nueva
              </BotonSecundario>
            </div>
          ) : sinAccesoPropio ? (
            <p className="text-sm text-brand-400">
              {alumno?.es_menor
                ? 'Es menor: ve sus clases con el acceso de su tutor.'
                : 'Tiene tutor: ve sus clases con el acceso del tutor.'}
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="text-brand-400">
                Todavía no puede entrar al sistema.
              </p>
              <BotonPrimario
                type="button"
                className="w-full"
                disabled={!p.activo}
                onClick={() => {
                  setEmail(p.email ?? '');
                  setErrorAccion(null);
                  setPidiendoEmail(true);
                }}
              >
                <KeyRound size={16} /> Dar acceso
              </BotonPrimario>
            </div>
          )}
        </Tarjeta>
      </div>

      {tutor && (
        <Tarjeta
          titulo="Alumnos a cargo"
          acciones={
            <Link
              href={`/dashboard/academia/alumnos/nuevo?tutor_id=${tutor.id}`}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
            >
              <Plus size={14} /> Agregar alumno
            </Link>
          }
        >
          <ResponsiveTable
            datos={tutor.alumnos ?? []}
            rowKey={(a) => a.id}
            vacio={{ titulo: 'Sin alumnos a cargo' }}
            columnas={[
              {
                key: 'n',
                header: 'Alumno',
                mobile: 'primary',
                render: (a) => (
                  <Link
                    className="font-semibold text-brand-800 hover:underline"
                    href={`/dashboard/academia/alumnos/${a.id}`}
                  >
                    {nombreCompleto(a)}
                  </Link>
                ),
              },
              {
                key: 'e',
                header: 'Edad',
                mobile: 'meta',
                render: (a) => `${a.edad} años`,
              },
              {
                key: 'c',
                header: 'Clases',
                mobile: 'secondary',
                render: (a) => a.inscripciones_activas,
              },
              {
                key: 's',
                header: 'Estado',
                mobile: 'meta',
                render: (a) =>
                  a.activo ? (
                    <Etiqueta tono="ok">Activo</Etiqueta>
                  ) : (
                    <Etiqueta tono="apagado">Inactivo</Etiqueta>
                  ),
              },
            ]}
          />
        </Tarjeta>
      )}

      {(alumno || profesor) && (
        <Tarjeta
          titulo="Inscripciones activas"
          acciones={
            profesor && (
              <Link
                href={`/dashboard/academia/agenda?profesor_id=${profesor.id}`}
                className="rounded-lg px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
              >
                Ver agenda
              </Link>
            )
          }
        >
          <InscripcionesTabla
            datos={(alumno ?? profesor)!.inscripciones ?? []}
            ocultar={alumno ? ['alumno'] : ['profesor']}
            vacio={{ titulo: 'Sin inscripciones activas' }}
          />
        </Tarjeta>
      )}

      {pidiendoEmail && (
        <Dialog
          titulo={`Dar acceso a ${nombreCompleto(p)}`}
          onClose={() => setPidiendoEmail(false)}
          bloquear={trabajando}
        >
          <form onSubmit={darAcceso} className="space-y-4" noValidate>
            <Campo
              id="email-acceso"
              label="Email con el que va a entrar"
              requerido
            >
              <input
                id="email-acceso"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={claseCampo}
                autoFocus
              />
            </Campo>
            {errorAccion && <AvisoError mensaje={errorAccion} />}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <BotonSecundario
                type="button"
                onClick={() => setPidiendoEmail(false)}
                disabled={trabajando}
              >
                Cancelar
              </BotonSecundario>
              <BotonPrimario
                type="submit"
                cargando={trabajando}
                disabled={!email.trim()}
              >
                Generar acceso
              </BotonPrimario>
            </div>
          </form>
        </Dialog>
      )}
      {acceso && (
        <CredencialesDialog
          acceso={acceso}
          nombre={nombreCompleto(p)}
          onClose={() => setAcceso(null)}
        />
      )}
    </div>
  );
}
