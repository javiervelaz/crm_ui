'use client'

import { getClienteId } from "@/app/lib/authService";
import { crearCategoriaSalida, getGastosCategoriaTipo } from '@/app/lib/gasto';
import useAuthCheck from '@/app/lib/useAuthCheck';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const CreateTipoSalidaPage = () => {
  useAuthCheck();
  const [productoDetails, setUserDetails] = useState({
    nombre: '',
    categoria_tipo_id: null,
    cliente_id: getClienteId(),
  });
  const router = useRouter();
  const [tipoProducto, setTipoProd] = useState([]); // Almacena los tipos de productos
  const [categoriaTipo, setCategoriaTipo]  = useState([]);
  
  useEffect(() => {
      const fetchCategoriaTipo = async () => {
        try {
          const data = await getGastosCategoriaTipo();
          setCategoriaTipo(data); // Guarda la lista de tipos de productos
        } catch (err) {
          console.error(err);
        }
      };

      fetchCategoriaTipo();
  }, []);

  const handleChange = (e) => {
     e.preventDefault();
    const { name, value, type, checked } = e.target;
    setUserDetails({
      ...productoDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      console.log("productoDetails",productoDetails);
      await crearCategoriaSalida(productoDetails);
      
      router.push('/dashboard/tipo-salida');
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancel = () => {
    setUserDetails({
      nombre: '',
      categoria_tipo_id: null
    });
    router.push("/dashboard/tipo-salida");
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl mb-6">Nuevo tipo de gasto</h1>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de salida
          </label>
          <select
            name="categoria_tipo_id"
            value={productoDetails.categoria_tipo_id || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccionar tipo...</option>
            {categoriaTipo.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.descripcion}
              </option>
            ))}
          </select>
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

export default CreateTipoSalidaPage;