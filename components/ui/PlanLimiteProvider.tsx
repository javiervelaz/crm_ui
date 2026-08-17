'use client';

import { PLAN_LIMITE_EVENT, PlanLimiteDetail } from '@/app/lib/planLimiteEvents';
import { Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Modal de límite de plan (tarea 4.2).
 *
 * Montarlo UNA vez en app/layout.tsx, dentro de la rama privada:
 *   <PlanLimiteProvider />
 *
 * Reemplaza el redirect automático de apiClient. El usuario decide si va a ver
 * los planes o sigue donde estaba — y en el segundo caso no pierde lo que tenía
 * cargado en el formulario.
 */
export default function PlanLimiteProvider() {
  const router = useRouter();
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    const onLimite = (e: Event) => {
      setMensaje((e as CustomEvent<PlanLimiteDetail>).detail.mensaje);
    };
    window.addEventListener(PLAN_LIMITE_EVENT, onLimite);
    return () => window.removeEventListener(PLAN_LIMITE_EVENT, onLimite);
  }, []);

  useEffect(() => {
    if (!mensaje) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMensaje(null); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [mensaje]);

  if (!mensaje) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-limite-titulo"
    >
      <div className="absolute inset-0 bg-brand-900/50" onClick={() => setMensaje(null)} />

      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-soft">
        <button
          type="button"
          onClick={() => setMensaje(null)}
          aria-label="Cerrar"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md text-brand-300 hover:bg-brand-50"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-400/20">
          <Sparkles size={22} className="text-accent-600" />
        </div>

        <h2 id="plan-limite-titulo" className="font-display text-lg font-bold text-brand-800">
          Esta función no está en tu plan
        </h2>
        <p className="mt-2 text-sm text-brand-300">{mensaje}</p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setMensaje(null)}
            className="min-h-[44px] rounded-lg border border-brand-200 bg-white px-5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
          >
            Seguir acá
          </button>
          <button
            type="button"
            onClick={() => { setMensaje(null); router.push('/dashboard/upgrade-plan'); }}
            className="min-h-[44px] rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-700"
          >
            Ver planes
          </button>
        </div>
      </div>
    </div>
  );
}
