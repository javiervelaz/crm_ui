'use client';

import { useClientePlan } from '@/app/lib/useClientePlan';
import { Boxes, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Gate de plan para Inventario. Todos los comercios de gastronomía tienen el
 * módulo (crm_api 025), pero sólo BASIC en adelante tienen `canUseInventario`:
 * en FREE se muestra qué ganan en vez de una pantalla que devuelve 403.
 */
export default function InventarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { plan, loading } = useClientePlan();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
      </div>
    );
  }

  // Sin plan cargado (error de red) se deja pasar: la API igual gatea.
  if (plan && plan.features?.canUseInventario !== true) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
          <Lock className="h-7 w-7 text-brand-600" />
        </div>
        <h1 className="mb-2 font-display text-xl font-semibold text-brand-800">
          Inventario no está en tu plan
        </h1>
        <p className="mb-2 max-w-md text-sm text-brand-300">
          Con Inventario sabés qué tenés, qué te falta y cuánto te costó, desde
          el celular.
        </p>
        <ul className="mb-6 max-w-md space-y-1 text-left text-sm text-brand-600">
          <li>
            • Cargás una compra y queda registrada como gasto, sin cargarla dos
            veces.
          </li>
          <li>
            • Te avisa cuando un insumo baja del mínimo: es tu lista de compras.
          </li>
          <li>• Contás lo que hay y el stock se corrige solo.</li>
        </ul>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/upgrade-plan')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Boxes size={18} /> Mejorar plan
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="min-h-[44px] rounded-md border border-brand-200 px-4 py-2 text-sm text-brand-700 hover:bg-brand-50"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
