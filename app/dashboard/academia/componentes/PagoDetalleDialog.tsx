'use client';

import {
  validarFechaPago,
  validarMotivo,
  estadoPago,
} from '@/app/lib/edu/cuotas';
import {
  aprobarPago,
  calcularPago,
  comprobanteDePago,
  rechazarPago,
  type Calculo,
  type Pago,
} from '@/app/lib/edu/cuotas.api';
import {
  errorDeApi,
  fechaCorta,
  hoy,
  nombreMes,
  pesos,
} from '@/app/lib/edu/reglas';
import { notifySuccess } from '@/app/lib/notificationService';
import Dialog from '@/components/ui/Dialog';
import { useEffect, useState } from 'react';
import ComprobanteBoton from './ComprobanteBoton';
import {
  AvisoError,
  BotonPrimario,
  BotonSecundario,
  Campo,
  claseCampo,
  Etiqueta,
} from './ui';

/** Detalle de un pago; si está pendiente, la academia lo aprueba (confirmando la fecha) o lo rechaza con motivo. */
export default function PagoDetalleDialog({
  pago,
  onClose,
  onResuelto,
}: {
  pago: Pago;
  onClose: () => void;
  onResuelto: () => void;
}) {
  const hoyISO = hoy();
  const pendiente = pago.estado === 'pendiente';
  const [modo, setModo] = useState<'ver' | 'aprobar' | 'rechazar'>('ver');
  const [fecha, setFecha] = useState(pago.fecha_pago?.slice(0, 10) || hoyISO);
  const [motivo, setMotivo] = useState('');
  const [calculo, setCalculo] = useState<Calculo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState(false);
  const errorFecha = validarFechaPago(fecha, hoyISO);
  const errorMotivo = modo === 'rechazar' ? validarMotivo(motivo) : null;
  const est = estadoPago(pago.estado);

  useEffect(() => {
    if (modo !== 'aprobar' || errorFecha) {
      setCalculo(null);
      return;
    }
    let vigente = true;
    calcularPago({ pago_id: pago.id, fecha_pago: fecha })
      .then((c) => vigente && setCalculo(c))
      .catch(
        (err) =>
          vigente && setError(errorDeApi(err, 'No se pudo calcular').mensaje),
      );
    return () => {
      vigente = false;
    };
  }, [modo, fecha, errorFecha, pago.id]);

  const resolver = async () => {
    try {
      setError(null);
      setTrabajando(true);
      if (modo === 'aprobar') {
        await aprobarPago(pago.id, { fecha_pago: fecha });
        notifySuccess('Pago aprobado');
      } else {
        await rechazarPago(pago.id, motivo.trim());
        notifySuccess('Pago rechazado: las cuotas vuelven a quedar pendientes');
      }
      onResuelto();
    } catch (err) {
      setError(errorDeApi(err, 'No se pudo resolver el pago').mensaje);
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <Dialog
      titulo={`Pago #${pago.id}`}
      onClose={onClose}
      bloquear={trabajando}
      ancho="max-w-xl"
    >
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Etiqueta tono={est.tono}>{est.texto}</Etiqueta>
          <Etiqueta>
            {pago.origen === 'portal'
              ? 'Informado por el alumno'
              : 'Cargado por la academia'}
          </Etiqueta>
          {pago.fuera_de_termino && (
            <Etiqueta tono="aviso">Fuera de término</Etiqueta>
          )}
        </div>

        <ul className="divide-y divide-brand-100 rounded-lg border border-brand-100">
          {pago.cuotas.map((l) => {
            const nueva =
              modo === 'aprobar'
                ? calculo?.lineas.find((x) => x.cuota_id === l.cuota_id)
                : null;
            const total = nueva ? nueva.total : (l.total ?? l.importe);
            const pct = nueva ? nueva.recargo_pct : Number(l.recargo_pct ?? 0);
            return (
              <li
                key={l.cuota_id}
                className="flex items-start justify-between gap-3 px-3 py-2"
              >
                <div>
                  <p className="font-medium text-brand-800">{l.alumno}</p>
                  <p className="text-xs text-brand-400">
                    {l.clase} · {nombreMes(l.periodo)} · vence{' '}
                    {fechaCorta(l.vence)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{pesos(total)}</p>
                  {pct > 0 && (
                    <p className="text-xs text-amber-700">
                      incluye {pct}% de recargo
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <dl className="grid grid-cols-2 gap-2 text-brand-600">
          <dt>Fecha informada</dt>
          <dd>{fechaCorta(pago.fecha_pago)}</dd>
          {pago.medio_pago && (
            <>
              <dt>Medio</dt>
              <dd>{pago.medio_pago}</dd>
            </>
          )}
          {pago.observacion && (
            <>
              <dt>Observación</dt>
              <dd>{pago.observacion}</dd>
            </>
          )}
          {pago.estado === 'rechazado' && (
            <>
              <dt>Motivo del rechazo</dt>
              <dd data-testid="pago-motivo">{pago.motivo_rechazo}</dd>
            </>
          )}
        </dl>

        {pago.tiene_comprobante && (
          <ComprobanteBoton obtener={() => comprobanteDePago(pago.id)} />
        )}

        {modo === 'aprobar' && (
          <div className="space-y-3 rounded-lg bg-brand-50 p-3">
            <Campo
              id="ap-fecha"
              label="Fecha de pago a confirmar"
              requerido
              error={errorFecha ?? undefined}
              ayuda="El recargo se calcula sobre esta fecha."
            >
              <input
                id="ap-fecha"
                type="date"
                value={fecha}
                max={hoyISO}
                onChange={(e) => setFecha(e.target.value)}
                className={claseCampo}
              />
            </Campo>
            <p className="flex justify-between">
              <span>Total a aprobar</span>
              <strong data-testid="ap-total">
                {calculo ? pesos(calculo.total) : '—'}
              </strong>
            </p>
          </div>
        )}
        {modo === 'rechazar' && (
          <Campo
            id="rc-motivo"
            label="Motivo del rechazo"
            requerido
            error={motivo ? (errorMotivo ?? undefined) : undefined}
            ayuda="Lo ve quien informó el pago."
          >
            <textarea
              id="rc-motivo"
              value={motivo}
              maxLength={500}
              rows={3}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-600"
            />
          </Campo>
        )}

        {error && <AvisoError mensaje={error} />}

        <div className="flex flex-wrap justify-end gap-2">
          {modo === 'ver' ? (
            <>
              <BotonSecundario type="button" onClick={onClose}>
                Cerrar
              </BotonSecundario>
              {pendiente && (
                <>
                  <BotonSecundario
                    type="button"
                    onClick={() => setModo('rechazar')}
                  >
                    Rechazar
                  </BotonSecundario>
                  <BotonPrimario
                    type="button"
                    onClick={() => setModo('aprobar')}
                  >
                    Aprobar
                  </BotonPrimario>
                </>
              )}
            </>
          ) : (
            <>
              <BotonSecundario
                type="button"
                onClick={() => {
                  setModo('ver');
                  setError(null);
                }}
                disabled={trabajando}
              >
                Volver
              </BotonSecundario>
              <BotonPrimario
                type="button"
                onClick={resolver}
                cargando={trabajando}
                disabled={
                  modo === 'aprobar' ? !!errorFecha || !calculo : !!errorMotivo
                }
              >
                {modo === 'aprobar'
                  ? 'Confirmar aprobación'
                  : 'Confirmar rechazo'}
              </BotonPrimario>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
