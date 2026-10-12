'use client';

import GastosSinCaja from '@/app/dashboard/flujo/componentes/GastosSinCaja';
import { getGastosConfig } from '@/app/lib/gastosSinCaja.api';
import { logError } from '@/app/lib/logger';
import Wizard from '@/app/ui/dashboard/operaciones/admin/components/gastos/GastoWizard';
import DashboardSkeleton from '@/components/ui/DashboardSkeleton';
import { useEffect, useState } from 'react';

/**
 * /dashboard/flujo
 *
 * Con caja (tenants con módulo 'operaciones', gastronomía): el wizard de
 * siempre, atado a la caja abierta del día.
 * Sin caja (ej. academias): carga y listado mensual de gastos.
 *
 * Si la consulta falla se muestra el wizard: es el comportamiento previo y la
 * API igual valida la regla de caja al guardar.
 *
 * [2.2] Sin useAuthCheck: el guard vive en dashboard/layout.tsx.
 */
const Page = () => {
  const [requiereCaja, setRequiereCaja] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelado = false;
    getGastosConfig()
      .then(({ requiereCaja }) => !cancelado && setRequiereCaja(requiereCaja))
      .catch((error) => {
        logError('No se pudo consultar la config de gastos', error);
        if (!cancelado) setRequiereCaja(true);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  if (requiereCaja === null) return <DashboardSkeleton />;
  return requiereCaja ? <Wizard /> : <GastosSinCaja />;
};

export default Page;
