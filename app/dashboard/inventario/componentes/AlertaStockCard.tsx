'use client';

import { getDecodedToken } from '@/app/lib/authService';
import { formatCantidad } from '@/app/lib/inventario';
import { getAlertas, StockItem } from '@/app/lib/inventario.api';
import { useClientePlan } from '@/app/lib/useClientePlan';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const MAX_LISTA = 3;

/**
 * Card "N ítems para comprar" para el panel del dueño. No se muestra si el
 * usuario no tiene el módulo, si el plan no incluye inventario o si no hay
 * nada bajo el mínimo: un aviso que siempre está deja de leerse.
 */
export default function AlertaStockCard() {
  const { plan } = useClientePlan();
  const [alertas, setAlertas] = useState<StockItem[] | null>(null);

  const tieneModulo = (getDecodedToken()?.modules ?? []).includes('inventario');
  const habilitado = tieneModulo && plan?.features?.canUseInventario === true;

  useEffect(() => {
    if (!habilitado) return;
    getAlertas()
      .then(setAlertas)
      .catch(() => setAlertas(null));
  }, [habilitado]);

  if (!habilitado || !alertas?.length) return null;

  return (
    <Link
      href="/dashboard/inventario"
      className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-card hover:bg-amber-100"
    >
      <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-amber-900">
          {alertas.length === 1
            ? '1 ítem para comprar'
            : `${alertas.length} ítems para comprar`}
        </p>
        <p className="truncate text-sm text-amber-800">
          {alertas
            .slice(0, MAX_LISTA)
            .map((a) => `${a.nombre} (${formatCantidad(a.stock, a.unidad)})`)
            .join(' · ')}
          {alertas.length > MAX_LISTA
            ? ` y ${alertas.length - MAX_LISTA} más`
            : ''}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-amber-700" />
    </Link>
  );
}
