'use client';

import DashboardSkeleton from '@/components/ui/DashboardSkeleton';
import SinAcceso from '@/components/ui/SinAcceso';
import { useAuthCheck } from '@/app/lib/useAuthCheck';

/**
 * Guard único del dashboard (tarea 2.2).
 *
 * Antes este layout era un passthrough vacío y cada page.tsx llamaba a
 * useAuthCheck() por su cuenta — 34 call sites, cada uno con su propio
 * skeleton de divs grises. Resultado: doble parpadeo en cada navegación.
 *
 * Ahora la verificación pasa acá una sola vez. Las páginas hijas asumen
 * sesión válida y ya no dibujan estados de carga de sesión.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status, fallback } = useAuthCheck();

  if (status === 'checking' || status === 'anonymous') return <DashboardSkeleton />;
  if (status === 'denied') return <SinAcceso fallback={fallback} />;

  return <>{children}</>;
}
