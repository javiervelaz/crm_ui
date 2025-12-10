// app/dashboard/plan/PlanPageClient.tsx
'use client';

import { useClientePlan } from '@/app/lib/useClientePlan';
import { useTiers } from '@/app/lib/useTiers';
import { createBillingCheckout, simulateBillingMock } from '@/app/lib/billing.api';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';

const IS_MOCK = process.env.NEXT_PUBLIC_MP_MOCK === 'true';

export function PlanPageClient() {
  const { plan, loading: loadingPlan, error: errorPlan } = useClientePlan();
  const { tiers, loading: loadingTiers, error: errorTiers } = useTiers();
  const [isProcessing, setIsProcessing] = useState(false);
  const searchParams = useSearchParams();
  const statusParam = searchParams?.get('status') ?? null;

  useEffect(() => {
    // fetch solo en cliente (si lo necesitás después)
  }, []);

  const handleUpgrade = async (tierCode: string) => {
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

  const isLoading = loadingPlan || loadingTiers;
  const hasError = errorPlan || errorTiers;

  const standardTiers = tiers.filter((t) => !t.es_personalizado);
  const promoTiers = tiers.filter((t) => t.es_personalizado);

  return (
    <>
      {IS_MOCK && (
        <div className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-xs text-blue-800">
          MODO MOCK ACTIVADO: los pagos no van a MercadoPago, se simulan contra el backend.
        </div>
      )}

      {statusParam === 'success' && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Pago procesado correctamente. Si no ves el cambio de plan, recargá en unos segundos.
        </div>
      )}

      {statusParam === 'failed' && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          El pago no se completó. Podés intentarlo nuevamente.
        </div>
      )}

      {isLoading && <p>Cargando información de tu plan y precios...</p>}

      {hasError && (
        <p className="text-sm text-red-600">
          Error cargando datos: {errorPlan || errorTiers}
        </p>
      )}

      {plan && !isLoading && (
        <>
          <section className="grid gap-6 md:grid-cols-3">
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

            {standardTiers.map((tier) => (
              <PlanCard
                key={tier.code}
                title={tier.nombre_publico}
                tierCode={tier.code}
                description={tier.descripcion}
                features={tier.beneficios || []}
                price={tier.precio_mensual}
                currentTier={currentTier}
                onUpgrade={handleUpgrade}
                isProcessing={isProcessing}
                duracion = {tier.duracion_meses}
              />
            ))}
          </section>

          {promoTiers.length > 0 && (
            <>
              <h3 className="mt-10 text-lg font-bold text-gray-800">Promociones especiales</h3>
              <section className="mt-4 grid gap-6 md:grid-cols-3">
                {promoTiers.map((tier) => (
                  <PlanCard
                    key={tier.code}
                    title={tier.nombre_publico}
                    tierCode={tier.code}
                    description={tier.descripcion}
                    features={tier.beneficios || []}
                    price={tier.precio_mensual}
                    currentTier={currentTier}
                    onUpgrade={handleUpgrade}
                    isProcessing={isProcessing}
                    duracion = {tier.duracion_meses}
                  />
                ))}
              </section>
            </>
          )}
        </>
      )}
    </>
  );
}

interface PlanCardProps {
  title: string;
  tierCode: string;
  description: string;
  features: string[];
  currentTier: string;
  onUpgrade: (tierCode: string) => void;
  isProcessing: boolean;
  price: number | null;
  duracion: number | null;
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
  duracion
}: PlanCardProps) {
  const isCurrent = currentTier === tierCode;
  const isHigher = currentTier === 'FREE' || currentTier === 'BASIC';

  const priceLabel = price == null ? 'Consultar' : `$ ${price.toLocaleString('es-AR')} / mes`;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase text-gray-500">{title}</p>
        <h3 className="mt-1 text-lg font-semibold text-gray-900">Plan {title}</h3>
        <p className="mt-1 text-xl font-bold text-gray-900">{priceLabel}</p>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        <p className="mt-2 text-sm text-gray-600">{duracion} meses</p>
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
              : `Seleccionar ${title}`}
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
