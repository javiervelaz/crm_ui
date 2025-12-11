'use client'

import { getClienteId } from "@/app/lib/authService";
import { createProduct } from '@/app/lib/producto.api';
import { getTipoProductoList } from "@/app/lib/tipoproducto.api";
import useAuthCheck from '@/app/lib/useAuthCheck';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { uploadProductoImage } from '@/app/lib/productoImg.api';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';


const CreateUserPage = () => {
  useAuthCheck();
  const [productoDetails, setUserDetails] = useState({
    nombre: '',
    precio_unitario: null,
    tipo_producto_id: null,
    permite_mitad: false,
    cliente_id: getClienteId(),
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [tipoProducto, setTipoProd] = useState([]); // Almacena los tipos de productos
  
  useEffect(() => {
      const fetchTipoProduto = async () => {
        try {
          const data = await getTipoProductoList(getClienteId());
          setTipoProd(data); // Guarda la lista de tipos de productos
        } catch (err) {
          console.error(err);
        }
      };

      fetchTipoProduto();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserDetails({
      ...productoDetails,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    setSubmitting(true);

    console.log('Producto details:', productoDetails);

    // 1) Crear producto
    const created = await createProduct(productoDetails);

    // Asumimos que el backend devuelve el objeto creado con id.
    const productoId =
      created?.id ||
      created?.producto?.id ||
      created?.data?.id;

    if (!productoId) {
      notifyError('No se pudo obtener el ID del producto creado.');
      console.error('Respuesta createProduct sin id:', created);
      setSubmitting(false);
      return;
    }

    // 2) Si hay imagen seleccionada, subirla
    if (imageFile) {
      try {
        await uploadProductoImage(productoId, imageFile);
        notifySuccess('Producto y su imagen fueron creados correctamente.');
      } catch (err: any) {
        console.error(err);
        notifyError(
          err.message ?? 'Producto creado, pero hubo un error subiendo la imagen.',
        );
      }
    } else {
      notifySuccess('Producto creado correctamente.');
    }

    // 3) Redirigir al listado
    router.push('/dashboard/productos');
  } catch (error) {
    console.log(error);
    notifyError(error.message);
  } finally {
    setSubmitting(false);
  }
};


  const handleCancel = () => {
    setUserDetails({
      nombre: '',
      precio_unitario: null,
      tipo_producto_id: null,
      permite_mitad: false
    });
    router.push("/dashboard/productos");
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl mb-6">Crear nuevo producto</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            name="nombre"
            value={productoDetails.nombre || ''}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Precio
          </label>
          <input
            type="number"
            name="precio_unitario"
            value={productoDetails.precio_unitario || ''}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Producto
          </label>
          <select
            name="tipo_producto_id"
            value={productoDetails.tipo_producto_id || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccionar tipo...</option>
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
        {/* Imagen (opcional) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Imagen del producto (opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setImageFile(f);
            }}
            className="mt-1 block w-full text-sm text-gray-700"
          />
          <p className="mt-1 text-xs text-gray-500">
            Si seleccionás una imagen, se subirá cuando guardes el producto.
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
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage;