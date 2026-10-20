'use client';

import TipoSalidaPage from './componentes/tipoSalidaPage';

/**
 * /dashboard/gasto — Categorías de gasto.
 *
 * [3.3] Antes importaba de '@/app/dashboard/tipo-salida/componentes/tipoSalidaPage',
 * es decir del OTRO árbol. Por eso toda la carpeta gasto/componentes/ era código
 * muerto — incluida la TipoSalidaTable ya migrada a ResponsiveTable, que nunca
 * llegó a renderizarse.
 *
 * [2.2] Sin useAuthCheck ni skeleton propio: el guard vive en dashboard/layout.tsx.
 */
export default function Page() {
  return <TipoSalidaPage />;
}
