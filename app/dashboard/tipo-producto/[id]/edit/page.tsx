import { redirect } from 'next/navigation';

/** [3.3] Ruta unificada en /dashboard/productos/tipo-producto. Server component: redirige sin pintar nada. */
export default function Page({ params }: { params: { id: string } }) {
  redirect(`/dashboard/productos/tipo-producto/${params.id}/edit`);
}
