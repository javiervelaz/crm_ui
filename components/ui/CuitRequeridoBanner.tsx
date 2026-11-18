'use client';

import {
  CUIT_CARGADO_EVENT,
  CUIT_REQUERIDO_EVENT,
  cargarCuit,
  getEstadoCuit,
} from '@/app/lib/cuit.api';
import { AlertTriangle } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

/**
 * El CUIT es opcional en el alta y obligatorio antes del primer pedido. Mientras
 * falte, este aviso queda arriba de todo el dashboard con el campo para cargarlo
 * ahí mismo. Si alguien intenta tomar un pedido sin CUIT, el aviso se resalta.
 */
export default function CuitRequeridoBanner() {
  const [falta, setFalta] = useState(false);
  const [resaltar, setResaltar] = useState(false);
  const [cuit, setCuit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const caja = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let vivo = true;
    // Un fallo de red no puede bloquear el dashboard: sin dato, no se muestra el aviso.
    getEstadoCuit()
      .then((e) => vivo && setFalta(!e.cuitCargado))
      .catch(() => {});
    const alRequerir = () => {
      setFalta(true);
      setResaltar(true);
      caja.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    const alCargar = () => setFalta(false);
    window.addEventListener(CUIT_REQUERIDO_EVENT, alRequerir);
    window.addEventListener(CUIT_CARGADO_EVENT, alCargar);
    return () => {
      vivo = false;
      window.removeEventListener(CUIT_REQUERIDO_EVENT, alRequerir);
      window.removeEventListener(CUIT_CARGADO_EVENT, alCargar);
    };
  }, []);

  if (!falta) return null;

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await cargarCuit(cuit);
      toast.success('CUIT guardado. Ya podés tomar pedidos.');
    } catch (err: any) {
      const data = err?.response?.data;
      setError(
        err?.response?.status === 403
          ? 'Solo el administrador del comercio puede cargar el CUIT.'
          : data?.error || 'No se pudo guardar el CUIT. Reintentá.',
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      ref={caja}
      role="status"
      className={`mb-4 flex flex-col gap-3 rounded-2xl border p-4 shadow-card sm:flex-row sm:items-center ${
        resaltar ? 'border-red-300 bg-red-50' : 'border-amber-200 bg-amber-50'
      }`}
    >
      <AlertTriangle
        className={`h-6 w-6 shrink-0 ${resaltar ? 'text-red-600' : 'text-amber-600'}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p
          className={`font-semibold ${resaltar ? 'text-red-900' : 'text-amber-900'}`}
        >
          Completá el CUIT de tu comercio para tomar pedidos
        </p>
        <p
          className={`text-sm ${resaltar ? 'text-red-800' : 'text-amber-800'}`}
        >
          Es obligatorio antes del primer pedido, tanto en el panel como en tu
          link de pedidos.
        </p>
        {error && (
          <p className="mt-1 text-sm font-medium text-red-700">{error}</p>
        )}
      </div>
      <form onSubmit={guardar} className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={cuit}
          onChange={(e) => setCuit(e.target.value)}
          placeholder="CUIT (11 dígitos)"
          aria-label="CUIT del comercio"
          required
          className="min-h-[44px] w-44 rounded-lg border border-brand-200 bg-white px-3 text-sm focus:border-brand-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={guardando}
          className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}
