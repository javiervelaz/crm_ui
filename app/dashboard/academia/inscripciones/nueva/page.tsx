'use client';

import { Suspense } from 'react';
import InscripcionNueva from '../../componentes/InscripcionNueva';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <InscripcionNueva />
    </Suspense>
  );
}
