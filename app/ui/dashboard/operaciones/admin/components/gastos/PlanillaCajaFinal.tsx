"use client";

type CajaFinal = {
  contada: number;
  real: number;
};

type Props = {
  data?: CajaFinal;                     // opcional
  onChange?: (value: CajaFinal) => void; // opcional (no-op por defecto)
};

const INITIAL_FINAL: CajaFinal = { contada: 0, real: 0 };

export default function PlanillaCajaFinal({
  data = INITIAL_FINAL,
  onChange = () => {},
}: Props) {
  const updateField = (field: keyof CajaFinal, value: string) => {
    const next: CajaFinal = { ...data, [field]: Number(value) || 0 };
    onChange(next);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Caja Final</h2>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Caja Contada</span>
          <input
            type="number"
            value={data.contada ?? ""}
            onChange={(e) => updateField("contada", e.target.value)}
            className="w-full p-2 border rounded"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Caja Real</span>
          <input
            type="number"
            value={data.real ?? ""}
            onChange={(e) => updateField("real", e.target.value)}
            className="w-full p-2 border rounded"
          />
        </label>
      </div>
    </div>
  );
}
