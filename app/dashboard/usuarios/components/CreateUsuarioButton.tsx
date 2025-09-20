'use client'

import { useRouter } from 'next/navigation';

export const CreateUsuarioButton = () => {
  const router = useRouter();

  const handleCreateUsers = () => {
    router.push('/dashboard/usuarios/create');
  };

  return (
    <button
      onClick={handleCreateUsers}
      className="bg-blue-500 text-white px-4 py-2 rounded-md"
    >
      Nuevo usuario
    </button>
  );
};
