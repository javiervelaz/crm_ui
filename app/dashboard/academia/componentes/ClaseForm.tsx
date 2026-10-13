'use client';

import {
  actualizarClase,
  crearClase,
  listarTiposClase,
  type Clase,
  type TipoClase,
} from '@/app/lib/edu/edu.api';
import { errorDeApi, mesActual } from '@/app/lib/edu/reglas';
import { logError } from '@/app/lib/logger';
import { notifySuccess } from '@/app/lib/notificationService';
import { FormEvent, useEffect, useState } from 'react';
import {
  AvisoError,
  BotonPrimario,
  BotonSecundario,
  Campo,
  claseCampo,
} from './ui';

/** Alta y edición de una clase (instrumento o materia). En el alta, precio inicial opcional. */
export default function ClaseForm({
  inicial,
  onGuardada,
  onCancelar,
}: {
  inicial?: Clase;
  onGuardada: (c: Clase) => void;
  onCancelar: () => void;
}) {
  const edicion = !!inicial;
  const [tipos, setTipos] = useState<TipoClase[]>([]);
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [tipoId, setTipoId] = useState<number | ''>(
    inicial?.tipo_clase_id ?? '',
  );
  const [cupo, setCupo] = useState(inicial?.cupo ? String(inicial.cupo) : '');
  const [conPrecio, setConPrecio] = useState(!edicion);
  const [mes, setMes] = useState(mesActual());
  const [importe, setImporte] = useState('');
  const [importeClase, setImporteClase] = useState('');
  const [intento, setIntento] = useState(false);
  const [errorApi, setErrorApi] = useState<{
    mensaje: string;
    field?: string;
  } | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    listarTiposClase()
      .then((ts) => {
        setTipos(ts);
        if (!inicial && ts.length)
          setTipoId(ts.find((x) => !x.es_grupal)?.id ?? ts[0].id);
      })
      .catch((err) => logError('Error al cargar tipos de clase', err));
  }, [inicial]);

  const tipo = tipos.find((x) => x.id === tipoId);
  const errores: Record<string, string> = {};
  if (nombre.trim().length < 2)
    errores.nombre = 'Ingresá el nombre (ej. Guitarra)';
  if (!tipoId) errores.tipo_clase_id = 'Elegí el tipo';
  if (cupo && (!Number.isInteger(Number(cupo)) || Number(cupo) < 1))
    errores.cupo = 'Cupo inválido';
  if (!edicion && conPrecio) {
    if (!/^\d{4}-\d{2}$/.test(mes)) errores.mes = 'Elegí el mes';
    if (!(Number(importe) > 0)) errores.importe = 'Ingresá la cuota mensual';
    if (importeClase && !(Number(importeClase) > 0))
      errores.importeClase = 'Importe inválido';
  }
  const ver = (k: string) =>
    (intento ? errores[k] : undefined) ??
    (errorApi?.field === k ? errorApi.mensaje : undefined);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (guardando) return;
    setIntento(true);
    if (Object.keys(errores).length) return;
    setGuardando(true);
    setErrorApi(null);
    const body = {
      nombre: nombre.trim(),
      tipo_clase_id: Number(tipoId),
      cupo: tipo?.es_grupal && cupo ? Number(cupo) : null,
    };
    try {
      const c = edicion
        ? await actualizarClase(inicial!.id, body)
        : await crearClase({
            ...body,
            ...(conPrecio
              ? {
                  precio: {
                    vigente_desde: mes,
                    importe_mensual: Number(importe),
                    importe_clase: importeClase ? Number(importeClase) : null,
                  },
                }
              : {}),
          });
      notifySuccess(edicion ? 'Clase actualizada' : 'Clase creada');
      onGuardada(c);
    } catch (err) {
      const e2 = errorDeApi(err);
      setErrorApi({
        mensaje: e2.mensaje,
        field:
          e2.field === 'vigente_desde'
            ? 'mes'
            : e2.field === 'importe_mensual'
              ? 'importe'
              : e2.field,
      });
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <Campo id="clase-nombre" label="Nombre" requerido error={ver('nombre')}>
        <input
          id="clase-nombre"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setErrorApi(null);
          }}
          className={claseCampo}
          maxLength={80}
          placeholder="Ej: Guitarra"
        />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id="clase-tipo"
          label="Tipo"
          requerido
          error={ver('tipo_clase_id')}
          ayuda={
            tipo
              ? tipo.es_grupal
                ? 'Grupal: varios alumnos comparten el turno.'
                : 'Individual: un alumno por turno.'
              : undefined
          }
        >
          <select
            id="clase-tipo"
            value={tipoId}
            onChange={(e) =>
              setTipoId(e.target.value ? Number(e.target.value) : '')
            }
            className={claseCampo}
          >
            <option value="">Elegí</option>
            {tipos
              .filter((x) => x.activo || x.id === inicial?.tipo_clase_id)
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nombre}
                </option>
              ))}
          </select>
        </Campo>
        {tipo?.es_grupal && (
          <Campo
            id="clase-cupo"
            label="Cupo por turno"
            error={ver('cupo')}
            ayuda="Vacío = sin tope"
          >
            <input
              id="clase-cupo"
              type="number"
              min={1}
              inputMode="numeric"
              value={cupo}
              onChange={(e) => setCupo(e.target.value)}
              className={claseCampo}
            />
          </Campo>
        )}
      </div>

      {!edicion && (
        <fieldset className="rounded-lg border border-brand-100 p-3">
          <legend className="px-1 text-sm text-brand-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={conPrecio}
                onChange={(e) => setConPrecio(e.target.checked)}
                className="h-4 w-4 rounded border-brand-300 text-brand-600"
              />
              Cargar precio
            </label>
          </legend>
          {conPrecio && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Campo id="precio-mes" label="Desde" requerido error={ver('mes')}>
                <input
                  id="precio-mes"
                  type="month"
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className={claseCampo}
                />
              </Campo>
              <Campo
                id="precio-importe"
                label="Cuota mensual"
                requerido
                error={ver('importe')}
              >
                <input
                  id="precio-importe"
                  type="number"
                  min={1}
                  step="0.01"
                  inputMode="decimal"
                  value={importe}
                  onChange={(e) => setImporte(e.target.value)}
                  className={claseCampo}
                />
              </Campo>
              <Campo
                id="precio-clase"
                label="Clase suelta"
                error={ver('importeClase')}
                ayuda="Para el mes de alta"
              >
                <input
                  id="precio-clase"
                  type="number"
                  min={1}
                  step="0.01"
                  inputMode="decimal"
                  value={importeClase}
                  onChange={(e) => setImporteClase(e.target.value)}
                  className={claseCampo}
                />
              </Campo>
            </div>
          )}
        </fieldset>
      )}

      {errorApi &&
        !['nombre', 'tipo_clase_id', 'cupo', 'mes', 'importe'].includes(
          errorApi.field ?? '',
        ) && <AvisoError mensaje={errorApi.mensaje} />}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <BotonSecundario
          type="button"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </BotonSecundario>
        <BotonPrimario type="submit" cargando={guardando}>
          {guardando
            ? 'Guardando…'
            : edicion
              ? 'Guardar cambios'
              : 'Crear clase'}
        </BotonPrimario>
      </div>
    </form>
  );
}
