'use client';

import { getClienteId } from "@/app/lib/authService";
import { getProductoById, updateProducto } from '@/app/lib/producto.api';
import { getTipoProductoList } from "@/app/lib/tipoproducto.api";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProductoImagenesManager } from '../../componentes/productoImagenesManager';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';

const EditProductoPage = () => {
  const { id } = useParams();
  const [tipoProducto, setTipoProd] = useState<any[]>([]); // Almacena los tipos de productos
  const [productoDetails, setProductoDetails] = useState<any>({
    nombre: '',
    precio_unitario: null,
    tipo_producto_id: null,
    permite_mitad: false,
    cliente_id : getClienteId(),
  });
  const router = useRouter();

  useEffect(() => {
    if (id) {
      const fetchProducto = async () => {
        try {
          const data = await getProductoById(id,getClienteId());
          console.log(data)
          setProductoDetails({
            ...data,
            permite_mitad: data.permite_mitad || false // Asegurar que tenga valor
          });
        } catch (err) {
          console.error(err);
        }
      };

      const fetchTipoProduto = async () => {
        try {
          const data = await getTipoProductoList(getClienteId());
          setTipoProd(data); // Guarda la lista de tipos de productos
        } catch (err) {
          console.error(err);
        }
      };

      fetchProducto();
      fetchTipoProduto();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log(id, productoDetails);
      await updateProducto(id, productoDetails);
      router.push('/dashboard/productos');
    } catch (error: any) {
       notifyError(error.message);
      console.log(error);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setProductoDetails({
      ...productoDetails,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCancel = () => {
    setProductoDetails({
      nombre: '',
      precio_unitario: null,
      tipo_producto_id: null,
      permite_mitad: false,
      cliente_id: getClienteId(),
    });
    router.push('/dashboard/productos');
  };

  return (
    <div className="w-full">
      <h1 className="mb-6 font-display text-2xl text-brand-800">Editar Producto</h1>

      <div className="rounded-xl border border-brand-100 bg-white p-4 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={productoDetails.nombre || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Precio Unitario</label>
            <input
              type="number"
              name="precio_unitario"
              value={productoDetails.precio_unitario || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">Tipo de Producto</label>
            <select
              name="tipo_producto_id"
              value={productoDetails.tipo_producto_id || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            >
              <option value="" disabled>Seleccione un tipo de producto</option>
              {tipoProducto.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="permite_mitad"
                checked={productoDetails.permite_mitad || false}
                onChange={handleChange}
                className="rounded border-brand-200 text-brand-600 focus:ring-brand-600/20"
              />
              <span className="text-sm font-medium text-brand-700">
                Permite venta por media unidad
              </span>
            </label>
            <p className="mt-1 text-xs text-brand-300 pl-6">
              Si está marcado, este producto podrá ser vendido por la mitad de su precio unitario.
            </p>
          </div>

          <div>
            {productoDetails.id ? (
              <ProductoImagenesManager productoId={productoDetails.id} />
            ) : (
              <p className="text-xs text-brand-300">
                Guardá el producto para poder administrar sus imágenes.
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto rounded-full border border-brand-200 px-6 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductoPage;