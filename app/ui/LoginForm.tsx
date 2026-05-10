'use client';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useEffect, useState } from 'react';
import { notifyAuthChanged } from '@/app/lib/authEvents';


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
        notifyAuthChanged();
        const redirectionRoute = getRedirectionRoute(decodedToken.role);
        router.push(redirectionRoute);
      }
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-800">
      <div className="bg-white shadow-brand rounded-xl p-8 w-full max-w-md">
        {/* Branding */}
        <div className="flex justify-center mb-6">
          <Image
            src="/assets/Logos/COUNTER CRM/COUNTER CRM Logo horizontal violeta.png"
            alt="Counter CRM"
            width={180}
            height={48}
            className="object-contain"
            priority
          />
        </div>
        <p className="text-center text-brand-300 mb-6">Accedé a tu cuenta</p>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-brand-800 font-medium mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-600 focus:outline-none"
              placeholder="Ingresá tu usuario"
              required
            />
          </div>

          <div>
            <label className="block text-brand-800 font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-600 focus:outline-none"
              placeholder="Ingresá tu contraseña"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-brand-600 text-white font-semibold py-2 rounded-lg shadow-brand hover:bg-brand-700 transition"
          >
            Iniciar Sesión
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-brand-300 mt-6">
          © {new Date().getFullYear()} Counter CRM
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
