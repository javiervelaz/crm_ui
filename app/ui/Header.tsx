'use client';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface DecodedToken {
  username: string;
  role: string;
}

const Header: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Decodificar token al montar el componente
    decodeTokenAndSetState();
    const handleStorageChange = () => decodeTokenAndSetState();

  
    window.addEventListener('storage', handleStorageChange);
  
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Obtener la fecha actual en formato legible
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setCurrentDate(formattedDate);
  }, []);

  const handleLogout = () => {
    // Eliminar el token y redirigir al login
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false); // Cambiar el estado de sesión
    router.push('/');
  };

  const decodeTokenAndSetState = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        setUserName(decodedToken.username);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error decoding token:', error);
        setUserName(null);
        setIsLoggedIn(false);
      }
    } else {
      setUserName(null);
      setIsLoggedIn(false);
    }
  };
  

  return (
    <header className="flex justify-between items-center bg-gray-800 text-white p-4 shadow-lg">
      <div>
      <div className="flex justify-between items-center bg-gray-800 text-white p-4 shadow-lg text-4xl font-extrabold">
        Pizzería Pati
      </div>
      </div>
      {/* Lado izquierdo: Nombre de usuario y fecha */}
      {isLoggedIn && (
      <div>
        <div>
          <p className="text-lg font-semibold">{userName || 'Usuario Desconocido'}</p>
          <p className="text-sm">{currentDate}</p>
        </div>
        
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Cerrar Sesión
          </button>
        
      </div>
      )}
    </header>
  );
};

export default Header;
