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
};

const ROLE_ROUTES = {
  1: '/dashboard/operaciones/admin',
  2: '/dashboard/operaciones/empleado',
};

const getRedirectionRoute = (roles: { id: number; id_rol: number; id_user: number }[]): string => {
  const roleIds = roles.map(role => role.id_rol);
  const sortedRoles = roleIds.sort((a, b) => ROLE_PRIORITY[a] - ROLE_PRIORITY[b]);
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
      router.push('/dashboard/operaciones/admin');
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
        window.dispatchEvent(new Event('storage'));
        const redirectionRoute = getRedirectionRoute(decodedToken.role);
        router.push(redirectionRoute);
      }
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        {/* Branding */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          🍕 CRM
        </h1>
        <p className="text-center text-gray-500 mb-6">Accedé a tu cuenta</p>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ingresá tu usuario"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ingresá tu contraseña"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © {new Date().getFullYear()} @crm
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
