'use client';

import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Pantalla de acceso denegado (tarea 2.2).
 *
 * Reemplaza el redirect mudo: antes el usuario que entraba a una ruta sin
 * permiso aparecía en otro módulo sin ningún mensaje, y parecía que la app
 * se había roto.
 */
export default function SinAcceso({ fallback }: { fallback: string | null }) {
  const router = useRouter();

  const salir = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100">
        <ShieldAlert className="h-7 w-7 text-brand-600" />
      </div>

      <h1 className="mb-2 font-display text-xl font-semibold text-brand-800">
        No tenés acceso a esta sección
      </h1>

      <p className="mb-6 max-w-md text-sm text-brand-300">
        {fallback
          ? 'Tu usuario no tiene habilitado este módulo. Si creés que es un error, pedile a un administrador que revise tus permisos.'
          : 'Tu usuario todavía no tiene ningún módulo asignado. Un administrador tiene que habilitarte al menos uno para que puedas empezar a trabajar.'}
      </p>

      <div className="flex gap-3">
        {fallback && (
          <button
            onClick={() => router.push(fallback)}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-700"
          >
            Ir a mi inicio
          </button>
        )}
        <button
          onClick={salir}
          className="rounded-lg border border-brand-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
