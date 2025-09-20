'use client'

import useAuthCheck from '@/app/lib/useAuthCheck';
import { createUser } from '@/app/lib/usuario.api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


const CreateUserPage = () => {
  useAuthCheck();
  const [userDetails, setUserDetails] = useState({
    nombre:'',
    apellido: '',
    email: '',
    user_type_id: 0
  });
  const router = useRouter();

  const handleChange = (e) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createUser(userDetails);
      
      router.push('/dashboard/usuarios');
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancel = () => {
    setUserDetails({
      nombre: '',
      apellido: '',
      email: '',
      user_type_id: 0,
    });
    router.push("/dashboard/usuarios");
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl mb-6">Crear nuevo usuario</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            name="nombre"
            value={userDetails.nombre}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Apellido
          </label>
          <input
            type="text"
            name="apellido"
            value={userDetails.apellido}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="text"
            name="email"
            value={userDetails.email}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Usuario
          </label>
          <select
            name="user_type_id"
            value={userDetails.user_type_id} // Asume que tienes `user_type_id` en `userDetails`
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="0" disabled>
              Seleccione un tipo de usuario
            </option>
            <option value="1">Admin</option>
            <option value="2">Empleado</option>
            <option value="3">Proveedor</option>
            <option value="4">Cliente</option>
            {/* Añade más opciones según los tipos de usuario que tengas */}
          </select>
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage;
