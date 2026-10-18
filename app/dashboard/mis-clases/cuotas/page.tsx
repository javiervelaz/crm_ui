'use client';

import {
  agruparPorAlumno,
  detalleCuota,
  estadoCuota,
  estadoPago,
  num,
  seleccionable,
  sumaSeleccion,
  tituloCuota,
  type Cuota,
} from '@/app/lib/edu/cuotas';
import {
  miComprobante,
  misCuotas,
  misPagos,
  type Pago,
} from '@/app/lib/edu/cuotas.api';
import { fechaCorta, nombreMes, pesos } from '@/app/lib/edu/reglas';
import { logError } from '@/app/lib/logger';
import { TableSkeleton } from '@/app/ui/TableSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ComprobanteBoton from '../../academia/componentes/ComprobanteBoton';
import InformarPagoDialog from '../../academia/componentes/InformarPagoDialog';
import {
  BotonPrimario,
  Etiqueta,
  Tarjeta,
} from '../../academia/componentes/ui';

/** Cuotas y pagos propios (alumno) o de los hijos (tutor). La API ya filtra por alcance. */
export default function MisCuotasPage() {
  const [cuotas, setCuotas] = useState<Cuota[] | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [error, setError] = useState(false);
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [informando, setInformando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError(false);
      const [c, p] = await Promise.all([misCuotas(), misPagos()]);
      setCuotas(c);
      setPagos(p);
      setSel(new Set());
    } catch (err) {
      logError('Error al cargar mis cuotas', err);
      setError(true);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const grupos = useMemo(() => agruparPorAlumno(cuotas ?? []), [cuotas]);
  const elegidas = (cuotas ?? []).filter((c) => sel.has(c.id));
  const total = sumaSeleccion(cuotas ?? [], sel, 'total_hoy');
  const alternar = (id: number) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  if (error) return <ErrorState onRetry={cargar} />;
  if (!cuotas) return <TableSkeleton rows={4} cols={4} withFilter={false} />;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl text-brand-800">Cuotas y pagos</h1>

      {cuotas.length === 0 ? (
        <EmptyState
          titulo="Todavía no hay cuotas"
          mensaje="Cuando la academia genere las cuotas del mes, las vas a ver acá."
        />
      ) : (
        grupos.map((g) => (
          <Tarjeta
            key={g.alumno_id}
            titulo={grupos.length > 1 ? g.alumno : 'Cuotas'}
          >
            <ul className="divide-y divide-brand-100">
              {g.cuotas.map((c) => {
                const e = estadoCuota(c);
                return (
                  <li
                    key={c.id}
                    className="flex items-start gap-3 py-3"
                    data-testid="mi-cuota"
                  >
                    {seleccionable(c) ? (
                      <input
                        type="checkbox"
                        aria-label={`Seleccionar ${tituloCuota(c)}`}
                        checked={sel.has(c.id)}
                        onChange={() => alternar(c.id)}
                        className="mt-1 h-5 w-5 rounded border-brand-300 text-brand-600"
                      />
                    ) : (
                      <span className="w-5" aria-hidden="true" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-brand-800">
                        {tituloCuota(c)}
                      </p>
                      <p className="text-xs text-brand-400">
                        Vence {fechaCorta(c.vence)}
                        {detalleCuota(c).map((d) => ` · ${d}`)}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">
                        {pesos(
                          c.estado === 'pendiente' ? c.total_hoy : c.importe,
                        )}
                      </p>
                      {c.estado === 'pendiente' && num(c.recargo_pct) > 0 && (
                        <p className="text-xs text-amber-700">
                          incluye {num(c.recargo_pct)}% de recargo
                        </p>
                      )}
                      <Etiqueta tono={e.tono}>{e.texto}</Etiqueta>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Tarjeta>
        ))
      )}

      {elegidas.length > 0 && (
        <div className="sticky bottom-3 flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-white p-3 shadow-brand">
          <p className="text-sm text-brand-700">
            {elegidas.length} {elegidas.length === 1 ? 'cuota' : 'cuotas'} ·{' '}
            <strong data-testid="sel-total">{pesos(total)}</strong>
          </p>
          <BotonPrimario type="button" onClick={() => setInformando(true)}>
            Informar pago
          </BotonPrimario>
        </div>
      )}

      <Tarjeta titulo="Mis pagos">
        {pagos.length === 0 ? (
          <p className="text-sm text-brand-400">Todavía no informaste pagos.</p>
        ) : (
          <ul className="divide-y divide-brand-100">
            {pagos.map((p) => {
              const e = estadoPago(p.estado);
              return (
                <li
                  key={p.id}
                  className="space-y-1 py-3 text-sm"
                  data-testid="mi-pago"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-brand-800">
                      {fechaCorta(p.fecha_pago)} ·{' '}
                      {p.cuotas
                        .map((l) => `${l.clase} ${nombreMes(l.periodo)}`)
                        .join(', ')}
                    </span>
                    <Etiqueta tono={e.tono}>{e.texto}</Etiqueta>
                  </div>
                  {p.estado === 'aprobado' && (
                    <p className="text-brand-600">
                      Total abonado: {pesos(p.importe_total)}
                    </p>
                  )}
                  {p.estado === 'rechazado' && (
                    <p className="text-red-700">
                      Motivo del rechazo: {p.motivo_rechazo}. Podés volver a
                      informar el pago.
                    </p>
                  )}
                  {p.tiene_comprobante && (
                    <ComprobanteBoton obtener={() => miComprobante(p.id)} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Tarjeta>

      {informando && (
        <InformarPagoDialog
          cuotas={elegidas}
          total={total}
          onClose={() => setInformando(false)}
          onInformado={() => {
            setInformando(false);
            cargar();
          }}
        />
      )}
    </div>
  );
}
