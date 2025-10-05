'use client'

import { getClienteId } from "@/app/lib/authService";
import { getRegistroDiarioDetalle } from '@/app/lib/caja.api';
import { notifyError } from '@/app/lib/notificationService';
import { lusitana } from '@/app/ui/fonts';
import { TableSkeleton } from '@/app/ui/TableSkeleton';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DetalleRegistro {
  registro: {
    id: number;
    fecha: string;
    caja_inicial: number;
    caja_final: number;
    ventas_efectivo: number;
    ventas_digital: number;
    retiros_total: number;
    gastos_total: number;
    diferencias_caja: number;
    caja_cerrada: boolean;
  };
  entradas: Array<{
    id: number;
    monto_total: number;
    medio_pago: string;
    created_at: string;
  }>;
  salidas: Array<{
    id: number;
    descripcion: string;
    monto: number;
    categoria: string;
    created_at: string;
  }>;
  total_entradas: number;
  total_salidas: number;
  saldo_final: number;
}

export default function DetalleCajaPage() {
  const { id } = useParams();
  const router = useRouter();
  const [detalle, setDetalle] = useState<DetalleRegistro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetalle();
    }
  }, [id]);

  const fetchDetalle = async () => {
    try {
      setLoading(true);
      const data = await getRegistroDiarioDetalle(Number(id),getClienteId());
      console.log(data)
      setDetalle(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el detalle de la caja');
      notifyError('Error al cargar el detalle');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <TableSkeleton />;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!detalle) return <div>No se encontraron datos</div>;

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`${lusitana.className} text-2xl mb-2`}>
            Detalle de Caja - {formatDate(detalle.registro.fecha)}
          </h1>
          <button
            onClick={() => router.back()}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            ← Volver al reporte
          </button>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${
            detalle.saldo_final >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            Saldo Final: {formatCurrency(detalle.saldo_final)}
          </div>
          <div className="text-sm text-gray-600">
            Estado: {detalle.registro.caja_cerrada ? 'Cerrada' : 'Abierta'}
          </div>
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-blue-800 font-semibold">Caja Inicial</div>
          <div className="text-2xl text-blue-600">{formatCurrency(detalle.registro.caja_inicial)}</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-green-800 font-semibold">Total Entradas</div>
          <div className="text-2xl text-green-600">{formatCurrency(detalle.total_entradas)}</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-red-800 font-semibold">Total Salidas</div>
          <div className="text-2xl text-red-600">{formatCurrency(detalle.total_salidas)}</div>
        </div>
        
        <div className={`p-4 rounded-lg ${
          detalle.registro.diferencias_caja === 0 ? 'bg-gray-50' : 'bg-yellow-50'
        }`}>
          <div className="font-semibold">Diferencias</div>
          <div className={`text-2xl ${
            detalle.registro.diferencias_caja === 0 ? 'text-gray-600' : 'text-yellow-600'
          }`}>
            {formatCurrency(detalle.registro.diferencias_caja)}
          </div>
        </div>
      </div>

      {/* Layout de Hoja Contable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna DEBE (Entradas) */}
        <div className="bg-white rounded-lg shadow">
          <div className="bg-green-100 px-4 py-3 rounded-t-lg">
            <h2 className="font-semibold text-green-800">DEBE - ENTRADAS</h2>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2">Descripción</th>
                  <th className="text-right pb-2">Monto</th>
                  <th className="text-right pb-2">Hora</th>
                </tr>
              </thead>
              <tbody>
                {detalle.entradas.map((entrada) => (
                  <tr key={entrada.id} className="border-b">
                    <td className="py-2">Venta {entrada.medio_pago.toLowerCase()}</td>
                    <td className="text-right text-green-600 py-2">
                      {formatCurrency(entrada.monto_total)}
                    </td>
                    <td className="text-right text-gray-500 text-xs py-2">
                      {formatDateTime(entrada.created_at)}
                    </td>
                  </tr>
                ))}
                {/* Total Entradas */}
                <tr className="bg-green-50 font-semibold">
                  <td className="py-3">TOTAL ENTRADAS</td>
                  <td className="text-right text-green-700 py-3">
                    {formatCurrency(detalle.total_entradas)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna HABER (Salidas) */}
        <div className="bg-white rounded-lg shadow">
          <div className="bg-red-100 px-4 py-3 rounded-t-lg">
            <h2 className="font-semibold text-red-800">HABER - SALIDAS</h2>
          </div>
          <div className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2">Descripción</th>
                  <th className="text-right pb-2">Monto</th>
                  <th className="text-right pb-2">Categoría</th>
                </tr>
              </thead>
              <tbody>
                {detalle.salidas.map((salida) => (
                  <tr key={salida.id} className="border-b">
                    <td className="py-2">{salida.descripcion}</td>
                    <td className="text-right text-red-600 py-2">
                      {formatCurrency(salida.monto)}
                    </td>
                    <td className="text-right text-gray-500 text-xs py-2">
                      {salida.categoria}
                    </td>
                  </tr>
                ))}
                {/* Total Salidas */}
                <tr className="bg-red-50 font-semibold">
                  <td className="py-3">TOTAL SALIDAS</td>
                  <td className="text-right text-red-700 py-3">
                    {formatCurrency(detalle.total_salidas)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Resumen Final */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Caja Inicial</div>
            <div className="font-semibold">{formatCurrency(detalle.registro.caja_inicial)}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600">Neto del Día</div>
            <div className={`font-semibold ${
              detalle.total_entradas - detalle.total_salidas >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(detalle.total_entradas - detalle.total_salidas)}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600">Caja Final Teórica</div>
            <div className="font-semibold">
              {formatCurrency(detalle.registro.caja_inicial + detalle.total_entradas - detalle.total_salidas)}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Caja Final Real</div>
              <div className="text-lg font-semibold">{formatCurrency(detalle.registro.caja_final)}</div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">Diferencia</div>
              <div className={`text-lg font-semibold ${
                detalle.registro.diferencias_caja === 0 ? 'text-gray-600' : 'text-yellow-600'
              }`}>
                {formatCurrency(detalle.registro.diferencias_caja)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}