import { getProductoList } from '@/app/lib/producto.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DatePicker from '@/components/ui/DatePicker';
import MultiSelect from '@/components/ui/MultiSelect';
import axios from 'axios';
import { addDays, format, subDays } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import * as XLSX from 'xlsx';

export default function ReporteVentasPage() {
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>(undefined);
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>(undefined);
  const [productos, setProductos] = useState([]);
  const [selectedProductos, setSelectedProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // 🔹 Inicializar fechas con los últimos 7 días
  useEffect(() => {
    const hoy = new Date();
    const fechaInicio = subDays(hoy, 7); // Hace 7 días
    const fechaFin = addDays(hoy, 1); // Mañana
    
    setFechaDesde(fechaInicio);
    setFechaHasta(fechaFin);
  }, []);

  useEffect(() => {
    // Llamada a la API para obtener usuarios reales
    const fetchProductos = async () => {
      try {
        const data = await getProductoList();
        console.log("productos", data);
        setProductos(data);
      } catch (err) {
        console.error(err);
      } 
    };
    fetchProductos();
  }, []);

   // 🔹 Función para exportar a Excel
   const exportToExcel = () => {
    if (ventas.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Preparar datos para Excel
    const excelData = ventas.map(venta => ({
      'Fecha': format(new Date(venta.fecha), 'yyyy-MM-dd'),
      'Producto': venta.producto,
      'Cantidad Total': venta.cantidad_total,
      'Total Vendido': parseFloat(venta.total_vendido).toFixed(2)
    }));

    // Calcular totales
    const totalCantidad = ventas.reduce((sum, v) => sum + parseInt(v.cantidad_total), 0);
    const totalVendido = ventas.reduce((sum, v) => sum + parseFloat(v.total_vendido), 0);

    // Agregar fila de totales
    excelData.push({
      'Fecha': 'TOTAL',
      'Producto': '',
      'Cantidad Total': totalCantidad,
      'Total Vendido': totalVendido.toFixed(2)
    });

    // Crear workbook y worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Ventas');

    // Generar nombre de archivo con fechas
    const fileName = `reporte_ventas_${format(fechaDesde, 'yyyy-MM-dd')}_a_${format(fechaHasta, 'yyyy-MM-dd')}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(wb, fileName);
  };

  // 🔹 Función para exportar a CSV (alternativa más simple)
  const exportToCSV = () => {
    if (ventas.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const csvData = ventas.map(venta => 
      `"${format(new Date(venta.fecha), 'yyyy-MM-dd')}","${venta.producto}",${venta.cantidad_total},${parseFloat(venta.total_vendido).toFixed(2)}`
    ).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'Fecha,Producto,Cantidad Total,Total Vendido\n' + 
      csvData;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ventas_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchVentas = useCallback(async () => {
    // Solo hacer fetch si ambas fechas están definidas
    if (!fechaDesde || !fechaHasta) return;
    
    const payload = {
      fecha_desde: format(fechaDesde, 'yyyy-MM-dd'),
      fecha_hasta: format(fechaHasta, 'yyyy-MM-dd'),
      productos: selectedProductos.length > 0 ? selectedProductos.map(p => p.id).join(',') : null
    };
    
    try {
      const res = await axios.post(`${apiUrl}/reportes/ventas`, payload);
      setVentas(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [fechaDesde, fechaHasta, selectedProductos, apiUrl]);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  const handleFiltrar = () => {
    fetchVentas();
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="p-4 max-w-md mx-auto">
            <label className="block text-sm font-medium">Productos</label>
            <MultiSelect
              selectedRoles={selectedProductos}
              onChange={setSelectedProductos}
              rolesList={productos}
            />
          </div>
          <div className="md:col-span-4 text-right">
            <Button onClick={handleFiltrar}>Filtrar</Button>
            <Button 
              onClick={exportToExcel}
              variant="outline"
              className="bg-green-600 text-white hover:bg-green-700"
              disabled={ventas.length === 0}
            >
              Exportar Excel
            </Button>
            <Button 
              onClick={exportToCSV}
              variant="outline"
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={ventas.length === 0}
            >
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Resultados de Ventas</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Fecha</th>
                <th className="text-left p-2">Producto</th>
                <th className="text-right p-2">Cantidad Total</th>
                <th className="text-right p-2">Total Vendido</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{format(new Date(venta.fecha), 'yyyy-MM-dd')}</td>
                  <td className="p-2">{venta.producto}</td>
                  <td className="p-2 text-right">{venta.cantidad_total}</td>
                  <td className="p-2 text-right">${parseFloat(venta.total_vendido).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Gráfico de Ventas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ventas}>
              <XAxis dataKey={(entry) => format(new Date(entry.fecha), 'MM-dd')} />
              <YAxis />
              <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(2)}`} />
              <Bar dataKey="total_vendido" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}