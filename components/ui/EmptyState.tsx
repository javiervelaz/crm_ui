import { Inbox } from 'lucide-react';

interface Props {
  titulo: string;
  mensaje?: string;
  /** Ícono lucide. Default: Inbox. */
  icono?: React.ComponentType<{ size?: number | string; className?: string }>;
  accion?: { label: string; onClick: () => void };
}

/**
 * Estado vacío. Un listado sin datos no es un error: se dice qué falta y cuál
 * es el próximo paso, en vez de mostrar una tabla con el cuerpo en blanco.
 */
export default function EmptyState({ titulo, mensaje, icono: Icono = Inbox, accion }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-brand-100 bg-white px-6 py-14 text-center shadow-card">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
        <Icono size={22} className="text-brand-300" />
      </div>

      <h3 className="font-display text-base font-semibold text-brand-800">{titulo}</h3>
      {mensaje && <p className="mt-1 max-w-sm text-sm text-brand-300">{mensaje}</p>}

      {accion && (
        <button
          type="button"
          onClick={accion.onClick}
          className="mt-5 min-h-[44px] rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-700"
        >
          {accion.label}
        </button>
      )}
    </div>
  );
}
