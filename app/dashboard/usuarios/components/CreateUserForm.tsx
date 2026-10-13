'use client'

import { getClienteId } from '@/app/lib/authService';
import useAuthCheck from '@/app/lib/useAuthCheck';
import { createUser } from '@/app/lib/usuario.api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { estaVacio } from '@/app/lib/formValidacion';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';


const CreateUserPage = () => {
  const clienteId = getClienteId();
  useAuthCheck();
  const [userDetails, setUserDetails] = useState<any>({
    nombre:'',
    apellido: '',
    email: '',
    cliente_id: clienteId
  });
  const router = useRouter();
  // Bloquea el botón mientras guarda: varios clicks creaban varios usuarios.
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e: any) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (guardando) return;
    if (!validarCampos()) {
      notifyError('Debe rellenar los campos obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      const created = await createUser(userDetails);
      // Bug 7 (USR-02): un usuario recién creado no tiene contraseña ni rol, así
      // que no puede ingresar ni tiene módulos. Lo mandamos directo a Editar para
      // completar contraseña y asignar el rol (que le da los módulos).
      // CP-05: no se elige tipo de usuario; la API lo deriva de los roles.
      if (created?.id) {
        notifySuccess('Usuario creado. Completá la contraseña y asigná un rol para que pueda ingresar.');
        router.push(`/dashboard/profile/${created.id}/edit`);
      } else {
        notifySuccess('Usuario creado.');
        router.push('/dashboard/usuarios');
      }
    } catch (error) {
      notifyError('No se pudo crear el usuario.');
      setGuardando(false);
    }
    // En éxito no se libera: la pantalla navega.
  };

  const handleCancel = () => {
    setUserDetails({
      nombre: '',
      apellido: '',
      email: '',
    });
    router.push("/dashboard/usuarios");
  };

  const [errors, setErrors] = useState<{
    nombre: string;
    apellido: string;
    email: string;
  }>({
    nombre: '',
    apellido: '',
    email: '',
  });

   // Función para validar todos los campos
  const validarCampos = () => {
    const newErrors = {
      nombre: '',
      apellido: '',
      email: '',
    };

    let isValid = true;

     // 1. Validar Teléfono (siempre obligatorio)
    if (estaVacio(userDetails.nombre)) {
      newErrors.nombre = 'El nombre es obligatorio';
      isValid = false;
    }
    if (estaVacio(userDetails.apellido)) {
      newErrors.apellido = 'El apellido es obligatorio';
      isValid = false;
    }
     if (estaVacio(userDetails.email)) {
      newErrors.email = 'El email es obligatorio';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.email.trim())) {
      newErrors.email = 'El email no es válido';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }


  return (
    <div className="w-full p-4 md:p-6">
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
            onBlur={() => {
              if (estaVacio(userDetails.nombre)) {
                setErrors({ ...errors, nombre: 'El nombre es obligatorio' });
              }
            }}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
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
            onBlur={() => {
              if (estaVacio(userDetails.apellido)) {
                setErrors({ ...errors, apellido: 'El apellido es obligatorio' });
              }
            }}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
           {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
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
            onBlur={() => {
              if (estaVacio(userDetails.email)) {
                setErrors({ ...errors, email: 'El email es obligatorio' });
              }
            }}
          />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={guardando}
            className="bg-gray-500 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            aria-busy={guardando}
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {guardando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage;
