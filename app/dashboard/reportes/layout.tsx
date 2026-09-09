'use client';

import { useClientePlan } from '@/app/lib/useClientePlan';
import { BarChart3, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Gate de plan para TODA la sección de reportes (bug 33).
 *
 * El backend ya rechaza los endpoints de reportes con 403 cuando el plan no
 * tiene `canUseReports`, pero el front igual dejaba entrar a las pantallas
 * (menú + rutas) mostrando gráficos vacíos/mock. Este layout corta el acceso
 * en un solo lugar: si el plan cargó y NO tiene reportes, muestra un upsell
 * en vez de las pantallas hijas.
 */
export default function ReportesLayout({ children }: { children: React.ReactNode }) {
  const { plan, loading } = useClientePlan();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
      </div>
    );
  }

  const habilitado = plan?.features?.canUseReports !== false;

  if (!habilitado) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
          <Lock className="h-7 w-7 text-brand-600" />
        </div>
        <h1 className="mb-2 font-display text-xl font-semibold text-brand-800">
          Reportes no disponibles en tu plan
        </h1>
        <p className="mb-6 max-w-md text-sm text-brand-300">
          Tu plan actual ({plan?.tierNombre || plan?.tierCode || 'FREE'}) no incluye el módulo de
          reportes. Mejorá tu plan para acceder a estadísticas de ventas, gastos y clientes.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/upgrade-plan')}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <BarChart3 size={18} /> Mejorar plan
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-md border border-brand-200 px-4 py-2 text-sm text-brand-700 hover:bg-brand-50"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
