'use client'

import { getClienteId } from "@/app/lib/authService";
import { getRegistrosDiarios } from '@/app/lib/caja.api';
import { notifyError } from '@/app/lib/notificationService';
import { lusitana } from '@/app/ui/fonts';
import { TableSkeleton } from '@/app/ui/TableSkeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RegistroDiario {
  id: number;
  fecha: string;
  usuario_apertura_id: number;
  usuario_cierre_id: number | null;
  caja_inicial: number;
  caja_final: number | null;
  sucursal_id: number;
  ventas_efectivo: number;
  ventas_digital: number;
  retiros_total: number;
  gastos_total: number;
  diferencias_caja: number;
  caja_cerrada: boolean;
  created_at: string;
  updated_at: string;
  total_cierre?: number; // Calculado: (caja_inicial + ventas_efectivo) - (retiros_total + gastos_total)
}

export default function ReporteCajaPage() {
  const [registros, setRegistros] = useState<RegistroDiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroFecha, setFiltroFecha] = useState<'dia' | 'semana' | 'mes'>('mes');
  const router = useRouter();

  useEffect(() => {
    fetchRegistrosDiarios();
  }, [filtroFecha]);

  const fetchRegistrosDiarios = async () => {
    try {
      setLoading(true);
      const data = await getRegistrosDiarios(filtroFecha,getClienteId());
      console.log(data)
      // Calcular total al cierre para cada registro
      const registrosConTotal = data.map(registro => ({
        ...registro,
        total_cierre: registro.caja_cerrada ? 
          Number((registro.caja_final )).toFixed(2) : 
          null
      }));
      
      setRegistros(registrosConTotal);
      setError(null);
    } catch (err) {
      setError('Error al cargar los registros diarios');
      notifyError('Error al cargar los registros de caja');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (registroId: number) => {
    router.push(`/dashboard/reportes/reportes/caja/${registroId}/detalle`);
  };

  const getColorTotal = (total: number | null) => {
    if (total === null) return 'text-gray-600';
    return total >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  return (
    <div className="w-full p-6">
      <div className="flex w-full items-center justify-between mb-6">
        <h1 className={`${lusitana.className} text-2xl`}>Reporte de Caja Diaria</h1>
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">Filtrar por:</label>
          <select
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value as 'dia' | 'semana' | 'mes')}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="dia">Día</option>
            <option value="semana">Semana</option>
            <option value="mes">Mes</option>
          </select>
          
          <button
            onClick={fetchRegistrosDiarios}
            className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600"
          >
            Actualizar
          </button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold">Caja Inicial</th>
                <th className="px-4 py-3 text-left font-semibold">Ventas Efectivo</th>
                <th className="px-4 py-3 text-left font-semibold">Retiros</th>
                <th className="px-4 py-3 text-left font-semibold">Gastos</th>
                <th className="px-4 py-3 text-left font-semibold">Caja Final</th>
                <th className="px-4 py-3 text-left font-semibold">Total al Cierre</th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-4 py-3 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {registros.map((registro) => (
                <tr key={registro.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{formatDate(registro.fecha)}</td>
                  <td className="px-4 py-3">{formatCurrency(registro.caja_inicial)}</td>
                  <td className="px-4 py-3 text-green-600">{formatCurrency(registro.ventas_efectivo)}</td>
                  <td className="px-4 py-3 text-red-600">{formatCurrency(registro.retiros_total)}</td>
                  <td className="px-4 py-3 text-red-600">{formatCurrency(registro.gastos_total)}</td>
                  <td className="px-4 py-3">{formatCurrency(registro.caja_final)}</td>
                  <td className={`px-4 py-3 font-semibold ${getColorTotal(registro.total_cierre)}`}>
                    {formatCurrency(registro.total_cierre)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      registro.caja_cerrada 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {registro.caja_cerrada ? 'Cerrada' : 'Abierta'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleVerDetalle(registro.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                      disabled={!registro.caja_cerrada}
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {registros.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay registros de caja para el período seleccionado
            </div>
          )}
        </div>
      )}
    </div>
  );
}