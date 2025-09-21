// app/layout.tsx
'use client';
import Header from '@/app/ui/Header';
import Sidebar from '@/app/ui/Sidebar'; // lo creamos ahora
import { lusitana } from '@/app/ui/fonts';
import '@/app/ui/global.css';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  
interface DecodedToken {
  username: string;
  role: string;
}

  useEffect(() => {
    decodeTokenAndSetState();
    window.addEventListener('storage', decodeTokenAndSetState);
    return () => window.removeEventListener('storage', decodeTokenAndSetState);
  }, []);


  const decodeTokenAndSetState = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        setIsLoggedIn(true);
      } catch {

        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  };


  return (
    <html lang="es">
      <body className={`${lusitana.className} antialiased bg-gray-100`}>
        <div className="flex h-screen">
          {/* Sidebar */}
          {isLoggedIn && (
          <Sidebar />
          )}
          {/* Contenedor principal */}
          <div className="flex flex-col flex-1">
            <Header />
            <main className="p-6 overflow-y-auto">{children}</main>
          </div>
        </div>
        <ToastContainer />
      </body>
    </html>
  );
}
