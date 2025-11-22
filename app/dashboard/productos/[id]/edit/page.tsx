'use client';

import { getClienteId } from "@/app/lib/authService";
import { getProductoById, updateProducto } from '@/app/lib/producto.api';
import { getTipoProductoList } from "@/app/lib/tipoproducto.api";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const EditProductoPage = () => {
  const { id } = useParams();
  const [tipoProducto, setTipoProd] = useState([]); // Almacena los tipos de productos
  const [productoDetails, setProductoDetails] = useState({
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
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
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
      permite_mitad: false
    });
    router.push('/dashboard/productos');
  };

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Editar Producto</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={productoDetails.nombre || ''}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Precio Unitario</label>
          <input
            type="number"
            name="precio_unitario"
            value={productoDetails.precio_unitario || ''}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Tipo de Producto</label>
          <select
            name="tipo_producto_id"
            value={productoDetails.tipo_producto_id || ''}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
          >
            <option value="" disabled>
              Seleccione un tipo de producto
            </option>
            {tipoProducto.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Nuevo campo: Permite Mitad */}
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="permite_mitad"
              checked={productoDetails.permite_mitad || false}
              onChange={handleChange}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Permite venta por media unidad
            </span>
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Si está marcado, este producto podrá ser vendido por la mitad de su precio unitario
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductoPage;