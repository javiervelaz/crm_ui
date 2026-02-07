// app/layout.tsx
'use client';
import Header from '@/app/ui/Header';
import Sidebar from '@/app/ui/Sidebar';
import { inter, lusitana } from '@/app/ui/fonts';
import '@/app/ui/global.css';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  interface DecodedToken {
    username: string;
    role: string;
  }

  const decodeTokenAndSetState = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        jwtDecode<DecodedToken>(token);
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    decodeTokenAndSetState();
    window.addEventListener('storage', decodeTokenAndSetState);
    return () => window.removeEventListener('storage', decodeTokenAndSetState);
  }, []);

  const pathname = usePathname();
  const isCatalogRoute = pathname.startsWith('/catalogo');
  const isSaasRoute = pathname?.startsWith('/saas');
  const isPublicRoute = isCatalogRoute || isSaasRoute || pathname === '/auth';

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

  return (
    <html lang="es">
      <body className={`${inter.variable} ${lusitana.variable}`}>
        {isPublicRoute ? (
          <div className="min-h-screen bg-slate-50">{children}</div>
        ) : (
          <div className="flex h-screen w-full overflow-hidden">
            {isLoggedIn && <Sidebar className="hidden md:flex" />}

            {isLoggedIn && isMobileSidebarOpen && (
              <div className="fixed inset-0 z-40 md:hidden">
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute left-0 top-0 h-full">
                  <Sidebar onRequestClose={() => setIsMobileSidebarOpen(false)} />
                </div>
              </div>
            )}

            <div className="flex min-w-0 flex-col flex-1">
              <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
              <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 bg-gray-100">
                {children}
              </main>
            </div>
          </div>
        )}
        <ToastContainer />
      </body>
    </html>
  );
}
