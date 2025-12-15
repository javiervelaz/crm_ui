'use client';

import { useRouter } from 'next/navigation';

export const CreateProductoButton = ({ disabled = false }: { disabled?: boolean }) => {
  const router = useRouter();

  const handleCreateUsers = () => {
    if (!disabled) {
      router.push('/dashboard/productos/create');
    }
  };

  return (
    <button
      onClick={handleCreateUsers}
      disabled={disabled}
      className={`px-4 py-2 rounded-md text-white ${
        disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
      }`}
    >
      + Producto
    </button>
  );
};
