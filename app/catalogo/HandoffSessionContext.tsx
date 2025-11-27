'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { validateHandoffToken, HandoffSessionPayload } from './handoffApi';
import { notifyError } from '@/app/lib/notificationService';

interface HandoffSession extends HandoffSessionPayload {
  expiresAt: number | null; // ms epoch
}

interface HandoffSessionContextValue {
  session: HandoffSession | null;
  loading: boolean;
  logout: () => void;
}

const HandoffSessionContext =
  createContext<HandoffSessionContextValue | null>(null);

export function useHandoffSession() {
  const ctx = useContext(HandoffSessionContext);
  if (!ctx) {
    throw new Error(
      'useHandoffSession must be used within HandoffSessionProvider',
    );
  }
  return ctx;
}

export function HandoffSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const [session, setSession] = useState<HandoffSession | null>(null);
  const [loading, setLoading] = useState(true);

  // guard para logout
  const logout = () => {
    setSession(null);
    notifyError(
      'La sesión del link de WhatsApp expiró. Pedí un nuevo link para seguir haciendo pedidos.',
    );
  };

  useEffect(() => {
  let cancelled = false;
  let timer: NodeJS.Timeout | null = null;

  async function init() {
    setLoading(true);
    const tokenFromUrl = searchParams.get('c');

    // 🔹 1) Sin token en la URL: NO tocar la sesión existente
    if (!tokenFromUrl) {
      setLoading(false);
      return;
    }

    // 🔹 2) Con token: validar contra el backend
    const validated = await validateHandoffToken(tokenFromUrl);
    if (cancelled) return;

    if (!validated) {
      setSession(null);
      setLoading(false);
      notifyError(
        'El link que usaste ya no es válido. Pedí uno nuevo por WhatsApp.',
      );
      return;
    }

    const now = Date.now();
    let expiresAt: number | null = null;

    if (validated.expiresIn != null && validated.expiresIn > 0) {
      expiresAt = now + validated.expiresIn * 1000;
    } else if (validated.exp != null) {
      expiresAt = validated.exp * 1000;
    }

    const newSession: HandoffSession = {
      ...validated,
      expiresAt,
    };

    setSession(newSession);
    setLoading(false);

    if (expiresAt) {
      const ms = expiresAt - now;
      if (ms > 0) {
        timer = setTimeout(() => {
          logout();
        }, ms);
      } else {
        logout();
      }
    }
  }

  init();

  return () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
  };
}, [searchParams]);


  const value = useMemo(
    () => ({
      session,
      loading,
      logout,
    }),
    [session, loading],
  );

  return (
    <HandoffSessionContext.Provider value={value}>
      {children}
    </HandoffSessionContext.Provider>
  );
}
