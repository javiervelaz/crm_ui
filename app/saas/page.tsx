// app/saas/page.tsx
'use client';

import { useRef, useState, FormEvent } from 'react';
import { registerSaasCliente, PlanTier } from '@/app/lib/saas.api';
import { useTiers } from '@/app/lib/useTiers';   // 👈 NUEVO

type StatusState = 'idle' | 'loading' | 'success' | 'error';

const PLAN_LABELS: Record<PlanTier, string> = {
  FREE: 'Free',
  BASIC: 'Básico',
  PREMIUM: 'Premium',
};

const formatPrice = (price: number | null | undefined) => {
  if (price == null) return '(definir precio)';
  if (price === 0) return 'Sin costo';
  return `$ ${price.toLocaleString('es-AR')} / mes`;
};

export default function SaasLandingPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('FREE');

  const [comercioNombre, setComercioNombre] = useState('');
  const [cuit, setCuit] = useState('');
  const [adminNombre, setAdminNombre] = useState('');
  const [adminApellido, setAdminApellido] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminDni, setAdminDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');

  const [status, setStatus] = useState<StatusState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Traemos los planes desde la API (/api/tiers)
  const { tiers, loading: tiersLoading, error: tiersError } = useTiers();

  const freeTier = tiers.find((t) => t.code.toUpperCase() === 'FREE');
  const basicTier = tiers.find((t) => t.code.toUpperCase() === 'BASIC');
  const premiumTier = tiers.find((t) => t.code.toUpperCase() === 'PREMIUM');

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectPlan = (plan: PlanTier) => {
    setSelectedPlan(plan);
    scrollToForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await registerSaasCliente({
        plan: selectedPlan,
        comercioNombre,
        cuit,
        adminNombre,
        adminApellido,
        adminEmail,
        adminDni,
        telefono,
        password,
      });

      setStatus('success');
      setSuccessMessage(
        'Tu cuenta fue creada correctamente. Ya podés acceder al CRM con tu usuario.'
      );

      setComercioNombre('');
      setCuit('');
      setAdminNombre('');
      setAdminApellido('');
      setAdminEmail('');
      setAdminDni('');
      setTelefono('');
      setPassword('');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'Error creando la cuenta.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HERO */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center lg:py-20">
          {/* Texto */}
          <div className="flex-1 space-y-6">
            <p className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
              🍕 CRM para negocios de barrio
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Registrá pedidos, caja y reportes
              <span className="block text-amber-300">
                sin hojas sueltas ni Excel.
              </span>
            </h1>
            <p className="max-w-xl text-slate-300">
              Pensado para pizzerías, rotiserías y comercios familiares. Cargás
              tus productos una vez y todos los días ves cuánto vendiste, qué
              gastaste y qué te quedó.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleSelectPlan('FREE')}
                className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow hover:bg-amber-300 transition"
              >
                Crear cuenta Free
              </button>
              <button
                onClick={() => handleSelectPlan('BASIC')}
                className="rounded-full border border-slate-500 px-6 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition"
              >
                Ver planes y registrarme
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Sin tarjeta para el plan Free. Pensado para que lo pruebes en tu
              comercio real.
            </p>
          </div>

          {/* Mockup sencillo usando tus pantallas */}
          <div className="flex-1">
            <div className="mx-auto max-w-md space-y-4">
              <div className="rounded-xl bg-white/5 p-4 shadow-lg ring-1 ring-white/10 backdrop-blur">
                <p className="mb-2 text-sm font-semibold text-slate-200">
                  Reportes del día
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-200">
                  <div className="rounded-lg bg-emerald-500/20 p-3">
                    <p className="text-emerald-100">Ventas</p>
                    <p className="text-lg font-bold">$36.000</p>
                  </div>
                  <div className="rounded-lg bg-rose-500/20 p-3">
                    <p className="text-rose-100">Gastos</p>
                    <p className="text-lg font-bold">$12.000</p>
                  </div>
                  <div className="col-span-2 rounded-lg bg-indigo-500/20 p-3">
                    <p className="text-indigo-100">Clientes del día</p>
                    <p className="text-lg font-bold">Nuevos 7 · Recurrentes 21</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-xl">
                <p className="mb-3 text-xs font-semibold text-slate-500">
                  Ejemplo de micrositio de pedidos
                </p>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div>
                      <p className="font-semibold text-slate-800">
                        Pizza muzarella
                      </p>
                      <p className="text-slate-500">$7.500</p>
                    </div>
                    <button className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      +
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div>
                      <p className="font-semibold text-slate-800">
                        Empanadas (docena)
                      </p>
                      <p className="text-slate-500">$9.000</p>
                    </div>
                    <button className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12 md:flex-row">
          <div className="md:w-1/3">
            <h2 className="text-xl font-semibold text-slate-900">
              Hecho para el día a día del comercio.
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Nada de pantallas eternas ni configuraciones raras. Lo que
              necesitás: pedidos, caja, gastos y reportes.
            </p>
          </div>
          <div className="grid flex-1 gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Adiós al cuaderno
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Registrá cada pedido y venta en segundos y evitá perder plata
                por errores o olvidos.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Cierre de caja sin cuentas
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                El sistema te muestra qué vendiste, qué gastaste y cuánto te
                queda, sin Excel ni calculadora.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Pedidos por WhatsApp
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Si elegís el plan Premium, tus clientes hacen el pedido desde un
                link y entra directo al CRM.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Equipo ordenado
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Usuarios por rol: dueño, encargado, cajero. Cada uno ve lo que
                necesita, nada más.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section className="bg-slate-900 py-14 text-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold">Planes para tu comercio</h2>
            <p className="mt-2 text-sm text-slate-300">
              Empezá gratis y cuando tu negocio lo pida, pasás a un plan pago.
            </p>
            {tiersLoading && (
              <p className="mt-2 text-xs text-slate-400">Cargando precios...</p>
            )}
            {tiersError && (
              <p className="mt-2 text-xs text-red-400">
                Error cargando precios: {tiersError}
              </p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* FREE */}
            <PlanCard
              title="Free"
              description="Para probar el sistema en tu comercio."
              price={formatPrice(freeTier?.precio_mensual ?? 0)}
              features={[
                'Registro de pedidos del día',
                'Gestión básica de productos',
                'Caja diaria simple',
              ]}
              plan="FREE"
              selected={selectedPlan === 'FREE'}
              onSelect={handleSelectPlan}
            />

            {/* BASIC */}
            <PlanCard
              title="Básico"
              description="Para comercios que usan el CRM todos los días."
              price={formatPrice(basicTier?.precio_mensual)}
              highlight
              features={[
                'Todo lo del plan Free',
                'Pedidos y productos sin límite',
                'Cierre de caja y gastos',
              ]}
              plan="BASIC"
              selected={selectedPlan === 'BASIC'}
              onSelect={handleSelectPlan}
            />

            {/* PREMIUM */}
            <PlanCard
              title="Premium"
              description="Para dueños que quieren ver el negocio completo."
              price={formatPrice(premiumTier?.precio_mensual)}
              features={[
                'Todo lo del plan Básico',
                'Reportes diarios y por medio de pago',
                'Micrositio y bot de pedidos por WhatsApp',
              ]}
              plan="PREMIUM"
              selected={selectedPlan === 'PREMIUM'}
              onSelect={handleSelectPlan}
            />
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            Los límites exactos de cada plan (productos, usuarios, etc.) se
            pueden ajustar más adelante en el backend.
          </p>
        </div>
      </section>

      {/* FORMULARIO DE REGISTRO */}
      <section ref={formRef} className="bg-white py-14">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              Crear cuenta {PLAN_LABELS[selectedPlan]}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Completá los datos de tu comercio. Vamos a crear un usuario
              administrador para que empieces a usar el CRM.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
          >
            {/* Plan seleccionado (solo lectura) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Plan seleccionado
              </label>
              <div className="mt-1 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                {PLAN_LABELS[selectedPlan]}
              </div>
            </div>

            {/* Datos del comercio */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Nombre del comercio
                </label>
                <input
                  type="text"
                  value={comercioNombre}
                  onChange={(e) => setComercioNombre(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  CUIT
                </label>
                <input
                  type="text"
                  value={cuit}
                  onChange={(e) => setCuit(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Teléfono de contacto
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Datos del usuario admin */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Nombre (admin)
                </label>
                <input
                  type="text"
                  value={adminNombre}
                  onChange={(e) => setAdminNombre(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Apellido (admin)
                </label>
                <input
                  type="text"
                  value={adminApellido}
                  onChange={(e) => setAdminApellido(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email (usuario administrador)
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  DNI (opcional)
                </label>
                <input
                  type="text"
                  value={adminDni}
                  onChange={(e) => setAdminDni(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Mensajes */}
            {status === 'error' && errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
            {status === 'success' && successMessage && (
              <p className="text-sm text-emerald-700">{successMessage}</p>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Al crear la cuenta aceptás los términos y condiciones del
                servicio.
              </p>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:opacity-60"
              >
                {status === 'loading' ? 'Creando cuenta...' : 'Crear mi cuenta'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-6 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            ¿Listo para dejar el cuaderno y las cuentas a mano?
          </h3>
          <p className="text-sm text-slate-600">
            Empezá con el plan Free y si te sirve, después pasás a Básico o
            Premium sin perder tus datos.
          </p>
          <button
            onClick={() => handleSelectPlan('FREE')}
            className="mt-2 rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-300"
          >
            Crear cuenta Free
          </button>
        </div>
      </section>
    </main>
  );
}

interface PlanCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  plan: PlanTier;
  selected: boolean;
  highlight?: boolean;
  onSelect: (plan: PlanTier) => void;
}

function PlanCard({
  title,
  description,
  price,
  features,
  plan,
  selected,
  highlight,
  onSelect,
}: PlanCardProps) {
  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border px-4 py-5 text-sm shadow-sm ${
        highlight
          ? 'border-amber-300 bg-slate-900/60'
          : 'border-slate-700 bg-slate-900/40'
      } ${selected ? 'ring-2 ring-amber-400' : ''}`}
    >
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          {title}
        </p>
        <p className="text-lg font-semibold text-white">{price}</p>
        <p className="text-xs text-slate-300">{description}</p>
        <ul className="mt-3 space-y-2 text-xs text-slate-200">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => onSelect(plan)}
        className="mt-4 rounded-full bg.white px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100"
      >
        Elegir {title}
      </button>
    </div>
  );
}
