'use client';

import {
  generarCuotas,
  type ResultadoGeneracion,
} from '@/app/lib/edu/cuotas.api';
import { errorDeApi, mesActual, nombreMes } from '@/app/lib/edu/reglas';
import Dialog from '@/components/ui/Dialog';
import { useState } from 'react';
import { AvisoError, BotonPrimario, BotonSecundario } from './ui';

/** Genera las cuotas de un mes (idempotente: las ya generadas no se tocan). */
export default function GenerarCuotasDialog({
  periodo,
  onClose,
  onGenerado,
}: {
  periodo: string;
  onClose: () => void;
  onGenerado: () => void;
}) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<ResultadoGeneracion | null>(null);
  const futuro = periodo.slice(0, 7) > mesActual();

  const generar = async () => {
    try {
      setError(null);
      setCargando(true);
      setRes(await generarCuotas(periodo));
      onGenerado();
    } catch (err) {
      setError(errorDeApi(err, 'No se pudieron generar las cuotas').mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog titulo="Generar cuotas" onClose={onClose} bloquear={cargando}>
      <div className="space-y-4 text-sm text-brand-700">
        {!res ? (
          <>
            <p>
              Se generan las cuotas de <strong>{nombreMes(periodo)}</strong>{' '}
              para las inscripciones activas. Las que ya existen no se
              modifican.
            </p>
            {futuro && (
              <p className="text-amber-700">
                Es un mes futuro: las altas posteriores no se incluyen todavía.
              </p>
            )}
            {error && <AvisoError mensaje={error} />}
            <div className="flex justify-end gap-2">
              <BotonSecundario
                type="button"
                onClick={onClose}
                disabled={cargando}
              >
                Cancelar
              </BotonSecundario>
              <BotonPrimario
                type="button"
                onClick={generar}
                cargando={cargando}
              >
                Generar
              </BotonPrimario>
            </div>
          </>
        ) : (
          <>
            <ul data-testid="gen-resultado" className="space-y-1">
              <li>
                Creadas: <strong>{res.creadas}</strong>
              </li>
              <li>
                Ya existían: <strong>{res.existentes}</strong>
              </li>
            </ul>
            {res.sin_precio.length > 0 && (
              <div
                role="alert"
                className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-amber-800"
              >
                <p className="font-medium">Sin precio cargado para el mes:</p>
                <ul className="list-disc pl-5 text-xs">
                  {[...new Set(res.sin_precio.map((s) => s.clase))].map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <p className="mt-1 text-xs">
                  Cargá el precio y volvé a generar.
                </p>
              </div>
            )}
            <div className="flex justify-end">
              <BotonPrimario type="button" onClick={onClose}>
                Listo
              </BotonPrimario>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
