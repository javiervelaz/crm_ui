'use client';

import {
  actualizarClase,
  actualizarPrecio,
  borrarPrecio,
  crearPrecio,
  desactivarClase,
  getClase,
  listarInscripciones,
  type Clase,
  type Inscripcion,
  type Precio,
} from '@/app/lib/edu/edu.api';
import { errorDeApi, mesActual, nombreMes, pesos } from '@/app/lib/edu/reglas';
import { logError } from '@/app/lib/logger';
import { notifySuccess } from '@/app/lib/notificationService';
import Dialog from '@/components/ui/Dialog';
import ErrorState from '@/components/ui/ErrorState';
import ResponsiveTable from '@/components/ui/ResponsiveTable';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import ClaseForm from '../../componentes/ClaseForm';
import InscripcionesTabla from '../../componentes/InscripcionesTabla';
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

export default function ClaseDetallePage() {
  const { id } = useParams<{ id: string }>();
  const claseId = Number(id);
  const [clase, setClase] = useState<Clase | null>(null);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [error, setError] = useState(false);
  const [editando, setEditando] = useState(false);
  const [precio, setPrecio] = useState<Precio | 'nuevo' | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(false);
      const [c, ins] = await Promise.all([
        getClase(claseId),
        listarInscripciones({ clase_id: claseId }),
      ]);
      setClase(c);
      setInscripciones(ins);
    } catch (err) {
      logError('Error al cargar la clase', err);
      setError(true);
    }
  }, [claseId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (error)
    return <ErrorState onRetry={cargar} titulo="No pudimos cargar la clase" />;
  if (!clase) return <div className="h-40 animate-pulse rounded-xl bg-white" />;

  const cambiarEstado = async () => {
    setErrorAccion(null);
    if (
      clase.activa &&
      !confirm(
        `¿Desactivar ${clase.nombre}? No va a admitir inscripciones nuevas.`,
      )
    )
      return;
    try {
      if (clase.activa) await desactivarClase(clase.id);
      else await actualizarClase(clase.id, { activa: true });
      notifySuccess(clase.activa ? 'Clase desactivada' : 'Clase reactivada');
      cargar();
    } catch (err) {
      setErrorAccion(errorDeApi(err, 'No se pudo cambiar el estado').mensaje);
    }
  };

  const eliminarPrecio = async (p: Precio) => {
    if (!confirm(`¿Borrar el precio de ${nombreMes(p.vigente_desde)}?`)) return;
    try {
      await borrarPrecio(clase.id, p.id);
      notifySuccess('Precio borrado');
      cargar();
    } catch (err) {
      setErrorAccion(errorDeApi(err, 'No se pudo borrar el precio').mensaje);
    }
  };

  return (
    <div className="space-y-4">
      <Encabezado
        volver={{ href: '/dashboard/academia/clases', label: 'Clases' }}
        titulo={clase.nombre}
        subtitulo={
          <span className="flex flex-wrap items-center gap-2">
            {clase.tipo_clase}
            {clase.es_grupal && clase.cupo
              ? ` · cupo ${clase.cupo} por turno`
              : ''}
            {!clase.activa && <Etiqueta tono="apagado">Inactiva</Etiqueta>}
          </span>
        }
        acciones={
          <>
            <BotonSecundario type="button" onClick={() => setEditando(true)}>
              <Pencil size={16} /> Editar
            </BotonSecundario>
            <BotonSecundario type="button" onClick={cambiarEstado}>
              {clase.activa ? 'Desactivar' : 'Reactivar'}
            </BotonSecundario>
          </>
        }
      />
      {errorAccion && <AvisoError mensaje={errorAccion} />}

      <div className="grid gap-4 lg:grid-cols-3">
        <Tarjeta titulo="Cuota vigente">
          {clase.precio_vigente ? (
            <div>
              <p className="font-display text-3xl text-brand-800">
                {pesos(clase.precio_vigente)}
              </p>
              <p className="mt-1 text-sm text-brand-400">
                Desde {nombreMes(clase.precio_vigente_desde!)}
                {clase.precio_clase_vigente
                  ? ` · clase suelta ${pesos(clase.precio_clase_vigente)}`
                  : ''}
              </p>
            </div>
          ) : (
            <p className="text-sm text-amber-700">
              Sin precio para este mes. Cargá uno para poder cobrar la cuota.
            </p>
          )}
        </Tarjeta>

        <div className="lg:col-span-2">
          <Tarjeta
            titulo="Historial de precios"
            acciones={
              <button
                type="button"
                onClick={() => setPrecio('nuevo')}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
              >
                <Plus size={14} /> Nuevo precio
              </button>
            }
          >
            <p className="mb-3 text-xs text-brand-400">
              Cada precio rige desde su mes hasta que se carga uno posterior.
            </p>
            <ResponsiveTable
              datos={clase.precios ?? []}
              rowKey={(p) => p.id}
              vacio={{
                titulo: 'Sin precios',
                accion: {
                  label: 'Cargar precio',
                  onClick: () => setPrecio('nuevo'),
                },
              }}
              columnas={[
                {
                  key: 'mes',
                  header: 'Desde',
                  mobile: 'primary',
                  render: (p) => (
                    <span className="flex items-center gap-2 capitalize">
                      {nombreMes(p.vigente_desde)}
                      {p.vigente_desde === clase.precio_vigente_desde && (
                        <Etiqueta tono="ok">Vigente</Etiqueta>
                      )}
                      {p.vigente_desde.slice(0, 7) > mesActual() && (
                        <Etiqueta tono="aviso">Futuro</Etiqueta>
                      )}
                    </span>
                  ),
                },
                {
                  key: 'mensual',
                  header: 'Cuota mensual',
                  mobile: 'secondary',
                  align: 'right',
                  render: (p) => pesos(p.importe_mensual),
                },
                {
                  key: 'suelta',
                  header: 'Clase suelta',
                  mobile: 'meta',
                  align: 'right',
                  render: (p) => pesos(p.importe_clase),
                },
              ]}
              acciones={(p) => (
                <>
                  <button
                    type="button"
                    title="Editar"
                    aria-label={`Editar precio de ${nombreMes(p.vigente_desde)}`}
                    onClick={() => setPrecio(p)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    title="Borrar"
                    aria-label={`Borrar precio de ${nombreMes(p.vigente_desde)}`}
                    onClick={() => eliminarPrecio(p)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            />
          </Tarjeta>
        </div>
      </div>

      <Tarjeta titulo={`Inscriptos (${inscripciones.length})`}>
        <InscripcionesTabla
          datos={inscripciones}
          ocultar={['clase']}
          vacio={{ titulo: 'Sin inscriptos activos' }}
        />
      </Tarjeta>

      {editando && (
        <Dialog
          titulo="Editar clase"
          onClose={() => setEditando(false)}
          ancho="max-w-2xl"
        >
          <ClaseForm
            inicial={clase}
            onCancelar={() => setEditando(false)}
            onGuardada={() => {
              setEditando(false);
              cargar();
            }}
          />
        </Dialog>
      )}
      {precio && (
        <PrecioDialog
          claseId={clase.id}
          precio={precio === 'nuevo' ? null : precio}
          onClose={() => setPrecio(null)}
          onGuardado={() => {
            setPrecio(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}

function PrecioDialog({
  claseId,
  precio,
  onClose,
  onGuardado,
}: {
  claseId: number;
  precio: Precio | null;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const [mes, setMes] = useState(
    precio ? precio.vigente_desde.slice(0, 7) : mesActual(),
  );
  const [importe, setImporte] = useState(
    precio ? String(Number(precio.importe_mensual)) : '',
  );
  const [suelta, setSuelta] = useState(
    precio?.importe_clase ? String(Number(precio.importe_clase)) : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const valido =
    /^\d{4}-\d{2}$/.test(mes) &&
    Number(importe) > 0 &&
    (!suelta || Number(suelta) > 0);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!valido || guardando) return;
    setGuardando(true);
    setError(null);
    const importes = {
      importe_mensual: Number(importe),
      importe_clase: suelta ? Number(suelta) : null,
    };
    try {
      if (precio) await actualizarPrecio(claseId, precio.id, importes);
      else await crearPrecio(claseId, { vigente_desde: mes, ...importes });
      notifySuccess('Precio guardado');
      onGuardado();
    } catch (err) {
      setError(errorDeApi(err).mensaje);
      setGuardando(false);
    }
  };

  return (
    <Dialog
      titulo={
        precio ? `Precio de ${nombreMes(precio.vigente_desde)}` : 'Nuevo precio'
      }
      onClose={onClose}
      bloquear={guardando}
    >
      <form onSubmit={enviar} className="space-y-4" noValidate>
        <Campo
          id="p-mes"
          label="Rige desde"
          requerido
          ayuda={
            precio
              ? 'El mes no se cambia: borralo y cargá otro.'
              : 'Sigue vigente hasta que cargues uno posterior.'
          }
        >
          <input
            id="p-mes"
            type="month"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            disabled={!!precio}
            className={claseCampo}
          />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="p-importe" label="Cuota mensual" requerido>
            <input
              id="p-importe"
              type="number"
              min={1}
              step="0.01"
              inputMode="decimal"
              value={importe}
              onChange={(e) => setImporte(e.target.value)}
              className={claseCampo}
              autoFocus
            />
          </Campo>
          <Campo id="p-suelta" label="Clase suelta" ayuda="Opcional">
            <input
              id="p-suelta"
              type="number"
              min={1}
              step="0.01"
              inputMode="decimal"
              value={suelta}
              onChange={(e) => setSuelta(e.target.value)}
              className={claseCampo}
            />
          </Campo>
        </div>
        {error && <AvisoError mensaje={error} />}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <BotonSecundario type="button" onClick={onClose} disabled={guardando}>
            Cancelar
          </BotonSecundario>
          <BotonPrimario type="submit" cargando={guardando} disabled={!valido}>
            Guardar
          </BotonPrimario>
        </div>
      </form>
    </Dialog>
  );
}
