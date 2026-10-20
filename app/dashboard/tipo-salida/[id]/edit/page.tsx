import { redirect } from 'next/navigation';

/** [3.3] Ruta unificada en /dashboard/gasto. Server component: redirige sin pintar nada. */
export default function Page({ params }: { params: { id: string } }) {
  redirect(`/dashboard/gasto/${params.id}/edit`);
}
