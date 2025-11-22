'use client';

import { getClienteId } from "@/app/lib/authService";
import { notifySuccess,notifyError } from '@/app/lib/notificationService';
import { createProfile, getProfileUserById, updateProfile } from '@/app/lib/profile.api';
import { getRolList } from '@/app/lib/rol.api';
import { createUserRol, deleteUserRol, getUserRolUserById } from '@/app/lib/userRol.api';
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
    const cliente =  getClienteId();
    if (id) {
      const fetchUsers = async () => {
        try {
          const data = await getUserById(id,cliente); // Llamada a tu servicio que obtiene la lista de usuarios
          setUserDetails(data);

          // Obtener la descripción del tipo de usuario
          if (data.user_type_id) {
            const userTypeData = await getUserTypeById(data.user_type_id.toString());
            setUserTypeDescription(userTypeData?.descripcion || {}); // Asignar la descripción obtenida al estado
          }

          // Obtener los detalles del perfil del usuario
          if (data.id) {
            const profile = await getProfileUserById(data.id,cliente);
            console.log(profile)
            setProfileDetails(profile);
          }
          // Inicializar los roles seleccionados con los roles del usuario
          const userRols = await getUserRol(data.id,cliente);
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
          const data = await getRolList(getClienteId());
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
  //console.log(rol);
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
    if (!validarCampos()) {
      setErrorMessage('Debe seleccionar rellenar los campos obligatorios.');
      return;
    }
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
      // 🔹 Verificar si el usuario existe
      const user = await getUserById(payload.id, payload.cliente_id);
      if (user) {
        await updateUser(user.id, {
          nombre: payload.nombre,
          apellido: payload.apellido,
          email: payload.email,
          user_type_id: payload.user_type_id,
        });
      }
  
      // 🔹 Crear o actualizar perfil
      const profile = await getProfileUserById(payload.id, payload.cliente_id);
      console.log(payload)
      if (!profile || profile.length === 0) {
        await createProfile({
          id_user: payload.id,
          dni: payload.profile.dni,
          telefono: payload.profile.telefono,
          password: payload.profile.password,
          legajo: payload.profile.legajo,
          fecha_ingreso: payload.profile.fecha_ingreso,
          cliente_id: payload.cliente_id,
        });
      } else {
        await updateProfile(profile.id, payload.profile);
      }
  
      // ======================================================
      // 🔹 SINCRONIZACIÓN DE ROLES (versión robusta)
      // ======================================================
  
      const existingUserRoles = await getUserRolUserById(payload.id, payload.cliente_id);
      console.log("Roles actuales:", existingUserRoles);
  
      // Normalizar los valores a números
      const existingRoleIds = new Set(existingUserRoles.map(r => Number(r.id_rol)));
      const selectedRoleIds = new Set(payload.roles.map(r => Number(r.id)));
  
      // Calcular diferencias
      const rolesToAdd = [...selectedRoleIds].filter(id => !existingRoleIds.has(id));
      const rolesToDelete = [...existingRoleIds].filter(id => !selectedRoleIds.has(id));
  
      console.log("Roles a agregar:", rolesToAdd);
      console.log("Roles a eliminar:", rolesToDelete);
  
      // 🔸 Crear roles nuevos
      for (const id_rol of rolesToAdd) {
        await createUserRol({
          id_rol,
          id_user: payload.id,
          cliente_id: payload.cliente_id,
        });
      }
  
      // 🔸 Eliminar roles removidos
      for (const id_rol of rolesToDelete) {
        const roleToDelete = existingUserRoles.find(r => Number(r.id_rol) === id_rol);
        if (roleToDelete) {
          await deleteUserRol(roleToDelete.id,getClienteId());
        }
      }
  
      // ======================================================
  
      notifySuccess('Usuario actualizado correctamente.');
      router.push('/dashboard/usuarios');
  
    } catch (e) {
      console.error('Error en handleSubmit:', e);
      setErrorMessage('Error: ' + e.message);
    }
  };


  const [errors, setErrors] = useState<{
    nombre: string;
    apellido: string;
    email: string;
    password:string;
    dni:string;
    telefono:string;
    legajo : number;
    fecha_ingreso:string;
  }>({
    nombre: '',
    apellido: '',
    email: '',
    password:'',
    dni:'',
    telefono:'',
    legajo : 0,
    fecha_ingreso:'',
  });

   // Función para validar todos los campos
  const validarCampos = () => {
    const newErrors = {
      nombre: '',
      apellido: '',
      email: '',
      password:'',
      dni:'',
      telefono:'',
      legajo : 0,
      fecha_ingreso:'',
    };

    let isValid = true;

     // 1. Validar Teléfono (siempre obligatorio)
    if (!userDetails.nombre || userDetails.nombre.trim() === '') {
      newErrors.nombre = 'El nombre es obligatorio';
      isValid = false;
    }
    if (!userDetails.apellido || userDetails.apellido.trim() === '') {
      newErrors.apellido = 'El apellido es obligatorio';
      isValid = false;
    }
    if (!userDetails.email || userDetails.email.trim() === '') {
      newErrors.email = 'El email es obligatorio';
      isValid = false;
    }
    if (!profileDetails.password || profileDetails.password.trim() === '') {
      newErrors.password = 'El password es obligatorio';
      isValid = false;
    }
    if (!profileDetails.dni || profileDetails.dni.trim() === '') {
      newErrors.dni = 'El dni es obligatorio';
      isValid = false;
    }
    if (!profileDetails.telefono || profileDetails.telefono.trim() === '') {
      newErrors.telefono = 'El telefono es obligatorio';
      isValid = false;
    }
    if (!profileDetails.legajo || profileDetails.legajo.trim() === '') {
      newErrors.legajo = 'El legajo es obligatorio';
      isValid = false;
    }
    if (!profileDetails.fecha_ingreso || profileDetails.fecha_ingreso.trim() === '') {
      newErrors.fecha_ingreso = 'El fecha_ingreso es obligatorio';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }
  

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
                onBlur={() => {
                  if ( (!userDetails.nombre || userDetails.nombre.trim() === '')) {
                    setErrors({ ...errors, nombre: 'El nombre es obligatorio' });
                  }
                }}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
               {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={userDetails.apellido || ''}
                onChange={handleUserDetailChange}
                onBlur={() => {
                  if ( (!userDetails.apellido || userDetails.apellido.trim() === '')) {
                    setErrors({ ...errors, apellido: 'El apellido es obligatorio' });
                  }
                }}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
              {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
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
                onBlur={() => {
                  if ( (!userDetails.email || userDetails.email.trim() === '')) {
                    setErrors({ ...errors, email: 'El email es obligatorio' });
                  }
                }}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
                onBlur={() => {
                  if ( (!profileDetails.password || profileDetails.password.trim() === '')) {
                    setErrors({ ...errors, password: 'El password es obligatorio' });
                  }
                }}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
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
                onBlur={() => {
                  if ( (!profileDetails.dni || profileDetails.dni.trim() === '')) {
                    setErrors({ ...errors, dni: 'El dni es obligatorio' });
                  }
                }}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
              {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={profileDetails.telefono || ''}
                onBlur={() => {
                  if ( (!profileDetails.telefono || profileDetails.telefono.trim() === '')) {
                    setErrors({ ...errors, telefono: 'El telefono es obligatorio' });
                  }
                }}
                onChange={handleProfileDetailChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
               {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Legajo</label>
              <input
                type="text"
                name="legajo"
                value={profileDetails.legajo || ''}
                onBlur={() => {
                  if ( (!profileDetails.legajo || profileDetails.legajo.trim() === '')) {
                    setErrors({ ...errors, legajo: 'El legajo es obligatorio' });
                  }
                }}
                onChange={handleProfileDetailChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
               {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.legajo}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Fecha de Ingreso</label>
              <input
                type="date"
                name="fecha_ingreso"
                value={formatDate(profileDetails.fecha_ingreso) || ''}
                onBlur={() => {
                  if ( (!profileDetails.fecha_ingreso || profileDetails.fecha_ingreso.trim() === '')) {
                    setErrors({ ...errors, fecha_ingreso: 'El fecha deingreso es obligatorio' });
                  }
                }}
                onChange={handleProfileDetailChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
              {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.fecha_ingreso}</p>}
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
