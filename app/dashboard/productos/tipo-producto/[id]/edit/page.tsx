'use client';

import { useParams } from 'next/navigation';
import TipoProductoForm from '../../componentes/TipoProductoForm';

/** [3.3] Antes tenía su propia copia del formulario, con la rama de creación muerta. */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <TipoProductoForm id={Number(id)} />;
}
