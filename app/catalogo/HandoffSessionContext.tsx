'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { validateHandoffToken, HandoffSessionPayload } from './handoffApi';
import { readStoredHandoffToken, storeHandoffToken } from './catalogConfig';
import { notifyError } from '@/app/lib/notificationService';

interface HandoffSession extends HandoffSessionPayload {
  expiresAt: number | null; // ms epoch
}

interface HandoffSessionContextValue {
  session: HandoffSession | null;
  loading: boolean;
  /** Código del último rechazo (PLAN_INACTIVE, TOKEN_EXPIRED, ...) */
  errorCode: string | null;
  errorMessage: string | null;
  logout: () => void;
}

const HandoffSessionContext = createContext<HandoffSessionContextValue | null>(
  null,
);

export function useHandoffSession() {
  const ctx = useContext(HandoffSessionContext);
  if (!ctx) {
    throw new Error(
      'useHandoffSession must be used within HandoffSessionProvider',
    );
  }
  return ctx;
}

export function HandoffSessionProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [session, setSession] = useState<HandoffSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const logout = useCallback(() => {
    storeHandoffToken(null);
    setSession(null);
    setErrorCode('TOKEN_EXPIRED');
    setErrorMessage(
      'El link expiró. Escribile de nuevo al comercio por WhatsApp para recibir uno nuevo.',
    );
    notifyError(
      'La sesión del link de WhatsApp expiró. Pedí un nuevo link para seguir haciendo pedidos.',
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function init() {
      const tokenFromUrl = searchParams.get('c');
      // Sin ?c (navegación interna o refresh): usar el de la pestaña
      const token = tokenFromUrl || readStoredHandoffToken();

      if (!token) {
        if (!session) {
          setErrorCode('NO_TOKEN');
          setErrorMessage(null);
        }
        setLoading(false);
        return;
      }
      // Ya validado: no volver a pegarle a la API en cada navegación
      if (session && session.token === token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await validateHandoffToken(token);
      if (cancelled) return;

      if (!result.ok) {
        storeHandoffToken(null);
        setSession(null);
        setErrorCode(result.code);
        setErrorMessage(result.message);
        setLoading(false);
        return;
      }

      const v = result.session;
      const now = Date.now();
      const expiresAt =
        v.expiresIn != null && v.expiresIn > 0
          ? now + v.expiresIn * 1000
          : v.exp != null
            ? v.exp * 1000
            : null;

      storeHandoffToken(token);
      setSession({ ...v, expiresAt });
      setErrorCode(null);
      setErrorMessage(null);
      setLoading(false);

      if (expiresAt) {
        const ms = expiresAt - now;
        if (ms > 0) timer = setTimeout(logout, ms);
        else logout();
      }
    }

    init();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const value = useMemo(
    () => ({ session, loading, errorCode, errorMessage, logout }),
    [session, loading, errorCode, errorMessage, logout],
  );

  return (
    <HandoffSessionContext.Provider value={value}>
      {children}
    </HandoffSessionContext.Provider>
  );
}
