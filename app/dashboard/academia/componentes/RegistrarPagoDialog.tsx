'use client';

import {
  calcularPago,
  registrarPago,
  type Calculo,
} from '@/app/lib/edu/cuotas.api';
import { validarFechaPago, type Cuota } from '@/app/lib/edu/cuotas';
import { errorDeApi, fechaCorta, hoy, pesos } from '@/app/lib/edu/reglas';
import { notifySuccess } from '@/app/lib/notificationService';
import Dialog from '@/components/ui/Dialog';
import { useEffect, useState } from 'react';
import {
  AvisoError,
  BotonPrimario,
  BotonSecundario,
  Campo,
  claseCampo,
} from './ui';

const MEDIOS = ['Efectivo', 'Transferencia', 'Tarjeta', 'Otro'];

/** Pago cargado por la academia: entra aprobado, con el recargo de la fecha de pago. */
export default function RegistrarPagoDialog({
  cuotas,
  onClose,
  onRegistrado,
}: {
  cuotas: Cuota[];
  onClose: () => void;
  onRegistrado: () => void;
}) {
  const hoyISO = hoy();
  const [fecha, setFecha] = useState(hoyISO);
  const [medio, setMedio] = useState('Efectivo');
  const [observacion, setObservacion] = useState('');
  const [calculo, setCalculo] = useState<Calculo | null>(null);
  const [errorFecha, setErrorFecha] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const ids = cuotas.map((c) => c.id);
  const clave = ids.join(',');

  useEffect(() => {
    const e = validarFechaPago(fecha, hoyISO);
    setErrorFecha(e);
    if (e) {
      setCalculo(null);
      return;
    }
    let vigente = true;
    calcularPago({ cuota_ids: ids, fecha_pago: fecha })
      .then((c) => vigente && setCalculo(c))
      .catch((err) => {
        if (vigente) {
          setCalculo(null);
          setError(errorDeApi(err, 'No se pudo calcular el total').mensaje);
        }
      });
    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha, clave, hoyISO]);

  const guardar = async () => {
    if (errorFecha) return;
    try {
      setError(null);
      setGuardando(true);
      await registrarPago({
        cuota_ids: ids,
        fecha_pago: fecha,
        medio_pago: medio,
        observacion: observacion.trim() || undefined,
      });
      notifySuccess('Pago registrado');
      onRegistrado();
    } catch (err) {
      setError(errorDeApi(err, 'No se pudo registrar el pago').mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const linea = (id: number) => calculo?.lineas.find((l) => l.cuota_id === id);

  return (
    <Dialog titulo="Registrar pago" onClose={onClose} bloquear={guardando}>
      <div className="space-y-4">
        <ul className="divide-y divide-brand-100 rounded-lg border border-brand-100 text-sm">
          {cuotas.map((c) => {
            const l = linea(c.id);
            return (
              <li
                key={c.id}
                className="flex items-start justify-between gap-3 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="font-medium text-brand-800">{c.alumno}</p>
                  <p className="text-xs text-brand-400">
                    {c.clase} · vence {fechaCorta(c.vence)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {pesos(l ? l.total : c.importe)}
                  </p>
                  {l && l.recargo_pct > 0 && (
                    <p className="text-xs text-amber-700">
                      incluye {l.recargo_pct}% de recargo
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="grid gap-3 sm:grid-cols-2">
          <Campo
            id="rp-fecha"
            label="Fecha de pago"
            requerido
            error={errorFecha ?? undefined}
          >
            <input
              id="rp-fecha"
              type="date"
              value={fecha}
              max={hoyISO}
              onChange={(e) => setFecha(e.target.value)}
              className={claseCampo}
            />
          </Campo>
          <Campo id="rp-medio" label="Medio de pago">
            <select
              id="rp-medio"
              value={medio}
              onChange={(e) => setMedio(e.target.value)}
              className={claseCampo}
            >
              {MEDIOS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Campo>
        </div>
        <Campo id="rp-obs" label="Observación">
          <input
            id="rp-obs"
            value={observacion}
            maxLength={500}
            onChange={(e) => setObservacion(e.target.value)}
            className={claseCampo}
          />
        </Campo>

        <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2">
          <span className="text-sm text-brand-600">Total a cobrar</span>
          <strong data-testid="rp-total" className="text-lg text-brand-800">
            {calculo ? pesos(calculo.total) : '—'}
          </strong>
        </div>

        {error && <AvisoError mensaje={error} />}

        <div className="flex justify-end gap-2">
          <BotonSecundario type="button" onClick={onClose} disabled={guardando}>
            Cancelar
          </BotonSecundario>
          <BotonPrimario
            type="button"
            onClick={guardar}
            cargando={guardando}
            disabled={!!errorFecha || !calculo}
          >
            Registrar pago
          </BotonPrimario>
        </div>
      </div>
    </Dialog>
  );
}
