'use client'
import useAuthCheck from '@/app/lib/useAuthCheck';
import LoginForm from '@/app/ui/LoginForm';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface DecodedToken {
  userId: string;
  role: string;
}

export default function Page() {
  const { loading } = useAuthCheck();
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        
        // Redirigir inmediatamente basado en el rol
        if (decodedToken.role === 'admin') {
          router.push('/dashboard/operaciones/admin');
        } else if (decodedToken.role === 'empleado') {
          router.push('/dashboard/operaciones/empleado'); // Corregí la ruta
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
  }, [router]); // ✅ Solo router como dependencia

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-center">
          <p>Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="flex flex-col gap-4 items-center">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:px-20">
          <p className="text-xl text-gray-800 md:text-3xl md:leading-normal">
            <strong>Pizzeria PATI</strong> 
          </p>
          <h2 className="text-lg text-gray-600">Sistema de administración</h2>
          
          <div className="mt-4 flex flex-col gap-4 items-center">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}