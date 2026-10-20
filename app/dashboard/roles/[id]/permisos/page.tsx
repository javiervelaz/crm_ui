'use client';

import RolPermisosForm from '@/app/ui/roles/RolPermisosForm';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const rolId = Number(params.id);

  return (
    <main className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/dashboard/roles')}
          className="flex items-center gap-1 text-brand-600 hover:text-brand-800 mb-4"
        >
          <ArrowLeft size={18} /> Volver a roles
        </button>
        <h1 className="text-2xl font-semibold mb-4">Editar permisos del rol</h1>
        <RolPermisosForm rolId={rolId} />
      </div>
    </main>
  );
}
