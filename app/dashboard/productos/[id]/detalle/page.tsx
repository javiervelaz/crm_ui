'use client'

import { getProductoById } from '@/app/lib/producto.api';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DetalleProductoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducto();
  }, [id]);

  const fetchProducto = async () => {
    try {
      const data = await getProductoById(Number(id));
      setProducto(data);
    } catch (error) {
      console.error('Error cargando producto:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!producto) return <div>Producto no encontrado</div>;

  return (
    <div className="w-full p-6 max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Detalle del Producto</h1>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Nombre</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{producto.nombre}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600">Precio</label>
              <p className="mt-1 text-lg font-semibold text-green-600">
                ${Number(producto.precio_unitario).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Tipo de Producto</label>
              <p className="mt-1 text-sm text-gray-900">
                {producto.tipo_producto_nombre || `Tipo ${producto.tipo_producto_id}`}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600">Permite Media Unidad</label>
              <p className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  producto.permite_mitad 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {producto.permite_mitad ? 'Sí' : 'No'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => router.push('/dashboard/productos')}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}