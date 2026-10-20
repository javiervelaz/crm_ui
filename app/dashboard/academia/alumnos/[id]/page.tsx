'use client';

import { useParams } from 'next/navigation';
import PersonaDetalle from '../../componentes/PersonaDetalle';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <PersonaDetalle entidad="alumnos" id={Number(id)} />;
}
