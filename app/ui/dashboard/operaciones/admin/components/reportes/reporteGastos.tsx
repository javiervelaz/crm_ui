import { logError } from '@/app/lib/logger';
import { getClienteId } from "@/app/lib/authService";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DatePicker from '@/components/ui/DatePicker';
import apiClient from '@/app/lib/apiClient';
import { addDays, format, subDays } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import * as XLSX from 'xlsx';

// Interfaces para tipos de datos
interface CategoriaTipo {
  id: number;
  descripcion: string;
}

interface CategoriaSalida {
  id: number;
  nombre: string;
}

interface Gasto {
  tipo_categoria?: string;
  salida?: string;
  cantidad_gastos: number;
  total_gastos: number;
  fecha?: string;
}

export default function ReporteGastosPage() {
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>(undefined);
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>(undefined);
  const [tipoReporte, setTipoReporte] = useState<'categoria_tipo' | 'categoria_salida'>('categoria_tipo');
  const [categoriasTipo, setCategoriasTipo] = useState<CategoriaTipo[]>([]);
  const [categoriasSalida, setCategoriasSalida] = useState<CategoriaSalida[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 🔹 Inicializar fechas con los últimos 7 días
  useEffect(() => {
    const hoy = new Date();
    const fechaInicio = subDays(hoy, 7);
    const fechaFin = addDays(hoy, 1);
    
    setFechaDesde(fechaInicio);
    setFechaHasta(fechaFin);
  }, []);

  // 🔹 Fetch categorías tipo
  const fetchCategoriasTipo = useCallback(async () => {
    try {
      // Cambiar por tu endpoint real
      const response = await apiClient.get(`${apiUrl}/reportes/salida/categoria-tipo`);
      setCategoriasTipo(response.data);
    } catch (err) {
      logError('Error fetching categorías tipo:', err);
    }
  }, [apiUrl]);

  // 🔹 Fetch categorías salida
  const fetchCategoriasSalida = useCallback(async () => {
    try {
      // Cambiar por tu endpoint real
      const response = await apiClient.get(`${apiUrl}/reportes/salida/categoria-salida/${getClienteId()}`);
      setCategoriasSalida(response.data);
    } catch (err) {
      logError('Error fetching categorías salida:', err);
    }
  }, [apiUrl]);

  // 🔹 Cargar opciones según tipo de reporte
  useEffect(() => {
    if (tipoReporte === 'categoria_tipo') {
      fetchCategoriasTipo();
    } else {
      fetchCategoriasSalida();
    }
    setCategoriaSeleccionada(''); // Resetear selección al cambiar tipo
  }, [tipoReporte, fetchCategoriasTipo, fetchCategoriasSalida]);

  // 🔹 Fetch reporte de gastos
  const fetchGastos = useCallback(async () => {
    if (!fechaDesde || !fechaHasta ) return;

    setLoading(true);
    try {
        let payload;
        let endpoint;
        if (tipoReporte === 'categoria_tipo') {
            // Payload para categoría tipo (usa ID numérico)
            payload = {
              fecha_desde: format(fechaDesde, 'yyyy-MM-dd'),
              fecha_hasta: format(fechaHasta, 'yyyy-MM-dd'),
              tipoId: parseInt(categoriaSeleccionada),
              cliente_id: getClienteId()
            };
            endpoint = `${apiUrl}/reportes/gastos/tipo-categoria-filter`
          } else {
            // Payload para categoría salida (usa string)
            payload = {
              fecha_desde: format(fechaDesde, 'yyyy-MM-dd'),
              fecha_hasta: format(fechaHasta, 'yyyy-MM-dd'),
              salida_descripcion: categoriaSeleccionada,
              cliente_id: getClienteId()
            };
            endpoint = `${apiUrl}/reportes/gastos/categoria-salida-filter`;
          }

      

      const res = await apiClient.post(endpoint, payload);
      setGastos(res.data);
    } catch (err) {
      logError('Error fetching gastos:', err);
    } finally {
      setLoading(false);
    }
  }, [fechaDesde, fechaHasta, tipoReporte, categoriaSeleccionada, apiUrl]);

  // 🔹 Exportar a Excel
  const exportToExcel = () => {
    if (gastos.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const excelData = gastos.map(gasto => ({
      'Tipo/Categoría': tipoReporte === 'categoria_tipo' ? gasto.tipo_categoria : gasto.salida,
      'Cantidad de Gastos': gasto.cantidad_gastos,
      'Total Gastado': parseFloat(gasto.total_gastos.toString()).toFixed(2)
    }));

    const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.total_gastos.toString()), 0);
    const totalCantidad = gastos.reduce((sum, g) => sum + g.cantidad_gastos, 0);

    excelData.push({
      'Tipo/Categoría': 'TOTAL',
      'Cantidad de Gastos': totalCantidad,
      'Total Gastado': totalGastos.toFixed(2)
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Gastos');

    const fileName = `reporte_gastos_${format(fechaDesde, 'yyyy-MM-dd')}_a_${format(fechaHasta, 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleFiltrar = () => {
    fetchGastos();
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Filtros de fecha */}
          <div>
            <label className="block text-sm font-medium">Fecha Desde</label>
            <DatePicker 
              label="Seleccionar Fecha" 
              value={fechaDesde} 
              onChange={setFechaDesde} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha Hasta</label>
            <DatePicker 
              label="Seleccionar Fecha" 
              value={fechaHasta} 
              onChange={setFechaHasta} 
            />
          </div>

          {/* Selector de tipo de reporte */}
          <div>
            <label className="block text-sm font-medium">Tipo de Reporte</label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value as 'categoria_tipo' | 'categoria_salida')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
            >
              <option value="categoria_tipo">Por Tipo de Categoría</option>
              <option value="categoria_salida">Por Categoría de Salida</option>
            </select>
          </div>

          {/* Selector de categoría */}
          <div>
            <label className="block text-sm font-medium">
              {tipoReporte === 'categoria_tipo' ? 'Tipo de Categoría' : 'Categoría de Salida'}
            </label>
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
              disabled={tipoReporte === 'categoria_tipo' ? categoriasTipo.length === 0 : categoriasSalida.length === 0}
            >
              <option value="">Seleccionar...</option>
              {tipoReporte === 'categoria_tipo' 
                ? categoriasTipo.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.descripcion}
                    </option>
                  ))
                : categoriasSalida.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
                  ))
              }
            </select>
          </div>

          {/* Botones */}
          <div className="md:col-span-5 text-right space-x-2">
            <Button onClick={handleFiltrar} disabled={loading}>
              {loading ? 'Cargando...' : 'Filtrar'}
            </Button>
            <Button 
              onClick={exportToExcel}
              variant="outline"
              className="bg-green-600 text-white hover:bg-green-700"
              disabled={gastos.length === 0}
            >
              Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Resultados de Gastos</h2>
          {loading ? (
            <div>Cargando...</div>
          ) : gastos.length === 0 ? (
            <div>No hay datos para mostrar</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    {tipoReporte === 'categoria_tipo' ? 'Tipo de Categoría' : 'Categoría de Salida'}
                  </th>
                  <th className="text-right p-2">Cantidad de Gastos</th>
                  <th className="text-right p-2">Total Gastado</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((gasto, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">
                      {tipoReporte === 'categoria_tipo' ? gasto.tipo_categoria : gasto.salida}
                    </td>
                    <td className="p-2 text-right">{gasto.cantidad_gastos}</td>
                    <td className="p-2 text-right">${parseFloat(gasto.total_gastos.toString()).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Gráfico */}
      {gastos.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Gráfico de Gastos</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gastos}>
                <XAxis 
                  dataKey={tipoReporte === 'categoria_tipo' ? 'tipo_categoria' : 'salida'} 
                  tickFormatter={(value) => value?.toString().substring(0, 15) || ''}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${parseFloat(value.toString()).toFixed(2)}`, 'Total Gastado']}
                />
                <Bar 
                  dataKey="total_gastos" 
                  fill="#ef4444" 
                  name="Total Gastado"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}