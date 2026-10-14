'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** /dashboard/academia → la sección de uso diario. */
export default function AcademiaPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/academia/inscripciones');
  }, [router]);
  return null;
}
