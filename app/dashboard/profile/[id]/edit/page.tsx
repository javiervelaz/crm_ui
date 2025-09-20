'use client';

import { createProfile, getProfileUserById, updateProfile } from '@/app/lib/profile.api';
import { getRolList } from '@/app/lib/rol.api';
import { createUserRol, deleteUserRol, getUserRolUserById, updateUserRol } from '@/app/lib/userRol.api';
import { getUserById, getUserRol, getUserTypeById, updateUser } from '@/app/lib/usuario.api'; // Importar getUserTypeById
import { useParams, useRouter } from 'next/navigation'; // Para manejar navegación
import { useEffect, useState } from 'react';

const EditUserPage = () => {
  const router = useRouter();
  const { id } = useParams(); // Obtener el parámetro 'id' de la URL

  const [userDetails, setUserDetails] = useState(null);
  const [userTypeDescription, setUserTypeDescription] = useState('');
  const [profileDetails, setProfileDetails] = useState({});
  const [rolDetails, setRolDetails] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (id) {
      const fetchUsers = async () => {
        try {
          const data = await getUserById(id); // Llamada a tu servicio que obtiene la lista de usuarios
          setUserDetails(data);

          // Obtener la descripción del tipo de usuario
          if (data.user_type_id) {
            const userTypeData = await getUserTypeById(data.user_type_id.toString());
            setUserTypeDescription(userTypeData?.descripcion || {}); // Asignar la descripción obtenida al estado
          }

          // Obtener los detalles del perfil del usuario
          if (data.id) {
            const profile = await getProfileUserById(data.id);
            setProfileDetails(profile);
          }
          // Inicializar los roles seleccionados con los roles del usuario
          const userRols = await getUserRol(data.id);
          if (userRols) {
            // Mapeamos los roles obtenidos de la base de datos y los inicializamos en el estado
            const rolesFormatted = userRols.map((rol) => ({
              descripcion: rol.descripcion,
              id: rol.id_rol, // Asegúrate de usar `id` para mantener la consistencia con el handler de checkbox
              id_user: rol.id_user,
            }));

            setSelectedRoles(rolesFormatted);
          }
        } catch (err) {
          console.error(err);
        }
      };

      const fetchRols = async () => {
        try {
          const data = await getRolList();
          setRolDetails(data);
        } catch (err) {
          console.error(err);
        }
      };

      fetchRols(); // Llamar a la función fetchRols
      fetchUsers(); // Llamar a la función fetchUsers
    }
  }, [id]);

  // Manejar cambios en los detalles del usuario
  const handleUserDetailChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Manejar cambios en los detalles del perfil
  const handleProfileDetailChange = (e) => {
    const { name, value } = e.target;
    setProfileDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Manejar cambios en los roles seleccionados con casillas de verificación
const handleRoleCheckboxChange = (e, rol) => {
  if (e.target.checked) {
    // Añadir rol seleccionado
    setSelectedRoles((prevRoles) => [...prevRoles, { id: rol.id, descripcion: rol.descripcion }]);
  } else {
    // Remover rol deseleccionado
    setSelectedRoles((prevRoles) => prevRoles.filter((selectedRol) => selectedRol.id !== rol.id));
  }
};


  // Manejar cambios en los roles seleccionados
  const handleRoleChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => ({
      descripcion: option.text,
      id: option.id, 
    }));
    setSelectedRoles(selectedOptions);
  };

  const handleSubmit = async () => {
    if (selectedRoles.length === 0) {
      setErrorMessage('Debe seleccionar al menos un rol antes de guardar.');
      return;
    }
  
    const payload = {
      ...userDetails,
      roles: selectedRoles,
      profile: profileDetails,
    };
  
    try {
      const user = await getUserById(payload.id);
      if (user) {
        await updateUser(user.id, {
          nombre: payload.nombre,
          apellido: payload.apellido,
          email: payload.email,
          user_type_id: payload.user_type_id,
        });
      }
  
      const profile = await getProfileUserById(payload.id);
      if (profile.length === 0) {
        await createProfile({
          id_user: payload.id,
          dni: payload.profile.dni,
          telefono: payload.profile.telefono,
          password: payload.profile.password,
          legajo: payload.profile.legajo,
          fecha_ingreso: payload.profile.fecha_ingreso,
        });
      } else {
        await updateProfile(profile.id, payload.profile);
      }
  
      const existingUserRoles = await getUserRolUserById(payload.id);
  
      // Crear un Set de IDs de roles existentes
      const existingRoleIds = new Set(existingUserRoles.map((rol) => rol.id_rol));
  
      // Iterar sobre roles seleccionados
      for (const role of payload.roles) {
        const idRoleAsInteger = parseInt(role.id, 10);
        const existingRole = existingUserRoles.find((rol) => rol.id_rol === idRoleAsInteger);
  
        if (existingRole) {
          // Si el rol existe, actualiza con los valores actuales
          await updateUserRol(existingRole.id, { id_rol: idRoleAsInteger, id_user: payload.id });
          existingRoleIds.delete(idRoleAsInteger); // Eliminar de la lista de roles existentes
        } else {
          // Si no existe, crea uno nuevo
          await createUserRol({ id_rol: idRoleAsInteger, id_user: payload.id });
        }
      }
  
      // Eliminar los roles no seleccionados
      for (const remainingRoleId of existingRoleIds) {
        const roleToDelete = existingUserRoles.find((rol) => rol.id_rol === remainingRoleId);
        if (roleToDelete) {
          await deleteUserRol(roleToDelete.id);
        }
      }
  
      // Redirigir al usuario después de guardar
      router.push('/dashboard/usuarios');
    } catch (e) {
      setErrorMessage('Error: ' + e.message);
    }
  };
  

  if (!userDetails) {
    return <div>Cargando...</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Editar Usuario</h1>

      {/* Contenedor principal */}
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        {/* Sección de Datos del Usuario */}
        <section className="space-y-4">
          <h2 className="text-xl font-medium text-gray-700 border-b pb-2">Datos del Usuario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={userDetails.nombre || ''}
                onChange={handleUserDetailChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={userDetails.apellido || ''}
                onChange={handleUserDetailChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={userDetails.email || ''}
                onChange={handleUserDetailChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de usuario</label>
              <input
                type="text"
                name="user_type"
                value={userTypeDescription || ''}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                readOnly
              />
            </div>
          </div>
        </section>

        {/* Sección de Datos de Perfil */}
        <section className="space-y-4">
          <h2 className="text-xl font-medium text-gray-700 border-b pb-2">Datos de Perfil</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={profileDetails.password || ''}
                onChange={handleProfileDetailChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">DNI</label>
              <input
                type="text"
                name="dni"
                value={profileDetails.dni || ''}
                onChange={handleProfileDetailChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={profileDetails.telefono || ''}
                onChange={handleProfileDetailChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Legajo</label>
              <input
                type="text"
                name="legajo"
                value={profileDetails.legajo || ''}
                onChange={handleProfileDetailChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Fecha de Ingreso</label>
              <input
                type="date"
                name="fecha_ingreso"
                value={formatDate(profileDetails.fecha_ingreso) || ''}
                onChange={handleProfileDetailChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Sección de Roles */}
        <section className="space-y-4">
          <h2 className="text-xl font-medium text-gray-700 border-b pb-2">Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Selecciona roles</label>
              <div className="mt-2 space-y-2">
                {rolDetails.map((rol) => (
                  <div key={rol.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`role-${rol.id}`}
                      value={rol.descripcion}
                      checked={selectedRoles.some((selectedRol) => selectedRol.id === rol.id)}
                      onChange={(e) => handleRoleCheckboxChange(e, rol)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`role-${rol.id}`} className="ml-2 text-sm text-gray-700">
                      {rol.descripcion}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* Botón de envío */}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <div className="flex justify-end">
          <button
              type="button"
              onClick={() => router.push('/dashboard/usuarios')}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserPage;
