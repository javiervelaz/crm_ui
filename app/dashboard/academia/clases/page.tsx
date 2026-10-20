'use client';

import {
  crearTipoClase,
  listarClases,
  listarTiposClase,
  type Clase,
  type TipoClase,
} from '@/app/lib/edu/edu.api';
import { errorDeApi, nombreMes, pesos } from '@/app/lib/edu/reglas';
import { logError } from '@/app/lib/logger';
import { notifySuccess } from '@/app/lib/notificationService';
import { TableSkeleton } from '@/app/ui/TableSkeleton';
import Dialog from '@/components/ui/Dialog';
import ErrorState from '@/components/ui/ErrorState';
import ResponsiveTable from '@/components/ui/ResponsiveTable';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import ClaseForm from '../componentes/ClaseForm';
import {
  AvisoError,
  BotonPrimario,
  BotonSecundario,
  Campo,
  claseCampo,
  Encabezado,
  Etiqueta,
} from '../componentes/ui';

export default function ClasesPage() {
  const router = useRouter();
  const [clases, setClases] = useState<Clase[]>([]);
  const [tipos, setTipos] = useState<TipoClase[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [creando, setCreando] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState(false);
  const [verInactivas, setVerInactivas] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError(false);
      setCargando(true);
      const [cs, ts] = await Promise.all([listarClases(), listarTiposClase()]);
      setClases(cs);
      setTipos(ts);
    } catch (err) {
      logError('Error al cargar clases', err);
      setError(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibles = clases.filter((c) => verInactivas || c.activa);

  return (
    <div>
      <Encabezado
        titulo="Clases"
        subtitulo={
          tipos.length
            ? `Tipos: ${tipos.map((t) => t.nombre).join(', ')}`
            : undefined
        }
        acciones={
          <>
            <BotonSecundario type="button" onClick={() => setNuevoTipo(true)}>
              Nuevo tipo
            </BotonSecundario>
            <BotonPrimario type="button" onClick={() => setCreando(true)}>
              Nueva clase
            </BotonPrimario>
          </>
        }
      />
      <label className="mb-3 inline-flex items-center gap-2 text-sm text-brand-600">
        <input
          type="checkbox"
          checked={verInactivas}
          onChange={(e) => setVerInactivas(e.target.checked)}
          className="h-4 w-4 rounded border-brand-300 text-brand-600"
        />
        Mostrar inactivas
      </label>

      {cargando ? (
        <TableSkeleton rows={4} cols={4} withFilter={false} />
      ) : error ? (
        <ErrorState onRetry={cargar} />
      ) : (
        <ResponsiveTable
          datos={visibles}
          rowKey={(c) => c.id}
          vacio={{
            titulo: 'Todavía no hay clases',
            mensaje:
              'Una clase es el instrumento o la materia (ej. Guitarra) con su cuota mensual.',
            accion: { label: 'Nueva clase', onClick: () => setCreando(true) },
          }}
          columnas={[
            {
              key: 'nombre',
              header: 'Clase',
              mobile: 'primary',
              sortValue: (c) => c.nombre.toLowerCase(),
              render: (c) => (
                <span className="flex flex-wrap items-center gap-1">
                  <Link
                    href={`/dashboard/academia/clases/${c.id}`}
                    className="font-semibold text-brand-800 hover:underline"
                  >
                    {c.nombre}
                  </Link>
                  {!c.activa && <Etiqueta tono="apagado">Inactiva</Etiqueta>}
                </span>
              ),
            },
            {
              key: 'tipo',
              header: 'Tipo',
              mobile: 'meta',
              render: (c) =>
                c.es_grupal
                  ? `${c.tipo_clase}${c.cupo ? ` · cupo ${c.cupo}` : ''}`
                  : c.tipo_clase,
            },
            {
              key: 'precio',
              header: 'Cuota vigente',
              mobile: 'secondary',
              align: 'right',
              sortValue: (c) => Number(c.precio_vigente ?? 0),
              render: (c) =>
                c.precio_vigente ? (
                  <span
                    title={
                      c.precio_vigente_desde
                        ? `Desde ${nombreMes(c.precio_vigente_desde)}`
                        : undefined
                    }
                  >
                    {pesos(c.precio_vigente)}
                  </span>
                ) : (
                  <Etiqueta tono="aviso">Sin precio</Etiqueta>
                ),
            },
            {
              key: 'insc',
              header: 'Inscriptos',
              mobile: 'meta',
              align: 'right',
              sortValue: (c) => c.inscripciones_activas,
              render: (c) => c.inscripciones_activas,
            },
          ]}
          acciones={(c) => (
            <Link
              href={`/dashboard/academia/clases/${c.id}`}
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
            >
              Ver
            </Link>
          )}
        />
      )}

      {creando && (
        <Dialog
          titulo="Nueva clase"
          onClose={() => setCreando(false)}
          ancho="max-w-2xl"
        >
          <ClaseForm
            onCancelar={() => setCreando(false)}
            onGuardada={(c) =>
              router.push(`/dashboard/academia/clases/${c.id}`)
            }
          />
        </Dialog>
      )}
      {nuevoTipo && (
        <NuevoTipoDialog
          onClose={() => setNuevoTipo(false)}
          onCreado={() => {
            setNuevoTipo(false);
            cargar();
          }}
        />
      )}
    </div>
  );
}

function NuevoTipoDialog({
  onClose,
  onCreado,
}: {
  onClose: () => void;
  onCreado: () => void;
}) {
  const [nombre, setNombre] = useState('');
  const [grupal, setGrupal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (nombre.trim().length < 2 || guardando) return;
    setGuardando(true);
    try {
      await crearTipoClase({ nombre: nombre.trim(), es_grupal: grupal });
      notifySuccess('Tipo de clase creado');
      onCreado();
    } catch (err) {
      setError(errorDeApi(err).mensaje);
      setGuardando(false);
    }
  };

  return (
    <Dialog titulo="Nuevo tipo de clase" onClose={onClose} bloquear={guardando}>
      <form onSubmit={enviar} className="space-y-4" noValidate>
        <Campo id="tipo-nombre" label="Nombre" requerido>
          <input
            id="tipo-nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setError(null);
            }}
            className={claseCampo}
            maxLength={60}
            autoFocus
          />
        </Campo>
        <label className="flex items-center gap-2 text-sm text-brand-700">
          <input
            type="checkbox"
            checked={grupal}
            onChange={(e) => setGrupal(e.target.checked)}
            className="h-4 w-4 rounded border-brand-300 text-brand-600"
          />
          Es grupal (varios alumnos comparten el turno)
        </label>
        {error && <AvisoError mensaje={error} />}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <BotonSecundario type="button" onClick={onClose} disabled={guardando}>
            Cancelar
          </BotonSecundario>
          <BotonPrimario
            type="submit"
            cargando={guardando}
            disabled={nombre.trim().length < 2}
          >
            Crear tipo
          </BotonPrimario>
        </div>
      </form>
    </Dialog>
  );
}
