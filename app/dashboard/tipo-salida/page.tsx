import { redirect } from 'next/navigation';

/** [3.3] Ruta unificada en /dashboard/gasto. Server component: redirige sin pintar nada. */
export default function Page() {
  redirect('/dashboard/gasto');
}
