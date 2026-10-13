'use client';

import { notifyAuthChanged } from '@/app/lib/authEvents';
import { cambiarPassword } from '@/app/lib/edu/edu.api';
import { errorDeApi } from '@/app/lib/edu/reglas';
import { landingForToken, SessionToken } from '@/app/lib/modules';
import { notifySuccess } from '@/app/lib/notificationService';
import { passwordValida, REGLAS_PASSWORD } from '@/app/lib/passwordPolicy';
import { jwtDecode } from 'jwt-decode';
import { Check, KeyRound, Loader2, LogOut, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

/**
 * Cambio de contraseña. Con contraseña temporal (cuentas que entrega el admin
 * a profesores, tutores y alumnos) es la única pantalla habilitada: la API
 * rechaza todo lo demás hasta cambiarla (crm_api cuentaGuards).
 */
export default function CambiarPasswordPage() {
  const router = useRouter();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [obligatorio, setObligatorio] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token)
        setObligatorio(
          jwtDecode<SessionToken>(token).debeCambiarPassword === true,
        );
    } catch {
      /* el guard del layout se encarga del token inválido */
    }
  }, []);

  const coinciden = nueva.length > 0 && nueva === repetir;
  const puedeEnviar =
    actual.length > 0 &&
    passwordValida(nueva) &&
    coinciden &&
    nueva !== actual &&
    !guardando;

  const salir = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!puedeEnviar) return;
    setError('');
    setGuardando(true);
    try {
      const { token } = await cambiarPassword(actual, nueva);
      localStorage.setItem('token', token);
      window.dispatchEvent(new Event('storage'));
      notifyAuthChanged();
      notifySuccess('Contraseña actualizada');
      router.push(landingForToken(jwtDecode<SessionToken>(token)));
    } catch (err) {
      const e2 = errorDeApi(err, 'No se pudo cambiar la contraseña');
      setError(
        e2.code === 'PASSWORD_INCORRECTA'
          ? 'La contraseña actual no es correcta.'
          : e2.mensaje,
      );
      setGuardando(false);
    }
  };

  const campo =
    'h-11 w-full rounded-lg border border-brand-200 px-3 text-sm outline-none transition-colors focus:border-brand-600';

  return (
    <div className="mx-auto w-full max-w-md p-4 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <KeyRound size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl text-brand-800">
            Cambiar contraseña
          </h1>
          {obligatorio && (
            <p className="text-sm text-brand-400">
              Tu cuenta tiene una contraseña temporal. Elegí una nueva para
              empezar.
            </p>
          )}
        </div>
      </div>

      <form
        onSubmit={enviar}
        className="space-y-4 rounded-xl border border-brand-100 bg-white p-5 shadow-card"
        noValidate
      >
        <div>
          <label htmlFor="actual" className="mb-1 block text-sm text-brand-700">
            {obligatorio ? 'Contraseña temporal' : 'Contraseña actual'}
          </label>
          <input
            id="actual"
            type="password"
            autoComplete="current-password"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            className={campo}
          />
        </div>
        <div>
          <label htmlFor="nueva" className="mb-1 block text-sm text-brand-700">
            Nueva contraseña
          </label>
          <input
            id="nueva"
            type="password"
            autoComplete="new-password"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            className={campo}
            aria-describedby="reglas-password"
          />
          <ul
            id="reglas-password"
            className="mt-2 grid grid-cols-2 gap-1 text-xs"
          >
            {REGLAS_PASSWORD.map((r) => {
              const ok = r.ok(nueva);
              return (
                <li
                  key={r.id}
                  className={`flex items-center gap-1 ${ok ? 'text-emerald-600' : 'text-brand-300'}`}
                >
                  {ok ? <Check size={12} /> : <X size={12} />} {r.texto}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <label
            htmlFor="repetir"
            className="mb-1 block text-sm text-brand-700"
          >
            Repetí la nueva contraseña
          </label>
          <input
            id="repetir"
            type="password"
            autoComplete="new-password"
            value={repetir}
            onChange={(e) => setRepetir(e.target.value)}
            className={campo}
          />
          {repetir.length > 0 && !coinciden && (
            <p className="mt-1 text-xs text-red-500">No coinciden</p>
          )}
          {nueva.length > 0 && nueva === actual && (
            <p className="mt-1 text-xs text-red-500">
              Tiene que ser distinta de la actual
            </p>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!puedeEnviar}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {guardando && <Loader2 size={16} className="animate-spin" />}
          {guardando ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>

      {obligatorio && (
        <button
          type="button"
          onClick={salir}
          className="mx-auto mt-6 flex items-center gap-2 text-sm text-brand-400 hover:text-brand-600"
        >
          <LogOut size={14} /> Salir
        </button>
      )}
    </div>
  );
}
