// app/auth/verificar/page.tsx
'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { verificarEmail, VerificarError } from '@/app/lib/saas.api';
import VerificacionPendiente from '@/components/ui/VerificacionPendiente';

type Estado = 'verificando' | 'ok' | 'expirado' | 'invalido' | 'error';

const FORMATO_TOKEN = /^[a-f0-9]{64}$/;

function Verificar() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';

  const [estado, setEstado] = useState<Estado>('verificando');
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [conSesion, setConSesion] = useState(false);

  // React 18 en StrictMode monta dos veces en dev. Sin este guard el token se
  // consume en el primer intento y el segundo muestra "el enlace ya fue usado".
  const yaCorrio = useRef(false);

  useEffect(() => {
    if (yaCorrio.current) return;
    yaCorrio.current = true;

    // Validamos el formato acá para no gastar un round-trip ni un golpe del
    // rate limit con un token que evidentemente no es uno.
    if (!FORMATO_TOKEN.test(token)) {
      setEstado('invalido');
      return;
    }

    verificarEmail(token)
      .then((res) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          setConSesion(true);
        }
        setEstado('ok');
      })
      .catch((err: unknown) => {
        if (err instanceof VerificarError) {
          setMensaje(err.message);
          setEstado(err.code === 'TOKEN_EXPIRED' ? 'expirado'
            : err.code === 'INVALID_TOKEN' ? 'invalido' : 'error');
          return;
        }
        setMensaje('No pudimos conectarnos con el servidor.');
        setEstado('error');
      });
  }, [token]);

  // Activada y con sesión: lo llevamos adentro. Un click, y está trabajando.
  useEffect(() => {
    if (estado !== 'ok' || !conSesion) return;
    const t = setTimeout(() => router.push('/dashboard'), 1800);
    return () => clearTimeout(t);
  }, [estado, conSesion, router]);

  return (
    <main className="flex min-h-screen flex-col bg-brand-50">
      <header className="bg-brand-800 px-6 py-4">
        <div className="mx-auto max-w-5xl">
          <Image
            src="/assets/Logos/COUNTER CRM/COUNTER CRM Logo horizontal claro.png"
            alt="Counter CRM"
            width={160}
            height={40}
            className="object-contain"
            priority
          />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-12">
        {estado === 'verificando' && (
          <div className="rounded-2xl border border-brand-100 bg-white p-8 text-center shadow-sm">
            <div
              className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600"
              role="status"
              aria-label="Verificando"
            />
            <p className="mt-5 text-brand-300">Activando tu cuenta...</p>
          </div>
        )}

        {estado === 'ok' && (
          <div className="rounded-2xl border border-brand-100 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-brand-900">Cuenta activada</h1>
            <p className="mt-3 text-brand-300">
              {conSesion
                ? 'Listo. Te llevamos a tu panel...'
                : 'Ya podés iniciar sesión con tu email y contraseña.'}
            </p>
            <Link
              href={conSesion ? '/dashboard' : '/'}
              className="mt-7 inline-block rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              {conSesion ? 'Ir a mi panel' : 'Iniciar sesión'}
            </Link>
          </div>
        )}

        {estado === 'expirado' && (
          <VerificacionPendiente
            email=""
            titulo="El enlace ya no sirve"
            descripcion="Venció o ya lo usaste. Poné tu email y te mandamos uno nuevo"
          />
        )}

        {(estado === 'invalido' || estado === 'error') && (
          <div className="rounded-2xl border border-brand-100 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-brand-900">
              {estado === 'invalido' ? 'Enlace inválido' : 'Algo salió mal'}
            </h1>
            <p className="mt-3 text-brand-300">
              {mensaje ??
                (estado === 'invalido'
                  ? 'Ese enlace no tiene el formato correcto. Revisá que lo hayas copiado entero desde el mail.'
                  : 'No pudimos completar la activación. Probá de nuevo en unos minutos.')}
            </p>
            <p className="mt-6 border-t border-brand-100 pt-5 text-sm text-brand-300">
              Escribinos a{' '}
              <a href="mailto:info@countercrm.com" className="font-semibold text-brand-600 underline">
                info@countercrm.com
              </a>{' '}
              y lo resolvemos.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function VerificarPage() {
  return (
    <Suspense fallback={null}>
      <Verificar />
    </Suspense>
  );
}
