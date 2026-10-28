"use client";

import { medioDeFila, MedioPagoOpcion } from "@/app/lib/medioPagoGasto";

interface Props {
  medios: MedioPagoOpcion[];
  value?: number;
  onChange: (id: number) => void;
  className?: string;
}

/** Selector de cómo se pagó el gasto. Sin lista de medios no se muestra (el API asume efectivo). */
export default function SelectMedioPagoGasto({ medios, value, onChange, className = "" }: Props) {
  if (medios.length === 0) return null;
  return (
    <select
      aria-label="Medio de pago"
      value={medioDeFila(value, medios) ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`rounded-lg border border-brand-200 bg-white px-2 py-1.5 text-sm text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20 ${className}`}
    >
      {medios.map((m) => (
        <option key={m.id} value={m.id}>{m.descripcion}</option>
      ))}
    </select>
  );
}
