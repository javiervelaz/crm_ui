'use client';

import { useParams } from 'next/navigation';
import CategoriaGastoForm from '../../componentes/CategoriaGastoForm';

/**
 * [3.3] Antes: 140 líneas con su propia copia del formulario, y un
 * router.push('/dashboard/tipo-salida') que mandaba al árbol que se borra.
 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <CategoriaGastoForm id={Number(id)} />;
}
