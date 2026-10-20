'use client';

import { X } from 'lucide-react';
import { ReactNode, useEffect, useId } from 'react';

/**
 * Diálogo modal accesible: role="dialog", título asociado, cierra con Esc y
 * con el fondo (salvo `bloquear`, ej. mientras guarda).
 */
export default function Dialog({
  titulo,
  onClose,
  children,
  ancho = 'max-w-lg',
  bloquear = false,
}: {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
  ancho?: string;
  bloquear?: boolean;
}) {
  const idTitulo = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !bloquear) onClose();
    };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, bloquear]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-900/40 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !bloquear) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className={`max-h-[92vh] w-full ${ancho} overflow-y-auto rounded-t-2xl bg-white p-5 shadow-brand sm:rounded-2xl sm:p-6`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2
            id={idTitulo}
            className="font-display text-lg font-semibold text-brand-800"
          >
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={bloquear}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-brand-400 hover:bg-brand-50 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
