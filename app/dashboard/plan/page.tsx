// app/dashboard/plan/page.tsx
import { Suspense } from 'react';
import { PlanPageClient } from './PlanPageClient';

export default function PlanPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Mi plan</h1>

      <Suspense fallback={<p>Cargando información de tu plan y precios...</p>}>
        <PlanPageClient />
      </Suspense>
    </main>
  );
}
