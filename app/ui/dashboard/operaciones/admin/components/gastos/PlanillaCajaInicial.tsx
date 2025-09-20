"use client";

type CajaInicial = {
  inicio: number;
  ventas: number;
};

type Props = {
  data?: CajaInicial;
};

export default function PlanillaCajaInicial({
  data = { inicio: 0, ventas: 0 }
}: Props) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Caja Inicial</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Caja Inicio</span>
          <div className="w-full p-2 border rounded bg-gray-50">
            ${data.inicio}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Ventas del Día</span>
          <div className="w-full p-2 border rounded bg-gray-50">
            ${data.ventas}
          </div>
        </div>
      </div>
      
      {/* Opcional: Mostrar total */}
      <div className="mt-4 flex flex-col gap-1">
        <span className="text-sm text-gray-600 font-semibold">Total Disponible</span>
        <div className="w-full p-2 border rounded bg-blue-50 font-bold">
          ${(data.inicio + data.ventas)}
        </div>
      </div>
    </div>
  );
}