// components/ui/VerificacionPendiente.tsx
'use client';

import { useState } from 'react';
import { reenviarVerificacion } from '@/app/lib/saas.api';

type Props = {
  /** Si viene vacío, el panel pide la dirección en un input. */
  email: string;
  titulo?: string;
  descripcion?: string;
  /** Muestra el aviso de que la cuenta no abre hasta activarla. */
  conAvisoBloqueo?: boolean;
};

/**
 * Panel "revisá tu correo". Lo usan el alta (/saas), el login cuando el
 * backend devuelve 403 EMAIL_NO_VERIFICADO, y la vuelta del pago.
 *
 * No redirige por timeout a ningún lado: mandar al login a alguien que todavía
 * no puede loguear es una trampa.
 */
export default function VerificacionPendiente({
  email,
  titulo = 'Revisá tu correo',
  descripcion,
  conAvisoBloqueo = false,
}: Props) {
  const [enviando, setEnviando] = useState(false);
  const [reenviado, setReenviado] = useState(false);
  const [emailTipeado, setEmailTipeado] = useState('');

  const pideEmail = !email;
  const destino = email || emailTipeado;
  const destinoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destino.trim());

  const handleReenviar = async () => {
    if (!destinoValido) return;
    setEnviando(true);
    try {
      await reenviarVerificacion(destino);
    } catch {
      // El backend responde 200 siempre; si acá falla es la red. Mostramos el
      // mismo mensaje igual: no hay nada útil que el usuario pueda hacer con
      // la diferencia, y distinguir filtraría qué casillas existen.
    } finally {
      setEnviando(false);
      setReenviado(true);
    }
  };

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-8 shadow-sm">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
        <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-brand-900">{titulo}</h2>

      <p className="mt-3 text-brand-300">
        {descripcion ?? 'Te mandamos un enlace para activar tu cuenta a'}
        {pideEmail ? ':' : <> <strong className="text-brand-900">{email}</strong>.</>}
      </p>

      {pideEmail && (
        <label className="mt-5 block">
          <span className="sr-only">Tu email</span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={emailTipeado}
            onChange={(e) => { setEmailTipeado(e.target.value); setReenviado(false); }}
            className="w-full rounded-xl border border-brand-100 px-4 py-3 text-brand-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </label>
      )}

      {conAvisoBloqueo && (
        <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-600">
          Hasta que hagas clic en ese enlace no vas a poder iniciar sesión.
        </p>
      )}

      <p className="mt-4 text-sm text-brand-300">
        Si no aparece en unos minutos, mirá en <strong>spam</strong> o{' '}
        <strong>promociones</strong>. El enlace vence en 7 días.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleReenviar}
          disabled={enviando || !destinoValido}
          className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? 'Enviando...' : 'Reenviar enlace'}
        </button>

        {reenviado && (
          <span className="text-sm text-brand-600" role="status">
            Listo. Si esa dirección tiene una cuenta pendiente, el enlace ya está en camino.
          </span>
        )}
      </div>

      <p className="mt-6 border-t border-brand-100 pt-5 text-sm text-brand-300">
        ¿Seguís sin recibirlo? Escribinos a{' '}
        <a href="mailto:info@countercrm.com" className="font-semibold text-brand-600 underline">
          info@countercrm.com
        </a>
      </p>
    </div>
  );
}
