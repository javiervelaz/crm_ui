'use client';

import { getClienteId } from '@/app/lib/authService';
import {
  TIPOS_GASTO,
  formatoPesos,
  mesActual,
  rangoMes,
  totalGastos,
  totalesPorTipo,
  validarGasto,
  type GastoPeriodo,
  type TipoGastoId,
} from '@/app/lib/gastosPeriodo';
import {
  crearGastoSinCaja,
  eliminarGastoSinCaja,
  getGastosPorPeriodo,
} from '@/app/lib/gastosSinCaja.api';
import { logError } from '@/app/lib/logger';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';

/**
 * Flujo para tenants sin caja (sin el módulo 'operaciones', ej. academias).
 * No hay apertura de caja: los gastos se cargan directo y se consultan por mes.
 */
export default function GastosSinCaja() {
  const [mes, setMes] = useState(mesActual());
  const [gastos, setGastos] = useState<GastoPeriodo[]>([]);
  const [estado, setEstado] = useState<'cargando' | 'ok' | 'error'>('cargando');

  const [tipo, setTipo] = useState<TipoGastoId>(TIPOS_GASTO[0].id);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    const rango = rangoMes(mes);
    if (!rango) return;
    setEstado('cargando');
    try {
      setGastos(await getGastosPorPeriodo(rango.desde, rango.hasta));
      setEstado('ok');
    } catch (error) {
      logError('Error cargando gastos del mes', error);
      setEstado('error');
    }
  }, [mes]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const agregar = async (e: FormEvent) => {
    e.preventDefault();
    const error = validarGasto(descripcion, monto);
    if (error) {
      notifyError(error);
      return;
    }
    setGuardando(true);
    try {
      await crearGastoSinCaja({ descripcion, monto: Number(monto), tipo });
      notifySuccess('Gasto registrado');
      setDescripcion('');
      setMonto('');
      // El gasto se guarda con fecha de hoy: si se está mirando otro mes, se vuelve al actual.
      if (mes !== mesActual()) setMes(mesActual());
      else await cargar();
    } catch (error: any) {
      logError('Error registrando gasto', error);
      // El interceptor ya muestra el toast en 401/403; acá los demás.
      const status = error?.response?.status;
      if (status !== 401 && status !== 403) {
        notifyError(error?.response?.data?.error || 'No se pudo registrar el gasto');
      }
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (g: GastoPeriodo) => {
    if (!confirm(`¿Eliminar "${g.descripcion}"?`)) return;
    try {
      await eliminarGastoSinCaja(g.id, getClienteId());
      notifySuccess('Gasto eliminado');
      await cargar();
    } catch (error: any) {
      logError('Error eliminando gasto', error);
      const status = error?.response?.status;
      if (status !== 401 && status !== 403) notifyError('No se pudo eliminar el gasto');
    }
  };

  const total = totalGastos(gastos);
  const porTipo = totalesPorTipo(gastos);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-brand-800 md:text-2xl">Gastos</h1>
          <p className="text-sm text-brand-300">Registrá los gastos del negocio y consultalos por mes.</p>
        </div>
        <label className="text-sm text-brand-600">
          <span className="mb-1 block font-medium">Mes</span>
          <input
            type="month"
            value={mes}
            max={mesActual()}
            onChange={(e) => e.target.value && setMes(e.target.value)}
            className="rounded-md border border-brand-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {/* Alta */}
      <form
        onSubmit={agregar}
        className="grid gap-3 rounded-xl border border-brand-100 bg-white p-4 shadow-card md:grid-cols-[10rem_1fr_10rem_auto] md:items-end"
      >
        <label className="text-sm text-brand-600">
          <span className="mb-1 block font-medium">Tipo</span>
          <select
            value={tipo}
            onChange={(e) => setTipo(Number(e.target.value) as TipoGastoId)}
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm"
          >
            {TIPOS_GASTO.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </label>
        <label className="text-sm text-brand-600">
          <span className="mb-1 block font-medium">Descripción</span>
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej.: Alquiler del salón"
            maxLength={255}
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm text-brand-600">
          <span className="mb-1 block font-medium">Monto ($)</span>
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={guardando}
          className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          <Plus size={16} />
          {guardando ? 'Guardando...' : 'Agregar'}
        </button>
      </form>

      {/* Resumen del mes */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-brand-100 bg-white p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">Total del mes</p>
          <p className="mt-1 text-lg font-bold text-brand-800">{formatoPesos(total)}</p>
        </div>
        {porTipo.map((t) => (
          <div key={t.id} className="rounded-xl border border-brand-100 bg-white p-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">{t.label}</p>
            <p className="mt-1 text-lg font-semibold text-brand-700">{formatoPesos(t.total)}</p>
          </div>
        ))}
      </div>

      {/* Listado */}
      {estado === 'cargando' && (
        <div className="animate-pulse space-y-2" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-brand-100" />
          ))}
        </div>
      )}
      {estado === 'error' && <ErrorState onRetry={cargar} />}
      {estado === 'ok' && gastos.length === 0 && (
        <EmptyState
          titulo="Sin gastos en este mes"
          mensaje="Cargá el primero con el formulario de arriba."
          icono={Wallet}
        />
      )}
      {estado === 'ok' && gastos.length > 0 && (
        <ul className="divide-y divide-brand-100 rounded-xl border border-brand-100 bg-white shadow-card">
          {gastos.map((g) => (
            <li key={g.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="w-24 shrink-0 tabular-nums text-brand-300">
                {String(g.fecha).slice(0, 10).split('-').reverse().join('/')}
              </span>
              <span className="min-w-0 flex-1 truncate text-brand-800">
                {g.descripcion}
                {g.categoria_nombre && (
                  <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-brand-600">
                    {g.categoria_nombre}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-brand-800">
                {formatoPesos(Number(g.monto))}
              </span>
              <button
                type="button"
                onClick={() => eliminar(g)}
                aria-label={`Eliminar ${g.descripcion}`}
                className="shrink-0 rounded-md p-2 text-brand-300 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
