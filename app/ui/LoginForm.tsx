'use client';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useEffect, useState } from 'react';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface DecodedToken {
  userId: string;
  roles: number[]; // Cambiado a un array de roles
}

// Definir prioridad y rutas para cada rol
const ROLE_PRIORITY = {
  admin: 1,
  empleado: 2,
  // Agrega otros roles y prioridades aquí según sea necesario
};

const ROLE_ROUTES = {
  1: '/dashboard/operaciones/admin',
  2: '/dashboard/operaciones/empleado',
  // Agrega otras rutas de redirección aquí
};

const getRedirectionRoute = (roles: { id: number; id_rol: number; id_user: number }[]): string => {
  // Extrae los valores de id_rol para trabajar solo con los roles
  const roleIds = roles.map(role => role.id_rol);
  // Ordena los roles por prioridad utilizando ROLE_PRIORITY
  const sortedRoles = roleIds.sort((a, b) => ROLE_PRIORITY[a] - ROLE_PRIORITY[b]);
  // Retorna la ruta correspondiente o un valor predeterminado
  return ROLE_ROUTES[sortedRoles[0]] || '/dashboard/operaciones/empleado';
};


const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard/operaciones/admin'); // Redirige automáticamente si hay un token almacenado
    }
  }, [router]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/auth/login`, { email, password });
      const token = response.data.token;
      
      if (token) {
        const decodedToken: DecodedToken = jwtDecode(token);
        localStorage.setItem('token', token);
        window.dispatchEvent(new Event('storage')); // Notifica cambios
        // Obtener ruta de redirección según el rol prioritario
        const redirectionRoute = getRedirectionRoute(decodedToken.role);
        router.push(redirectionRoute);
      }
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div>
      <form className="login-form" onSubmit={handleLogin}>
        <label>
          Usuario:
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Contraseña:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Iniciar Sesión</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LoginForm;
