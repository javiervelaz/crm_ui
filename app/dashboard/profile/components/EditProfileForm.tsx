'use client'

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const EditUserPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    if (id) {
      // Lógica para cargar los datos del usuario basado en el ID
      fetch(`/api/users/${id}`)
        .then((response) => response.json())
        .then((data) => setUserDetails(data));
    }
  }, [id]);

  if (!userDetails) {
    return <div>Cargando...</div>;
  }
  console.log(userDetails)
  return (
    <div>
      <h1>Editar Usuario</h1>
      <form>
        {/* Campos del formulario para editar el usuario */}
        <label>
          Nombre:
          <input type="text" value={userDetails.id} readOnly />
        </label>
        {/* Otros campos de edición */}
      </form>
    </div>
  );
};

export default EditUserPage;
