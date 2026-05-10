"use client";

type CajaInicial = {
  inicio: number;
  ventas: number;
};

type Props = {
  data?: CajaInicial;
};

export default function PlanillaCajaInicial({ data = { inicio: 0, ventas: 0 } }: Props) {
  const total = (data.inicio || 0) + (data.ventas || 0);

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-brand-800">Caja Inicial</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-1">Caja Inicio</p>
          <p className="text-2xl font-bold text-brand-800">
            ${Number(data.inicio || 0).toLocaleString('es-AR')}
          </p>
        </div>

        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-1">Ventas del Día</p>
          <p className="text-2xl font-bold text-brand-800">
            ${Number(data.ventas || 0).toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-brand-200 bg-brand-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">Total Disponible</p>
        <p className="text-2xl font-bold text-brand-800">
          ${total.toLocaleString('es-AR')}
        </p>
      </div>
    </div>
  );
}
