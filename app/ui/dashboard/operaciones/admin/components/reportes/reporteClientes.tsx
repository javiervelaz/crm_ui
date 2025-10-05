import { getClienteId } from "@/app/lib/authService";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DatePicker from '@/components/ui/DatePicker';
import MultiSelect from '@/components/ui/MultiSelect';
import axios from 'axios';
import { addDays, format, subDays } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import * as XLSX from 'xlsx';

interface ClienteReporte {
  cliente_id: number | null;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  total_pedidos: number;
  monto_total: number;
  promedio_pedido: number;
  ultima_compra: string;
  productos_comprados: string;
}

// Definimos opciones fijas para tipos de cliente
const tipoClienteOpciones = [
  { id: 'CLI', nombre: 'Cliente' },
  { id: 'MOS', nombre: 'Mostrador' }
];

export default function ReporteClientesPage() {
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>(undefined);
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>(undefined);
  const [selectedTiposCliente, setSelectedTiposCliente] = useState([]);
  const [clientes, setClientes] = useState<ClienteReporte[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Inicializar fechas con los últimos 30 días
  useEffect(() => {
    const hoy = new Date();
    const fechaInicio = subDays(hoy, 30);
    const fechaFin = addDays(hoy, 1);
    
    setFechaDesde(fechaInicio);
    setFechaHasta(fechaFin);
  }, []);

  // Función para exportar a Excel
  const exportToExcel = () => {
    if (clientes.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const excelData = clientes.map(cliente => ({
      'ID Cliente': cliente.cliente_id || 'Mostrador',
      'Nombre': cliente.cliente_nombre,
      'Email': cliente.cliente_email,
      'Teléfono': cliente.cliente_telefono,
      'Total Pedidos': cliente.total_pedidos,
      'Monto Total': parseFloat(cliente.monto_total.toString()).toFixed(2),
      'Promedio por Pedido': parseFloat(cliente.promedio_pedido.toString()).toFixed(2),
      'Última Compra': cliente.ultima_compra,
      'Productos Comprados': cliente.productos_comprados
    }));

    // Calcular totales
    const totalPedidos = clientes.reduce((sum, c) => sum + c.total_pedidos, 0);
    const totalMonto = clientes.reduce((sum, c) => sum + c.monto_total, 0);

    // Agregar fila de totales
    excelData.push({
      'ID Cliente': 'TOTAL',
      'Nombre': '',
      'Email': '',
      'Teléfono': '',
      'Total Pedidos': totalPedidos,
      'Monto Total': Number(totalMonto).toFixed(2),
      'Promedio por Pedido': totalPedidos > 0 ? Number((totalMonto / totalPedidos)).toFixed(2) : '0.00',
      'Última Compra': '',
      'Productos Comprados': ''
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Clientes');

    const fileName = `reporte_clientes_${format(fechaDesde, 'yyyy-MM-dd')}_a_${format(fechaHasta, 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Función para exportar a CSV
  const exportToCSV = () => {
    if (clientes.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = 'ID Cliente,Nombre,Email,Teléfono,Total Pedidos,Monto Total,Promedio por Pedido,Última Compra,Productos Comprados\n';
    
    const csvData = clientes.map(cliente => 
      `"${cliente.cliente_id || 'Mostrador'}","${cliente.cliente_nombre}","${cliente.cliente_email}","${cliente.cliente_telefono}",${cliente.total_pedidos},${parseFloat(cliente.monto_total.toString()).toFixed(2)},${parseFloat(cliente.promedio_pedido.toString()).toFixed(2)},"${cliente.ultima_compra}","${cliente.productos_comprados}"`
    ).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,' + headers + csvData;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_clientes_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchClientes = useCallback(async () => {
    if (!fechaDesde || !fechaHasta) return;
    
    const payload = {
      fecha_desde: format(fechaDesde, 'yyyy-MM-dd'),
      fecha_hasta: format(fechaHasta, 'yyyy-MM-dd'),
      tipo_cliente: selectedTiposCliente.length > 0 ? selectedTiposCliente.map(t => t.id).join(',') : null,
      cliente_id: getClienteId()
    };
    
    try {
      const res = await axios.post(`${apiUrl}/reportes/clientes`, payload);
      setClientes(res.data);
    } catch (err) {
      console.error('Error fetching client report:', err);
    }
  }, [fechaDesde, fechaHasta, selectedTiposCliente, apiUrl]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleFiltrar = () => {
    fetchClientes();
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
            <label className="block text-sm font-medium">Tipos de Cliente</label>
            <MultiSelect
              selectedRoles={selectedTiposCliente}
              onChange={setSelectedTiposCliente}
              rolesList={tipoClienteOpciones} // Usamos las opciones fijas
            />
          </div>
          <div className="md:col-span-4 text-right">
            <Button onClick={handleFiltrar}>Filtrar</Button>
            <Button 
              onClick={exportToExcel}
              variant="outline"
              className="bg-green-600 text-white hover:bg-green-700"
              disabled={clientes.length === 0}
            >
              Exportar Excel
            </Button>
            <Button 
              onClick={exportToCSV}
              variant="outline"
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={clientes.length === 0}
            >
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Reporte de Clientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cliente</th>
                  <th className="text-left p-2">Contacto</th>
                  <th className="text-right p-2">Total Pedidos</th>
                  <th className="text-right p-2">Monto Total</th>
                  <th className="text-right p-2">Promedio/Pedido</th>
                  <th className="text-left p-2">Última Compra</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">
                      <div className="font-medium">{cliente.cliente_nombre}</div>
                      <div className="text-xs text-gray-500">ID: {cliente.cliente_id || 'Mostrador'}</div>
                    </td>
                    <td className="p-2">
                      <div>{cliente.cliente_email}</div>
                      <div className="text-xs">{cliente.cliente_telefono}</div>
                    </td>
                    <td className="p-2 text-right">{cliente.total_pedidos}</td>
                    <td className="p-2 text-right">${parseFloat(cliente.monto_total.toString()).toFixed(2)}</td>
                    <td className="p-2 text-right">${parseFloat(cliente.promedio_pedido.toString()).toFixed(2)}</td>
                    <td className="p-2">{cliente.ultima_compra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">Top Clientes por Monto</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={clientes
                .filter(c => c.cliente_id !== null) // Excluir mostrador
                .sort((a, b) => b.monto_total - a.monto_total)
                .slice(0, 10) // Top 10
              }
            >
              <XAxis 
                dataKey="cliente_nombre" 
                angle={-45} 
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`$${parseFloat(value.toString()).toFixed(2)}`, 'Monto Total']}
              />
              <Bar dataKey="monto_total" fill="#3b82f6" name="Monto Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}