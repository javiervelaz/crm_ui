"use client";

import { useState } from "react";

interface Sueldo {
  empleado: string;
  monto: number;
}

interface Props {
  data: Sueldo[];
  onUpdate: (data: Sueldo[]) => void;
  categorias: any[];
}

export default function PlanillaSueldos({ data = [], onUpdate ,categorias = []}: Props) {
  const [items, setItems] = useState<Sueldo[]>(data || []);

 

  const addRow = () => {
    const newItems = [...items, { empleado: "", monto: 0 }];
    setItems(newItems);
    onUpdate(newItems); // Actualizar inmediatamente
  };

  const updateRow = (index: number, field: keyof Sueldo, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
    onUpdate(updated); // Actualizar inmediatamente
  };

  const deleteRow = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onUpdate(updated); // Actualizar inmediatamente
  };

  const subtotal = items.reduce((sum, row) => sum + (Number(row.monto) || 0), 0);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Sueldos</h2>
      <table className="w-full border-collapse border rounded-lg">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Empleado</th>
            <th className="p-2 border">Monto</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, i) => (
            <tr key={i}>
              <td className="border p-2">
                <select
                  value={row.empleado}
                  onChange={(e) => updateRow(i, "empleado", e.target.value)}
                  className="w-full p-1 border rounded"
                >
                  <option value="">-- Seleccionar --</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  value={row.monto}
                  onChange={(e) => updateRow(i, "monto", e.target.value)}
                  className="w-full p-1 border rounded text-right"
                />
              </td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => deleteRow(i)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  title="Eliminar fila"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td className="p-2 border text-right">Subtotal:</td>
            <td className="p-2 border text-right">${subtotal.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <button
        onClick={addRow}
        className="mt-3 px-3 py-1 bg-blue-500 text-white rounded"
      >
        + Agregar fila
      </button>
    </div>
  );
}
