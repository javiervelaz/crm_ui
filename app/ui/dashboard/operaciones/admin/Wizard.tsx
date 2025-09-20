import { crearGasto, getGastoCategorias, getGastosPorRegistro } from '@/app/lib/gasto';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import useCajaAbierta from '@/app/lib/useCajaAbierta';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const GastoWizard = ({ }) => {
  const [tiposCategoria, setTiposCategoria] = useState([]);
  const [activeTipoId, setActiveTipoId] = useState(null);
  const [categoriasPorTipo, setCategoriasPorTipo] = useState({});
  const [gastosPorCategoria, setGastosPorCategoria] = useState({});
  const [gastosExistentes, setGastosExistentes] = useState([]);
  const [registroDiario, setRegistroDiario] = useState('');
  //const [cajaAbierta, setCajaAbierta] = useState(false);
  const { cajaAbierta,registroDiarioId } = useCajaAbierta();
  const router = useRouter();

  useEffect(() => {

    const fetchCategorias = async () => {
      const data = await getGastoCategorias();
    
      // Agrupamiento correcto por tipo
      const tiposMap = new Map();
      const categoriasAgrupadas = {};
    
      data.forEach(cat => {
        const tipoId = Number(cat.categoria_tipo_id);
        const tipoDescripcion = cat.descripcion || 'sin nombre';
    
        // Guardar tipo si no existe
        if (!tiposMap.has(tipoId)) {
          tiposMap.set(tipoId, tipoDescripcion);
          categoriasAgrupadas[tipoId] = []; // inicializar arreglo
        }
    
        // Agregar categoría al grupo correspondiente
        categoriasAgrupadas[tipoId].push(cat);
      });
    
      // Convertir Map en array ordenado
      const tiposLista = Array.from(tiposMap.entries()).map(([id, descripcion]) => ({
        id,
        descripcion,
      }));
      console.log("tiposLista final:", tiposLista);

      // Actualizar estado
      setTiposCategoria(tiposLista);
      setCategoriasPorTipo(categoriasAgrupadas);
      setActiveTipoId(tiposLista[0]?.id ?? null);
    
      // Inicializar estado de gastos vacíos por categoría
      const inicial = {};
      data.forEach((cat) => {
        inicial[cat.id] = [];
      });
      setGastosPorCategoria(inicial);
    
      // Debug opcional
      console.log("Tipos encontrados:", tiposLista);
      console.log("Categorias agrupadas:", categoriasAgrupadas);
    };

    const fetchGastos = async () => {
      const data = await getGastosPorRegistro(registroDiarioId);
      setGastosExistentes(data);
    };

    fetchCategorias();
    fetchGastos();
  }, [registroDiarioId]);

  const handleAgregarGasto = (categoriaId) => {
    setGastosPorCategoria((prev) => ({
      ...prev,
      [categoriaId]: [...(prev[categoriaId] || []), { descripcion: '', monto: '' }],
    }));
  };

  const handleChange = (categoriaId, index, field, value) => {
    const actualizados = [...(gastosPorCategoria[categoriaId] || [])];
    actualizados[index][field] = value;
    setGastosPorCategoria((prev) => ({
      ...prev,
      [categoriaId]: actualizados,
    }));
  };

  const handleEliminar = (categoriaId, index) => {
    const filtrado = gastosPorCategoria[categoriaId].filter((_, i) => i !== index);
    setGastosPorCategoria((prev) => ({
      ...prev,
      [categoriaId]: filtrado,
    }));
  };



  const handleGuardar = async (categoriaId) => {
    const token = localStorage.getItem('token');
    if (token) {
      
     
      const decoded = jwtDecode(token);
      const usuario_id = decoded.userId;
      const payload = (gastosPorCategoria[categoriaId] || [])
      .filter((g) => g.descripcion && g.monto)
      .map((g) => ({
        ...g,
        categoria_salida_id: categoriaId,
        registro_diario_id: registroDiarioId,
        usuario_id: usuario_id,
      }));
      console.log("payload ",payload)
      if (payload.length === 0) {
        notifyError('Debe ingresar al menos un gasto con descripción y monto.');
        return;
      }
      try {
        await crearGasto(payload);
        notifySuccess('Gastos registrados correctamente.');
        const nuevos = await getGastosPorRegistro(registroDiarioId);
        setGastosExistentes(nuevos);
        setGastosPorCategoria((prev) => ({
          ...prev,
          [categoriaId]: [],
        }));
      } catch (e) {
        notifyError('Error al registrar los gastos.');
      }
    }
   
  };

  return (
    <div className="p-4">
         {!cajaAbierta ? (
      <div className="text-center">
        <p className="text-red-600 font-semibold text-lg mb-4">
          Todavía no se registraron operaciones diarias
        </p>
        <button
          onClick={() => router.push('/dashboard/operaciones/empleado')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Abrir operaciones
        </button>
      </div>
    ) : (
      <>
        <h2 className="text-lg font-bold mb-4">Registro de Gastos</h2>

        {/* Tabs de tipos de categoría */}
        <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-300 overflow-x-auto">
          {tiposCategoria.map((tipo) => (
            <button
              key={tipo.id}
              onClick={() => setActiveTipoId(tipo.id)}
              className={`px-5 py-2 rounded-t-md text-sm font-semibold whitespace-nowrap ${
                activeTipoId === tipo.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={{ minWidth: '120px', maxWidth: '220px' }}
            >
              {tipo.descripcion
                ? tipo.descripcion.charAt(0).toUpperCase() + tipo.descripcion.slice(1)
                : 'Sin nombre'}
            </button>
          ))}
        </div>

        {/* Categorías para el tipo seleccionado */}
        {categoriasPorTipo[activeTipoId]?.map((cat) => (
          <div key={cat.id} className="mb-6">
            <h4 className="font-semibold text-sm mb-2 text-blue-800">{cat.nombre}</h4>

            {(gastosPorCategoria[cat.id] || []).map((gasto, idx) => (
              <div key={idx} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Descripción"
                  value={gasto.descripcion}
                  onChange={(e) => handleChange(cat.id, idx, 'descripcion', e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                />
                <input
                  type="number"
                  placeholder="Monto"
                  value={gasto.monto}
                  onChange={(e) => handleChange(cat.id, idx, 'monto', e.target.value)}
                  className="border px-2 py-1 rounded w-32"
                />
                <button
                  onClick={() => handleEliminar(cat.id, idx)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Eliminar
                </button>
              </div>
            ))}

            <button
              onClick={() => handleAgregarGasto(cat.id)}
              className="bg-green-500 text-white px-3 py-1 rounded mt-1"
            >
              + Agregar Gasto
            </button>

            <div className="mt-2 text-right">
              <button
                onClick={() => handleGuardar(cat.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Guardar Gastos
              </button>
            </div>
          </div>
        ))}

        {/* Gastos ya registrados */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Gastos registrados hoy</h3>
          <ul className="divide-y divide-gray-200">
            {gastosExistentes.map((g, i) => (
              <li key={i} className="py-1 flex justify-between">
                <span>
                  {g.descripcion} ({g.categoria_nombre})
                </span>
                <span className="font-mono">${g.monto}</span>
              </li>
            ))}
          </ul>
        </div>
      </>
    )}
    </div>
    
  );
  
};

export default GastoWizard;
