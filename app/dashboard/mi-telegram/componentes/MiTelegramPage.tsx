'use client';

import { useClientePlan } from '@/app/lib/useClientePlan';
import Link from 'next/link';
import MiTelegramCard from './MiTelegramCard';

export default function MiTelegramPage() {
  const { plan, loading } = useClientePlan();

  return (
    <main className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-brand-800">Mi Telegram</h1>
        <p className="mt-1 text-sm text-brand-300">
          Recibí los pedidos nuevos del comercio en tu Telegram. Pronto también
          vas a poder consultarle al bot cuánto vendiste.
        </p>
      </div>
      {loading ? null : plan?.features?.canUseBot === true ? (
        <MiTelegramCard />
      ) : (
        <div className="rounded-2xl border border-brand-100 bg-white p-5 text-sm text-brand-600 shadow-card">
          El bot de Telegram está incluido en el plan Premium.{' '}
          <Link
            href="/dashboard/plan"
            className="font-semibold text-accent-500 hover:underline"
          >
            Ver planes →
          </Link>
        </div>
      )}
    </main>
  );
}
