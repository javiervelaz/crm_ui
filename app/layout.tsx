// app/layout.tsx
'use client';
import Header from '@/app/ui/Header';
import Sidebar from '@/app/ui/Sidebar';
import { montserrat, outfit } from '@/app/ui/fonts';
import '@/app/ui/global.css';
import PlanLimiteProvider from '@/components/ui/PlanLimiteProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState<boolean>(false);

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
      <body className={`${montserrat.variable} ${outfit.variable}`}>
        <TooltipProvider delayDuration={300}>
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
                    <Sidebar
                      onRequestClose={() => setIsMobileSidebarOpen(false)}
                    />
                  </div>
                </div>
              )}

              <div className="flex min-w-0 flex-1 flex-col">
                <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
                <main className="min-w-0 flex-1 overflow-y-auto bg-brand-50 p-4 md:p-6">
                  {children}
                </main>
              </div>
            </div>
          )}
          <ToastContainer />
          {/*
          [4.2] Escucha el evento PLAN_LIMITE que emite apiClient en los 403 de
          plan y abre el modal. Sin este montaje el evento se dispara al vacío:
          no aparece nada y no hay redirect.
          Va FUERA del if de isPublicRoute — un 403 de plan puede llegar desde
          cualquier ruta.
        */}
          <PlanLimiteProvider />
        </TooltipProvider>
      </body>
    </html>
  );
}
