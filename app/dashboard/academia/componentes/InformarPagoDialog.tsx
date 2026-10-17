'use client';

import {
  tamañoLegible,
  validarComprobante,
  validarFechaPago,
  ACCEPT_COMPROBANTE,
  type Cuota,
} from '@/app/lib/edu/cuotas';
import { informarPago } from '@/app/lib/edu/cuotas.api';
import { errorDeApi, fechaCorta, hoy, pesos } from '@/app/lib/edu/reglas';
import { notifySuccess } from '@/app/lib/notificationService';
import Dialog from '@/components/ui/Dialog';
import { useState } from 'react';
import {
  AvisoError,
  BotonPrimario,
  BotonSecundario,
  Campo,
  claseCampo,
} from './ui';

/** El alumno o tutor informa un pago subiendo el comprobante; la academia lo confirma. */
export default function InformarPagoDialog({
  cuotas,
  total,
  onClose,
  onInformado,
}: {
  cuotas: Cuota[];
  total: number;
  onClose: () => void;
  onInformado: () => void;
}) {
  const hoyISO = hoy();
  const [fecha, setFecha] = useState(hoyISO);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [observacion, setObservacion] = useState('');
  const [intento, setIntento] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const errorArchivo = validarComprobante(archivo);
  const errorFecha = validarFechaPago(fecha, hoyISO);

  const enviar = async () => {
    setIntento(true);
    if (errorArchivo || errorFecha || !archivo) return;
    try {
      setError(null);
      setEnviando(true);
      await informarPago({
        cuota_ids: cuotas.map((c) => c.id),
        fecha_pago: fecha,
        observacion: observacion.trim() || undefined,
        comprobante: archivo,
      });
      notifySuccess('Pago informado: la academia lo va a revisar');
      onInformado();
    } catch (err) {
      setError(errorDeApi(err, 'No se pudo informar el pago').mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog titulo="Informar pago" onClose={onClose} bloquear={enviando}>
      <div className="space-y-4 text-sm">
        <ul className="divide-y divide-brand-100 rounded-lg border border-brand-100">
          {cuotas.map((c) => (
            <li key={c.id} className="flex justify-between gap-3 px-3 py-2">
              <span>
                <span className="font-medium text-brand-800">{c.alumno}</span>
                <span className="block text-xs text-brand-400">
                  {c.clase} · vence {fechaCorta(c.vence)}
                </span>
              </span>
              <span className="font-medium">{pesos(c.total_hoy)}</span>
            </li>
          ))}
          <li className="flex justify-between bg-brand-50 px-3 py-2 font-semibold text-brand-800">
            <span>Total</span>
            <span data-testid="ip-total">{pesos(total)}</span>
          </li>
        </ul>

        <Campo
          id="ip-archivo"
          label="Comprobante"
          requerido
          error={intento || archivo ? (errorArchivo ?? undefined) : undefined}
          ayuda="JPG, PNG, WEBP o PDF, hasta 5 MB."
        >
          <input
            id="ip-archivo"
            type="file"
            accept={ACCEPT_COMPROBANTE}
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:min-h-[44px] file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:text-brand-700"
          />
        </Campo>
        {archivo && !errorArchivo && (
          <p className="-mt-2 text-xs text-brand-400">
            {archivo.name} · {tamañoLegible(archivo.size)}
          </p>
        )}
        <Campo
          id="ip-fecha"
          label="Fecha en que pagaste"
          requerido
          error={errorFecha ?? undefined}
        >
          <input
            id="ip-fecha"
            type="date"
            value={fecha}
            max={hoyISO}
            onChange={(e) => setFecha(e.target.value)}
            className={claseCampo}
          />
        </Campo>
        <Campo id="ip-obs" label="Observación">
          <input
            id="ip-obs"
            value={observacion}
            maxLength={500}
            onChange={(e) => setObservacion(e.target.value)}
            className={claseCampo}
          />
        </Campo>

        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          El total puede variar: la academia confirma la fecha de pago y calcula
          el recargo sobre esa fecha.
        </p>

        {error && <AvisoError mensaje={error} />}

        <div className="flex justify-end gap-2">
          <BotonSecundario type="button" onClick={onClose} disabled={enviando}>
            Cancelar
          </BotonSecundario>
          <BotonPrimario type="button" onClick={enviar} cargando={enviando}>
            Informar pago
          </BotonPrimario>
        </div>
      </div>
    </Dialog>
  );
}
