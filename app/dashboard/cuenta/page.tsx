'use client';

import { RUTA_CAMBIO_PASSWORD } from '@/app/lib/modules';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** /dashboard/cuenta → por ahora sólo tiene el cambio de contraseña. */
export default function CuentaPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(RUTA_CAMBIO_PASSWORD);
  }, [router]);
  return null;
}
