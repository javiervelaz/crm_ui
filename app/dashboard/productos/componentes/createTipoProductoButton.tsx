'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

/** [2.5] FontAwesome → lucide. Lleva al listado de tipos de producto. */
export const CreateTipoProductoButton = () => {
  const router = useRouter();

  const handleCreateUsers = () => {
    router.push('/dashboard/productos/tipo-producto');
  };

  return (
    <button
      onClick={handleCreateUsers}
      className="flex items-center rounded-md bg-brand-600 px-4 py-2 text-white"
    >
      <Plus size={16} className="mr-2" /> Categoria
    </button>
  );
};
