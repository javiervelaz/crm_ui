import { getProductoList } from '@/app/lib/producto.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DatePicker from '@/components/ui/DatePicker';
import MultiSelect from '@/components/ui/MultiSelect';
import axios from 'axios';
import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function ReporteVentasPage() {
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>(undefined);
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>(undefined);
  const [productos, setProductos] = useState([]);
  const [selectedProductos, setSelectedProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;


  useEffect(() => {
    // Llamada a la API para obtener usuarios reales
    const fetchProductos = async () => {
      try {
        const data = await getProductoList();
        console.log("productos",data) // Llamada a tu servicio que obtiene la lista de usuarios
        setProductos(data);
      } catch (err) {
        console.error(err);
      } 
    };
    fetchProductos();
  }, []);

  

  const fetchVentas = useCallback(async () => {
    const payload = {
      fecha_desde: format(fechaDesde, 'yyyy-MM-dd'),
      fecha_hasta: format(fechaHasta, 'yyyy-MM-dd'),
      productos: selectedProductos.length > 0 ? selectedProductos.map(p => p.id).join(',') : null
    };
    try {
      const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/reportes/ventas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          body: JSON.stringify(payload),
        },
      });
     
      setVentas(response.data);
    } catch (err) {
      console.error(err);
    }
  }, [fechaDesde, fechaHasta, selectedProductos, apiUrl]);

  useEffect(() => {
    fetchVentas();
  }, [productos,fetchVentas]);
  
  const handleFiltrar = () => {
    fetchVentas();
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Fecha Desde</label>
            <DatePicker label="Seleccionar Fecha" value={fechaDesde} onChange={setFechaDesde} />
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha Hasta</label>
            <DatePicker label="Seleccionar Fecha" value={fechaHasta} onChange={setFechaHasta} />
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
