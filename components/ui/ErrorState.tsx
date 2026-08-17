'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';

interface Props {
  titulo?: string;
  mensaje?: string;
  onRetry?: () => void;
}

/**
 * Error recuperable. Reemplaza el patrón actual de dejar la pantalla vacía
 * cuando un fetch falla: el usuario no sabía si estaba cargando, si no había
 * datos, o si algo se rompió.
 */
export default function ErrorState({
  titulo = 'No pudimos cargar los datos',
  mensaje = 'Puede ser un problema de conexión. Probá de nuevo en unos segundos.',
  onRetry,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-white px-6 py-14 text-center shadow-card">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle size={22} className="text-red-500" />
      </div>

      <h3 className="font-display text-base font-semibold text-brand-800">{titulo}</h3>
      <p className="mt-1 max-w-sm text-sm text-brand-300">{mensaje}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-brand-200 bg-white px-5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
        >
          <RotateCw size={16} />
          Reintentar
        </button>
      )}
    </div>
  );
}
