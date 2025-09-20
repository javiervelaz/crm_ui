

import { deleteProducto, getProductoList } from '@/app/lib/producto.api';
import useAuthCheck from '@/app/lib/useAuthCheck';
import { lusitana } from '@/app/ui/fonts';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TableSkeleton } from '../../../ui/TableSkeleton';
import { CreateProductoButton } from './createProductoButton';
import { CreateTipoProductoButton } from './createTipoProductoButton';
import ProductosTable from './productoTable';
import SearchProducto from './searchProducto';


import { notifyError, notifySuccess } from '@/app/lib/notificationService';

interface Producto {
  id: number;
  nombre: string;
  precio_unitario: number;
  tipo_producto_id: number;
  tipo_producto_nombre?: string;
  permite_mitad: boolean;
}

export default function ProductosPage() {
  useAuthCheck();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchProductos();
  }, [router]);

  const fetchProductos = async () => {
    try {
      const data = await getProductoList();
      // Asegurarse de que los productos tengan los campos necesarios
      const productosConDatos = data.map((producto: any) => ({
        ...producto,
        tipo_producto_nombre: producto.tipo_producto || `Tipo ${producto.tipo_producto}`,
        permite_mitad: producto.permite_mitad || false
      }));
      setProductos(productosConDatos);
    } catch (err) {
      setError('Error al cargar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleView = (id: number) => {
    router.push(`/dashboard/productos/${id}/detalle`);
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/productos/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProducto(id);
        setProductos(productos.filter(producto => producto.id !== id));
        notifySuccess('Producto eliminado correctamente');
      } catch (error) {
        console.error('Error eliminando producto:', error);
        notifyError('Error al eliminar el producto');
      }
    }
  };

  const filteredProductos = productos.filter(producto => 
    producto.nombre.toLowerCase().includes(query.toLowerCase()) ||
    (producto.tipo_producto_nombre && producto.tipo_producto_nombre.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="w-full p-6">
      <div className="flex w-full items-center justify-between mb-4">
        <h1 className={`${lusitana.className} text-2xl`}>Productos</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8 mb-6">
        <SearchProducto placeholder="Buscar producto..." onSearch={handleSearch} />
        <CreateTipoProductoButton />
        <CreateProductoButton />
      </div>
      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <ProductosTable 
          productos={filteredProductos} 
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}