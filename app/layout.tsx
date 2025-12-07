// app/layout.tsx
'use client';
import Header from '@/app/ui/Header';
import Sidebar from '@/app/ui/Sidebar'; // lo creamos ahora
import { lusitana } from '@/app/ui/fonts';
import '@/app/ui/global.css';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePathname } from 'next/navigation';



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

  const pathname = usePathname();
  const isCatalogRoute = pathname.startsWith('/catalogo');
  const isSaasRoute = pathname?.startsWith('/saas');

   const isPublicRoute = isCatalogRoute || isSaasRoute || pathname === '/auth';


   return (
    <html lang="es">
      <body className={lusitana.className}>
        {isPublicRoute ? (
          // Layout público (sin Sidebar/Header del CRM)
          <div className="min-h-screen bg-slate-50">{children}</div>
        ) : (
          // Layout actual del CRM (Sidebar + Header)
          <div className="flex h-screen">
            {isLoggedIn && <Sidebar />}
            <div className="flex flex-col flex-1">
              <Header />
              <main className="p-6 overflow-y-auto">{children}</main>
            </div>
          </div>
        )}
        <ToastContainer />
      </body>
    </html>
  );
}
