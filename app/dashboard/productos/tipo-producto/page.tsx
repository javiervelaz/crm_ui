'use client';

import TipoProductoPage from './componentes/tipoProductoPage';

/**
 * /dashboard/productos/tipo-producto — Tipos de producto.
 *
 * [3.3] Antes importaba de '@/app/dashboard/tipo-producto/componentes/tipoProductoPage',
 * es decir del OTRO árbol — el mismo bug que tenía dashboard/gasto/page.tsx antes de
 * corregirse. Consecuencia: el botón "Editar" de esa copia mandaba a
 * /dashboard/tipo-producto/{id}/edit, una ruta que ningún módulo del token cubre,
 * así que caía en la pantalla Sin acceso.
 *
 * [2.2] Sin useAuthCheck ni guard propio: el guard vive en dashboard/layout.tsx.
 */
export default function Page() {
  return <TipoProductoPage />;
}
