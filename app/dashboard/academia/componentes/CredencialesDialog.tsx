'use client';

import Dialog from '@/components/ui/Dialog';
import type { Acceso } from '@/app/lib/edu/edu.api';
import { Check, Copy, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

/**
 * Muestra UNA vez la contraseña temporal recién generada. La API no la guarda
 * en claro: si se cierra sin anotarla, hay que resetearla.
 */
export default function CredencialesDialog({
  acceso,
  nombre,
  onClose,
}: {
  acceso: Acceso;
  nombre: string;
  onClose: () => void;
}) {
  const [copiado, setCopiado] = useState(false);
  const texto = `Usuario: ${acceso.email}\nContraseña temporal: ${acceso.passwordTemporal}`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <Dialog titulo={`Acceso de ${nombre}`} onClose={onClose}>
      <div className="mb-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <ShieldAlert size={18} className="mt-0.5 shrink-0" />
        <p>
          Anotá o copiá la contraseña ahora: no se vuelve a mostrar. En el
          primer ingreso el sistema le pide cambiarla.
        </p>
      </div>
      <dl className="space-y-3 rounded-lg bg-brand-50 p-4 text-sm">
        <div>
          <dt className="text-brand-400">Usuario</dt>
          <dd className="font-medium text-brand-800" data-testid="acceso-email">
            {acceso.email}
          </dd>
        </div>
        <div>
          <dt className="text-brand-400">Contraseña temporal</dt>
          <dd
            className="font-mono text-lg tracking-wider text-brand-800"
            data-testid="acceso-password"
          >
            {acceso.passwordTemporal}
          </dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={copiar}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-brand-200 bg-white px-5 text-sm font-medium text-brand-600 hover:bg-brand-50"
        >
          {copiado ? <Check size={16} /> : <Copy size={16} />}{' '}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white shadow-brand hover:bg-brand-700"
        >
          Listo, ya la anoté
        </button>
      </div>
    </Dialog>
  );
}
