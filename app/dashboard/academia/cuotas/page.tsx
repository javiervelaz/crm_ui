'use client';

import {
  estadoCuota,
  detalleCuota,
  num,
  resumenCuotas,
  seleccionable,
  type Cuota,
  type EstadoCuota,
} from '@/app/lib/edu/cuotas';
import { listarCuotas } from '@/app/lib/edu/cuotas.api';
import { fechaCorta, mesActual, nombreMes, pesos } from '@/app/lib/edu/reglas';
import { logError } from '@/app/lib/logger';
import { TableSkeleton } from '@/app/ui/TableSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import ResponsiveTable, { Columna } from '@/components/ui/ResponsiveTable';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import GenerarCuotasDialog from '../componentes/GenerarCuotasDialog';
import RegistrarPagoDialog from '../componentes/RegistrarPagoDialog';
import {
  BotonPrimario,
  BotonSecundario,
  claseCampo,
  Encabezado,
  Etiqueta,
} from '../componentes/ui';

export default function CuotasPage() {
  const [mes, setMes] = useState(mesActual());
  const [estado, setEstado] = useState<EstadoCuota | ''>('');
  const [q, setQ] = useState('');
  const [datos, setDatos] = useState<Cuota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [pagando, setPagando] = useState(false);
  const [generando, setGenerando] = useState(false);
  const periodo = `${mes}-01`;

  const cargar = useCallback(async () => {
    try {
      setError(false);
      setCargando(true);
      setDatos(await listarCuotas({ periodo, estado: estado || undefined }));
      setSel(new Set());
    } catch (err) {
      logError('Error al cargar cuotas', err);
      setError(true);
    } finally {
      setCargando(false);
    }
  }, [periodo, estado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? datos.filter((c) => c.alumno.toLowerCase().includes(t)) : datos;
  }, [datos, q]);

  const resumen = useMemo(() => resumenCuotas(filtradas), [filtradas]);
  const elegidas = filtradas.filter((c) => sel.has(c.id));
  const alternar = (id: number) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const columnas: Columna<Cuota>[] = [
    {
      key: 'sel',
      header: '',
      mobile: 'hidden',
      render: (c) =>
        seleccionable(c) ? (
          <input
            type="checkbox"
            aria-label={`Seleccionar cuota de ${c.alumno}, ${c.clase}`}
            checked={sel.has(c.id)}
            onChange={() => alternar(c.id)}
            className="h-4 w-4 rounded border-brand-300 text-brand-600"
          />
        ) : null,
    },
    {
      key: 'alumno',
      header: 'Alumno',
      mobile: 'primary',
      sortValue: (c) => c.alumno.toLowerCase(),
      render: (c) => (
        <span className="flex items-center gap-2">
          {seleccionable(c) && (
            <input
              type="checkbox"
              aria-label={`Seleccionar cuota de ${c.alumno}, ${c.clase}`}
              checked={sel.has(c.id)}
              onChange={() => alternar(c.id)}
              className="h-4 w-4 rounded border-brand-300 text-brand-600 md:hidden"
            />
          )}
          <span className="font-semibold text-brand-800">{c.alumno}</span>
        </span>
      ),
    },
    {
      key: 'clase',
      header: 'Clase',
      mobile: 'secondary',
      sortValue: (c) => c.clase.toLowerCase(),
      render: (c) => (
        <span>
          {c.clase}
          {detalleCuota(c).map((d) => (
            <span key={d} className="block text-xs text-brand-400">
              {d}
            </span>
          ))}
        </span>
      ),
    },
    {
      key: 'importe',
      header: 'Importe',
      align: 'right',
      mobile: 'secondary',
      sortValue: (c) => num(c.importe),
      render: (c) => pesos(c.importe),
    },
    {
      key: 'vence',
      header: 'Vence',
      mobile: 'meta',
      sortValue: (c) => c.vence,
      render: (c) => fechaCorta(c.vence),
    },
    {
      key: 'hoy',
      header: 'A pagar hoy',
      align: 'right',
      mobile: 'meta',
      render: (c) =>
        c.estado === 'pendiente' ? (
          <span>
            {pesos(c.total_hoy)}
            {num(c.recargo_pct) > 0 && (
              <span className="block text-xs text-amber-700">
                +{num(c.recargo_pct)}% recargo
              </span>
            )}
          </span>
        ) : (
          '—'
        ),
    },
    {
      key: 'estado',
      header: 'Estado',
      mobile: 'meta',
      render: (c) => {
        const e = estadoCuota(c);
        return <Etiqueta tono={e.tono}>{e.texto}</Etiqueta>;
      },
    },
  ];

  return (
    <div>
      <Encabezado
        titulo="Cuotas"
        subtitulo={`Cuotas de ${nombreMes(periodo)}`}
        acciones={
          <>
            <BotonSecundario
              type="button"
              title="Las cuotas se generan solas el día 1 de cada mes. Usalo para adelantar un mes o recuperar uno."
              onClick={() => setGenerando(true)}
            >
              Generar cuotas de un mes
            </BotonSecundario>
            <BotonPrimario
              type="button"
              disabled={elegidas.length === 0}
              onClick={() => setPagando(true)}
            >
              Registrar pago{elegidas.length ? ` (${elegidas.length})` : ''}
            </BotonPrimario>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <label className="relative">
          <span className="sr-only">Buscar alumno</span>
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-300"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar alumno"
            className={`${claseCampo} pl-9`}
          />
        </label>
        <label>
          <span className="sr-only">Mes</span>
          <input
            type="month"
            value={mes}
            onChange={(e) => e.target.value && setMes(e.target.value)}
            className={claseCampo}
          />
        </label>
        <label>
          <span className="sr-only">Estado</span>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoCuota | '')}
            className={claseCampo}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_revision">En revisión</option>
            <option value="pagada">Pagadas</option>
          </select>
        </label>
      </div>

      {!cargando && !error && (
        <dl
          data-testid="cuotas-resumen"
          className="mb-4 grid grid-cols-3 gap-3 text-center"
        >
          {[
            ['Por cobrar', pesos(resumen.porCobrar)],
            ['Vencidas', String(resumen.vencidas)],
            ['En revisión', String(resumen.enRevision)],
          ].map(([t, v]) => (
            <div
              key={t}
              className="rounded-xl border border-brand-100 bg-white p-3 shadow-card"
            >
              <dt className="text-xs text-brand-400">{t}</dt>
              <dd className="font-display text-lg text-brand-800">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {cargando ? (
        <TableSkeleton rows={5} cols={6} withFilter={false} />
      ) : error ? (
        <ErrorState onRetry={cargar} />
      ) : (
        <ResponsiveTable
          datos={filtradas}
          columnas={columnas}
          rowKey={(c) => c.id}
          vacio={{
            titulo: 'Sin cuotas',
            mensaje: `No hay cuotas en ${nombreMes(periodo)}. Se generan solas el día 1 de cada mes, o podés generarlas ahora.`,
            accion: {
              label: 'Generar cuotas de un mes',
              onClick: () => setGenerando(true),
            },
          }}
        />
      )}

      {pagando && (
        <RegistrarPagoDialog
          cuotas={elegidas}
          onClose={() => setPagando(false)}
          onRegistrado={() => {
            setPagando(false);
            cargar();
          }}
        />
      )}
      {generando && (
        <GenerarCuotasDialog
          periodo={periodo}
          onClose={() => setGenerando(false)}
          onGenerado={cargar}
        />
      )}
    </div>
  );
}
