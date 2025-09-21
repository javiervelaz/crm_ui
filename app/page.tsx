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
        
        if (decodedToken.role === 'admin') {
          router.push('/dashboard/operaciones/admin');
        } else if (decodedToken.role === 'empleado') {
          router.push('/dashboard/operaciones/empleado');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
  }, [router]);

  // 🔹 Loader con shimmer skeleton
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
        <div className="w-full max-w-md space-y-4">
          {/* Bloque título */}
          <div className="h-8 w-2/3 bg-gray-300 rounded-md relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </div>
          {/* Bloque inputs */}
          <div className="h-12 w-full bg-gray-300 rounded-md relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </div>
          <div className="h-12 w-full bg-gray-300 rounded-md relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </div>
          {/* Bloque botón */}
          <div className="h-10 w-1/2 bg-gray-300 rounded-md relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100">
      <div className="flex flex-col gap-4 items-center">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-white shadow-lg px-6 py-10 md:px-20">
          <div className="mt-4 flex flex-col gap-4 items-center">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
