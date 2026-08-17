

import { getClienteId } from "@/app/lib/authService";
import { deleteProducto, getProductoList } from '@/app/lib/producto.api';
import useAuthCheck from '@/app/lib/useAuthCheck';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TableSkeleton } from '../../../ui/TableSkeleton';
import { CreateProductoButton } from './createProductoButton';
import { CreateTipoProductoButton } from './createTipoProductoButton';
import ProductosTable from './productoTable';
import SearchProducto from './searchProducto';
import { getTipoProductoList } from '@/app/lib/tipoproducto.api';



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
  const [tipos, setTipos] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchProductos();
  }, [router]);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const data = await getTipoProductoList(getClienteId());
        setTipos(data);
      } catch (err) {
        console.error('Error cargando tipos de producto:', err);
      }
    };

    fetchTipos();
  }, []);


  const fetchProductos = async () => {
    try {
      const data = await getProductoList(getClienteId());
      // Asegurarse de que los productos tengan los campos necesarios
      const productosConDatos = data.map((producto: any) => ({
        ...producto,
        tipo_producto_nombre: producto.tipo_producto || `Tipo ${producto.tipo_producto}`,
        permite_mitad: producto.permite_mitad || false
      }));
      setProductos(productosConDatos);
    } catch (err: any) {
      setError(err.message);
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
        await deleteProducto(id, getClienteId());
        setProductos(productos.filter(producto => producto.id !== id));
        notifySuccess('Producto eliminado correctamente');
      } catch (error: any) {
        console.error('Error eliminando producto:', error);
        notifyError(error.message);
      }
    }
  };

  const filteredProductos = productos.filter(producto => 
    producto.nombre.toLowerCase().includes(query.toLowerCase()) ||
    (producto.tipo_producto_nombre && producto.tipo_producto_nombre.toLowerCase().includes(query.toLowerCase()))
  );

  return (
  <div className="w-full">
    {/* Header */}
    <div className="mb-4 flex items-center justify-between">
      <h1 className="font-display text-2xl text-brand-800">Productos</h1>
    </div>

    {/* Toolbar */}
    <div className="mb-5 flex flex-col gap-3">
      {/* Fila 1: search */}
      <SearchProducto placeholder="Buscar producto..." onSearch={handleSearch} />

      {/* Fila 2: botones + warning */}
      <div className="flex items-center gap-2">
        <CreateProductoButton disabled={tipos.length === 0} />
        <CreateTipoProductoButton />
      </div>

      {tipos.length === 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Creá al menos una categoría de producto para habilitar el botón &quot;Producto&quot;.
        </p>
      )}
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