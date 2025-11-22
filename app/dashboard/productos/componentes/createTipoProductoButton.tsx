'use client'

import { useRouter } from 'next/navigation';

export const CreateTipoProductoButton = () => {
  const router = useRouter();

  const handleCreateUsers = () => {
    router.push('/dashboard/productos/tipo-producto');
  };

  return (
    <button
      onClick={handleCreateUsers}
      className="bg-green-500 text-white px-4 py-2 rounded-md"
    >
      Tipo Producto
    </button>
  );
};
