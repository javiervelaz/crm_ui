'use client';

import RolPermisosForm from '@/app/ui/roles/RolPermisosForm';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const rolId = Number(params.id);

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Editar permisos del rol</h1>
        <RolPermisosForm rolId={rolId} />
      </div>
    </main>
  );
}
