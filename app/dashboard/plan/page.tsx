// app/dashboard/plan/page.tsx
'use client';

import { useClientePlan } from '@/app/lib/useClientePlan';
import { useTiers } from '@/app/lib/useTiers';
import { createBillingCheckout, simulateBillingMock } from '@/app/lib/billing.api';
import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';

const IS_MOCK = process.env.NEXT_PUBLIC_MP_MOCK === 'true';

export default function PlanPage() {
  const { plan, loading: loadingPlan, error: errorPlan } = useClientePlan();
  const { tiers, loading: loadingTiers, error: errorTiers } = useTiers();
  const [isProcessing, setIsProcessing] = useState(false);
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');

  const handleUpgrade = async (tierCode: 'BASIC' | 'PREMIUM') => {
    try {
      setIsProcessing(true);
      const { initPoint, preapprovalId } = await createBillingCheckout(tierCode);

      if (IS_MOCK) {
        await simulateBillingMock(preapprovalId);
        alert('Pago simulado correctamente. El plan debería estar actualizado.');
        window.location.reload();
      } else {
        window.location.href = initPoint;
      }
    } catch (err: any) {
      alert(err?.message || 'Error iniciando pago con MercadoPago');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentTier = plan?.tierCode?.toUpperCase() || 'FREE';

  const basicTier = useMemo(
    () => tiers.find((t) => t.code.toUpperCase() === 'BASIC'),
    [tiers]
  );
  const premiumTier = useMemo(
    () => tiers.find((t) => t.code.toUpperCase() === 'PREMIUM'),
    [tiers]
  );

  const isLoading = loadingPlan || loadingTiers;
  const hasError = errorPlan || errorTiers;

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Mi plan</h1>

      {IS_MOCK && (
        <div className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-xs text-blue-800">
          MODO MOCK ACTIVADO: los pagos no van a MercadoPago, se simulan contra el backend.
        </div>
      )}

      {statusParam === 'success' && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✅ ¡Pago exitoso! Si no ves el cambio de plan, recargá la página en unos segundos.
        </div>
        )}

        {statusParam === 'pending' && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            ⏳ El pago está pendiente. Vas a recibir una confirmación cuando se acredite.
        </div>
        )}

        {statusParam === 'rejected' && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            ❌ El pago fue rechazado. Verificá los datos de la tarjeta o intentá con otro medio.
        </div>
        )}

        {statusParam === 'cancelled' && (
        <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800">
            El pago fue cancelado o no se completó. No se generó ningún cargo.
        </div>
        )}


      {isLoading && <p>Cargando información de tu plan y precios...</p>}

      {hasError && (
        <p className="text-sm text-red-600">
          Error cargando datos:{' '}
          {errorPlan || errorTiers}
        </p>
      )}

      {plan && !isLoading && (
        <section className="grid gap-6 md:grid-cols-3">
          {/* Plan actual */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Plan actual
            </p>
            <h2 className="mt-2 text-xl font-bold text-gray-900">
              {plan.tierNombre} ({currentTier})
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Cliente: {plan.clienteNombre}
            </p>

            <ul className="mt-4 space-y-1 text-sm text-gray-700">
              <li>
                • Reportes:{' '}
                {plan.features.canUseReports ? 'Habilitados' : 'No disponible en este plan'}
              </li>
              <li>
                • Bot WhatsApp:{' '}
                {plan.features.canUseWhatsappBot
                  ? 'Habilitado'
                  : 'No disponible en este plan'}
              </li>
            </ul>
          </div>

          {/* Plan Básico */}
          <PlanCard
            title="Básico"
            tierCode="BASIC"
            description={basicTier?.descripcion || 'Para comercios que usan el CRM todos los días.'}
            features={[
              'Todo lo del plan Free',
              'Pedidos y productos sin límite',
              'Cierre de caja y gastos',
            ]}
            price={basicTier?.precio_mensual ?? null}
            currentTier={currentTier}
            onUpgrade={handleUpgrade}
            isProcessing={isProcessing}
          />

          {/* Plan Premium */}
          <PlanCard
            title="Premium"
            tierCode="PREMIUM"
            description={premiumTier?.descripcion || 'Para dueños que quieren ver reportes y automatizar pedidos.'}
            features={[
              'Todo lo del plan Básico',
              'Reportes diarios y por medio de pago',
              'Micrositio y bot de pedidos por WhatsApp',
            ]}
            price={premiumTier?.precio_mensual ?? null}
            currentTier={currentTier}
            onUpgrade={handleUpgrade}
            isProcessing={isProcessing}
          />
        </section>
      )}
    </main>
  );
}

interface PlanCardProps {
  title: string;
  tierCode: 'BASIC' | 'PREMIUM';
  description: string;
  features: string[];
  currentTier: string;
  onUpgrade: (tierCode: 'BASIC' | 'PREMIUM') => void;
  isProcessing: boolean;
  price: number | null;
}

function PlanCard({
  title,
  tierCode,
  description,
  features,
  currentTier,
  onUpgrade,
  isProcessing,
  price,
}: PlanCardProps) {
  const isCurrent = currentTier === tierCode;
  const isHigher =
    currentTier === 'FREE' ||
    (currentTier === 'BASIC' && tierCode === 'PREMIUM');

  const priceLabel =
    price == null ? 'Consultar' : `$ ${price.toLocaleString('es-AR')} / mes`;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase text-gray-500">
          {title}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-gray-900">
          Plan {title}
        </h3>
        <p className="mt-1 text-xl font-bold text-gray-900">
          {priceLabel}
        </p>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        <ul className="mt-3 space-y-1 text-sm text-gray-700">
          {features.map((f) => (
            <li key={f}>• {f}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        {isCurrent ? (
          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            Plan actual
          </span>
        ) : isHigher ? (
          <button
            onClick={() => onUpgrade(tierCode)}
            disabled={isProcessing}
            className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {isProcessing
              ? IS_MOCK
                ? 'Simulando pago...'
                : 'Redirigiendo a pago...'
              : `Mejorar a ${title}`}
          </button>
        ) : (
          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
            No tiene sentido bajar de plan acá (manejar downgrades aparte)
          </span>
        )}
      </div>
    </div>
  );
}
