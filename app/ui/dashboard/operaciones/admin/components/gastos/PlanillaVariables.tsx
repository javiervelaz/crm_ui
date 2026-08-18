"use client";

import { useState } from "react";

interface Variable {
  concepto: string;
  monto: number;
}

interface Props {
  data: Variable[];
  onUpdate: (data: Variable[]) => void;
  categorias: any[];
}

export default function PlanillaVariables({ data = [], onUpdate, categorias = [] }: Props) {
  const [items, setItems] = useState<Variable[]>(data || []);

  const addRow = () => {
    const newItems = [...items, { concepto: "", monto: 0 }];
    setItems(newItems);
    onUpdate(newItems);
  };

  const updateRow = (index: number, field: keyof Variable, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
    onUpdate(updated);
  };

  const deleteRow = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onUpdate(updated);
  };

  const subtotal = items.reduce((sum, row) => sum + (Number(row.monto) || 0), 0);

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-brand-800">Gastos Variables</h2>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-brand-300 text-center py-4">Sin filas. Agregá una.</p>
        )}
        {items.map((row, i) => (
          <div key={i} className="rounded-xl border border-brand-100 bg-brand-50 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <select
                value={row.concepto}
                onChange={(e) => updateRow(i, "concepto", e.target.value)}
                className="flex-1 min-w-0 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
              >
                <option value="">— Seleccionar concepto —</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                ))}
              </select>
              <button
                onClick={() => deleteRow(i)}
                className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-sm font-bold"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-400 shrink-0">Monto $</span>
              <input
                type="number"
                value={row.monto}
                onChange={(e) => updateRow(i, "monto", e.target.value)}
                className="flex-1 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-right text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                placeholder="0"
              />
            </div>
          </div>
        ))}
        {items.length > 0 && (
          <div className="flex justify-between items-center rounded-xl bg-brand-100 px-4 py-2 text-sm font-bold text-brand-800">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString('es-AR')}</span>
          </div>
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden text-sm">
          <thead>
            <tr className="bg-brand-50">
              <th className="px-4 py-2 text-left text-xs font-semibold text-brand-600 uppercase tracking-wider border-b border-brand-100">Concepto</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-brand-600 uppercase tracking-wider border-b border-brand-100">Monto</th>
              <th className="px-4 py-2 border-b border-brand-100"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={i} className="border-b border-brand-100 hover:bg-brand-50">
                <td className="px-4 py-2">
                  <select
                    value={row.concepto}
                    onChange={(e) => updateRow(i, "concepto", e.target.value)}
                    className="w-full rounded-lg border border-brand-200 px-2 py-1.5 text-sm text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                  >
                    <option value="">— Seleccionar —</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={row.monto}
                    onChange={(e) => updateRow(i, "monto", e.target.value)}
                    className="w-full rounded-lg border border-brand-200 px-2 py-1.5 text-sm text-right text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => deleteRow(i)}
                    className="h-7 w-7 inline-flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 text-xs font-bold transition-colors"
                    title="Eliminar fila"
                  >✕</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-brand-50 font-bold">
              <td className="px-4 py-2 text-right text-sm text-brand-700">Subtotal:</td>
              <td className="px-4 py-2 text-right text-sm text-brand-800">${subtotal.toLocaleString('es-AR')}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <button
        onClick={addRow}
        className="mt-4 rounded-full border border-brand-200 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
      >
        + Agregar fila
      </button>
    </div>
  );
}
