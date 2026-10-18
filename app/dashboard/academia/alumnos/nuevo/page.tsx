'use client';

import { Suspense } from 'react';
import PersonaNueva from '../../componentes/PersonaNueva';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PersonaNueva entidad="alumnos" />
    </Suspense>
  );
}
