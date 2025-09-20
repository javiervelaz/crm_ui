// app/reports/DailyOperationsReport.tsx
'use client';

import { reporteDiario } from "@/app/lib/operaciones.api";
import { useEffect, useState } from 'react';

interface OperacionDiaria {
  id: number;
  fecha: string;
  caja_inicial: number;
  caja_final: number | null;
  sucursal_id: string;
  total: number;
}

const DailyOperationsReport: React.FC = () => {
  const [operaciones, setOperaciones] = useState<OperacionDiaria[]>([]);

  useEffect(() => {
    const registro = async () => {
      try {
        const res = await reporteDiario();
        setOperaciones(res); 
      } catch (error) {
        console.error('Error al verificar la caja:', error);
      }
    };
    registro();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Reporte de Operaciones Diarias</h1>
      <h2 className="text-md font-bold mb-4">Últimos 100 días</h2>
      <table className="w-full bg-white shadow-lg rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left">Fecha</th>
            <th className="px-4 py-2 text-left">Caja Inicial</th>
            <th className="px-4 py-2 text-left">Caja Final</th>
            <th className="px-4 py-2 text-left">Sucursal</th>
            <th className="px-4 py-2 text-left">Total</th>
          </tr>
        </thead>
        <tbody>
          {operaciones.map((registro) => (
            <tr
              key={registro.id}
              className={`${
                registro.total > 0 ? 'bg-green-100' : 'bg-red-100'
              } border-b border-gray-300`}
            >
              <td className="px-4 py-2">
                {new Date(registro.fecha).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-2">{registro.caja_inicial}</td>
              <td className="px-4 py-2">{registro.caja_final ?? '---'}</td>
              <td className="px-4 py-2">{registro.sucursal_id}</td>
              <td className="px-4 py-2 font-semibold">{registro.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DailyOperationsReport;
