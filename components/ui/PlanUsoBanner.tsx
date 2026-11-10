'use client';

import { AYUDA_LIMITE, esLimitKey, LimitKey, RECURSO, UsoLimite, usePlanUso } from '@/app/lib/planUso';
import { AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const claveCierre = (k: LimitKey, nivel: number) => `plan-uso-cerrado:${k}:${nivel}`;

const leerCerrado = (k: LimitKey, nivel: number): boolean => {
  try { return sessionStorage.getItem(claveCierre(k, nivel)) === '1'; } catch { return false; }
};

/**
 * Aviso de uso del plan: aparece cuando un límite numérico (pedidos del mes,
 * productos, ítems de stock) llega al 80 % y cambia a rojo en el tope. Sólo
 * muestra el más urgente. Se puede cerrar por sesión; cerrar el del 80 % no
 * esconde el del 100 %.
 *
 * Para planes sin límites (Premium, Anual) el backend devuelve `uso` vacío y
 * no se renderiza nada.
 */
export default function PlanUsoBanner() {
  const plan = usePlanUso();
  const [cerrados, setCerrados] = useState<Record<string, boolean>>({});

  // sessionStorage no existe en el render del servidor: se lee ya montado.
  useEffect(() => {
    if (!plan) return;
    const leidos: Record<string, boolean> = {};
    for (const [k, u] of Object.entries(plan.uso)) {
      if (esLimitKey(k) && u?.nivel) leidos[claveCierre(k, u.nivel)] = leerCerrado(k, u.nivel);
    }
    setCerrados(leidos);
  }, [plan]);

  const candidatos = Object.entries(plan?.uso ?? {})
    .filter((par): par is [LimitKey, UsoLimite] => esLimitKey(par[0]) && !!par[1]?.nivel)
    .filter(([k, u]) => !cerrados[claveCierre(k, u.nivel as number)])
    .sort((a, b) => b[1].porcentaje - a[1].porcentaje);

  if (!plan || !candidatos.length) return null;

  const [limitKey, uso] = candidatos[0];
  const enElTope = uso.nivel === 100;
  const recurso = RECURSO[limitKey];

  const cerrar = () => {
    try { sessionStorage.setItem(claveCierre(limitKey, uso.nivel as number), '1'); } catch { /* modo privado */ }
    setCerrados((c) => ({ ...c, [claveCierre(limitKey, uso.nivel as number)]: true }));
  };

  const tono = enElTope
    ? { caja: 'border-red-200 bg-red-50', icono: 'text-red-600', titulo: 'text-red-900', texto: 'text-red-800', boton: 'bg-red-600 hover:bg-red-700', cerrar: 'text-red-700 hover:bg-red-100' }
    : { caja: 'border-amber-200 bg-amber-50', icono: 'text-amber-600', titulo: 'text-amber-900', texto: 'text-amber-800', boton: 'bg-amber-600 hover:bg-amber-700', cerrar: 'text-amber-700 hover:bg-amber-100' };

  return (
    <div
      role="status"
      className={`mb-4 flex flex-col gap-3 rounded-2xl border p-4 shadow-card sm:flex-row sm:items-center ${tono.caja}`}
    >
      <AlertTriangle className={`h-6 w-6 shrink-0 ${tono.icono}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className={`font-semibold ${tono.titulo}`}>
          {enElTope
            ? `Llegaste al límite de ${recurso}: ${uso.usado} de ${uso.limite}`
            : `Usaste ${uso.usado} de ${uso.limite} ${recurso}`}
        </p>
        <p className={`text-sm ${tono.texto}`}>
          {enElTope
            ? `No vas a poder cargar más. ${AYUDA_LIMITE[limitKey]}`
            : `Cuando llegues al tope no vas a poder cargar más. ${AYUDA_LIMITE[limitKey]}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/plan"
          className={`inline-flex min-h-[44px] items-center rounded-lg px-4 text-sm font-semibold text-white transition-colors ${tono.boton}`}
        >
          Ver planes
        </Link>
        <button
          type="button"
          onClick={cerrar}
          aria-label="Cerrar aviso"
          className={`flex h-11 w-11 items-center justify-center rounded-md transition-colors ${tono.cerrar}`}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
