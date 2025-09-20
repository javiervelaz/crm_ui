import { jwtDecode } from 'jwt-decode'; // Asegúrate de que jwtDecode esté correctamente importado
import { useEffect, useState } from 'react';

const useRoleCheck = () => {
  const [roles, setRoles] = useState<number[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const userRoles = decodedToken.role.map((role: { id_rol: number }) => role.id_rol);
        setRoles(userRoles);
      } catch (error) {
        console.error('Error decoding token:', error);
        setRoles([]);
      }
    } else {
      console.warn('No token found in localStorage.');
      setRoles([]);
    }
  }, []);

  return roles;
};

export default useRoleCheck;
