'use client';

import EmptyState from '@/components/ui/EmptyState';
import { formatDelta, formatPesos, MOVIMIENTOS } from '@/app/lib/inventario';
import {
  getMovimientos,
  mensajeError,
  Movimiento,
} from '@/app/lib/inventario.api';
import { History, Receipt } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const PAGINA = 30;

const fecha = (iso: string) =>
  new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

/** Historial del ledger, del más nuevo al más viejo. `version` fuerza recarga. */
export default function MovimientosLista({
  stockItemId,
  version,
}: {
  stockItemId?: number | null;
  version: number;
}) {
  const [movs, setMovs] = useState<Movimiento[]>([]);
  const [hayMas, setHayMas] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(
    async (offset: number) => {
      setCargando(true);
      try {
        setError(null);
        const r = await getMovimientos({
          stock_item_id: stockItemId ?? undefined,
          limit: PAGINA,
          offset,
        });
        setMovs((prev) => (offset === 0 ? r.data : [...prev, ...r.data]));
        setHayMas(r.data.length === PAGINA);
      } catch (err) {
        setError(mensajeError(err, 'No se pudo cargar el historial.'));
      } finally {
        setCargando(false);
      }
    },
    [stockItemId],
  );

  useEffect(() => {
    cargar(0);
  }, [cargar, version]);

  if (error)
    return (
      <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
    );
  if (!cargando && !movs.length) {
    return (
      <EmptyState
        icono={History}
        titulo="Sin movimientos"
        mensaje="Acá vas a ver cada compra, conteo y merma, con quién la cargó."
      />
    );
  }

  return (
    <div className="space-y-2">
      <ul className="divide-y divide-brand-50 rounded-xl border border-brand-100 bg-white shadow-card">
        {movs.map((m) => {
          const t = MOVIMIENTOS[m.tipo];
          return (
            <li
              key={m.id}
              className="flex items-start justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-brand-800">{m.item}</p>
                <p className="text-xs text-brand-300">
                  <span className={t.color}>{t.label}</span> ·{' '}
                  {fecha(m.created_at)}
                  {m.usuario ? ` · ${m.usuario}` : ''}
                </p>
                {m.nota && (
                  <p className="mt-0.5 truncate text-xs text-brand-300">
                    {m.nota}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p
                  className={`font-semibold tabular-nums ${m.cantidad > 0 ? 'text-emerald-700' : 'text-brand-800'}`}
                >
                  {formatDelta(m.cantidad, m.unidad)}
                </p>
                {m.costo_total != null && (
                  <p className="flex items-center justify-end gap-1 text-xs text-brand-300">
                    {m.salida_caja_id && (
                      <Receipt size={12} aria-label="Registrado como gasto" />
                    )}
                    {formatPesos(m.costo_total)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {cargando && (
        <p className="text-center text-sm text-brand-300">Cargando…</p>
      )}
      {hayMas && !cargando && (
        <button
          onClick={() => cargar(movs.length)}
          className="min-h-[44px] w-full rounded-lg border border-brand-200 text-sm text-brand-700 hover:bg-brand-50"
        >
          Ver más
        </button>
      )}
    </div>
  );
}
