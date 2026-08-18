// app/ui/Header.tsx
'use client';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useClientePlan } from '@/app/lib/useClientePlan';
import AdminSettingsMenu from '@/app/ui/AdminSettingsMenu';

interface DecodedToken {
  userId: string | number;
  username: string;
  role: string[];
}

type HeaderProps = {
  onMenuClick?: () => void;
};

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | number | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
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

  const decodeTokenAndSetState = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        setUserName(decodedToken.username);
        setUserId(decodedToken.userId);
        setIsAdmin(Array.isArray(decodedToken.role) && decodedToken.role.includes('admin'));
        setIsLoggedIn(true);
      } catch {
        setUserName(null);
        setUserId(null);
        setIsAdmin(false);
        setIsLoggedIn(false);
      }
    } else {
      setUserName(null);
      setUserId(null);
      setIsAdmin(false);
      setIsLoggedIn(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-brand-200 px-4 md:px-6 flex justify-between items-center shadow-card">
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button
          type="button"
          onClick={onMenuClick}
          className="
            md:hidden
            inline-flex h-10 w-10 items-center justify-center
            rounded-md
            bg-brand-100 text-brand-800
            border border-brand-200
            hover:bg-brand-200
            active:bg-brand-300
          "
          aria-label="Abrir menú"
        >
          ☰
        </button>

        )}
        <div className="text-gray-600 hidden sm:block truncate">{currentDate}</div>
      </div>

      {isLoggedIn && (
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <span className="font-semibold text-brand-800 whitespace-nowrap hidden sm:inline">
            {userName}
          </span>
          {isAdmin && userId != null && <AdminSettingsMenu userId={userId} />}
          {isAdmin && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-1 text-sm whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="hidden md:inline">Plan:</span>
              <span className="font-medium">{loading ? '...' : (plan?.tierNombre ?? '-')}</span>
            </span>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
