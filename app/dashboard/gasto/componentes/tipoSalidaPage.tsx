

import { getClienteId } from "@/app/lib/authService";
import { deleteCategoriaSalida, getGastoCategorias } from '@/app/lib/gasto';
import useAuthCheck from '@/app/lib/useAuthCheck';
import { lusitana } from '@/app/ui/fonts';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TableSkeleton } from '../../../ui/TableSkeleton';
import { CreateTipoSalidaButton } from './createTipoSalidaButton';
import SearchTipoSalida from './searchTipoSalida';
import TipoSalidaTable from "./TipoSalidaTable";


import { notifyError, notifySuccess } from '@/app/lib/notificationService';

interface Producto {
  id: number;
  nombre: string;
  precio_unitario: number;
  tipo_producto_id: number;
  tipo_producto_nombre?: string;
  permite_mitad: boolean;
}

interface TipoSalida {
    id: number;
    categoria_tipo_id: number;
    descripcion: string;
    nombre: string;
}

export default function TipoSalidaPage() {
  useAuthCheck();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [TipoSalida, setTipoSalida] = useState<TipoSalida[]>([]);
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
    fetchTipoSalida();
  }, [router]);



  const fetchTipoSalida = async () => {
    try {
      const data = await getGastoCategorias(getClienteId());
      setTipoSalida(data);
    } catch (err) {
      setError('Error al cargar tipo salida');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };


  const handleEdit = (id: number) => {
    router.push(`/dashboard/tipo-salida/${id}/edit`);
  };

  const handleDelete = async (id: number, cliente: BigInt) => {
    if (confirm('¿Estás seguro de eliminar esta categoria?')) {
      try {
        await deleteCategoriaSalida(id,cliente);
        notifySuccess('Categoria de gasto eliminado correctamente');
        fetchTipoSalida(); // ← AQUÍ ESTÁ EL CAMBIO: Recargar la lista
      } catch (error) {
        notifyError('Error al eliminar categoria salida');
      }
    }
  };

  const filteredProductos = TipoSalida.filter(producto => 
    producto.nombre.toLowerCase().includes(query.toLowerCase()) ||
    (producto.descripcion.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="w-full p-6">
      <div className="flex w-full items-center justify-between mb-4">
        <h1 className={`${lusitana.className} text-2xl`}>Tipos de gastos</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8 mb-6">
        <SearchTipoSalida placeholder="Buscar tipo de gasto..." onSearch={handleSearch} />
        <CreateTipoSalidaButton />
      </div>
      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <TipoSalidaTable  
          tipoSalida = {filteredProductos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        /> 
      )}
    </div>
  );
}