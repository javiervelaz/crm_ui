// app/ui/Header.tsx
'use client';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useClientePlan } from '@/app/lib/useClientePlan';

interface DecodedToken {
  username: string;
  role: string;
}

const Header: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter();
  const { plan, loading } = useClientePlan();

  useEffect(() => {
    decodeTokenAndSetState();
    window.addEventListener('storage', decodeTokenAndSetState);
    return () => window.removeEventListener('storage', decodeTokenAndSetState);
  }, []);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(
      today.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("storage"));
    router.push('/');
  };

  const decodeTokenAndSetState = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        setUserName(decodedToken.username);
        setIsLoggedIn(true);
      } catch {
        setUserName(null);
        setIsLoggedIn(false);
      }
    } else {
      setUserName(null);
      setIsLoggedIn(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex justify-between items-center shadow-sm">
      <div className="text-gray-600">{currentDate}</div>
      {isLoggedIn && (
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-800 whitespace-nowrap">
            {userName}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
      <div className="text-xs text-gray-600">
        {loading && 'Cargando plan...'}
        {plan && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Plan: {plan.tierNombre}
          </span>
        )}
      </div>
    </header>
  );
};

export default Header;
