import { getClienteId } from '@/app/lib/authService';
import { getMedioPagoList } from '@/app/lib/mediopago.api';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { crearPedido } from '@/app/lib/operaciones.api';
import { getProductoList } from '@/app/lib/producto.api';
import { getClienteByTelefono } from "@/app/lib/profile.api";
import { getTipoProductoList } from "@/app/lib/tipoproducto.api";
import { getClienteEstadistica } from "@/app/lib/usuario.api";
import { useEffect, useState } from 'react';

// Interfaces para los tipos de datos
interface ModalProps {
  onClose: () => void;
  registroDiario: number;
  usuario_id: number;
}

interface ProductoPedido {
  producto_id: string | number;
  cantidad: number;
  cantidad_mitad: number, // Inicializar en 0
  precio_unitario: number;
  observaciones: string;
  monto_adicional: number;
}

interface PedidoState {
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_casa_nro: string;
  cliente_barrio: string;
  pedido_obs: string;
  productos: ProductoPedido[];
  registro_diario_id: number;
  monto_total: number;
  usuario_id: number;
  sucursal_id: number;
  medio_pago_id: number | null;
  user_cliente_id: number | null;
  paga_efectivo: number; // Nuevo campo
  vuelto_pago_efectivo: number; // Nuevo campo
  cliente_id: BigInt | null;
}

interface Producto {
  id: number;
  nombre: string;
  precio_unitario: number;
  tipo_producto_id: number;
  cantidad_mitad: number; // Nueva propiedad para medias unidades
  monto_adicional: number;
  [key: string]: any; // Para propiedades adicionales
}

interface MedioPago {
  id: number;
  descripcion: string;
  [key: string]: any;
}

interface TipoProducto {
  id: number;
  nombre: string;
  [key: string]: any;
}
interface ProductoEstadistica {
  producto_id: number;
  producto_nombre: string;
  cantidad_total: number;
  veces_comprado: number;
}

interface MedioPagoEstadistica {
  medio_pago_id: number;
  medio_pago_descripcion: string;
  medio_pago_codigo: string;
  veces_utilizado: number;
}

interface ClienteEstadistica {
  cantidad_pedidos: number;
  total_gastado: number;
  ultima_compra: string | null; // Puede ser null si no tiene compras
  top_3_productos: ProductoEstadistica[];
  top_medio_pago: MedioPagoEstadistica | null; // Puede ser null si no tiene medios de pago
}



interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  casa_nro: string;
  barrio: string;
  [key: string]: any;
}

const PedidoForm = ({ onClose, registroDiario, usuario_id }: ModalProps) => {
  // Estados con tipos definidos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [medioPago, setMedioPago] = useState<MedioPago[]>([]);
  const [errorMedioPago, setErrorMedioPago] = useState<boolean>(false);
  const [errorProducto, setErrorProducto] = useState<boolean>(false);
  const [tipoProductos, setTipoProductos] = useState<TipoProducto[]>([]);
  const [activeTipoProducto, setActiveTipoProducto] = useState<number | null>(null);
  const [clienteDataEstadistica, setClienteDataEstadistica] = useState<ClienteEstadistica>({
    cantidad_pedidos: 0,
    total_gastado: 0,
    ultima_compra: null,
    top_3_productos: [],
    top_medio_pago: null
  });

  const [pedido, setPedido] = useState<PedidoState>({
    cliente_nombre: '',
    cliente_telefono: '',
    cliente_casa_nro: "",
    cliente_barrio: "",
    pedido_obs: "",
    productos: [],
    registro_diario_id: registroDiario,
    monto_total: 0,
    usuario_id: usuario_id,
    sucursal_id: 1,
    medio_pago_id: null,
    user_cliente_id: null,
    paga_efectivo: 0, // Inicializado en 0
    vuelto_pago_efectivo: 0, // Inicializado en 0
    cliente_id: getClienteId(),
  });

  const [errors, setErrors] = useState<{
    telefono: string;
    nombre: string;
    direccion: string;
    barrio: string;
    pagoEfectivo: string;
  }>({
    telefono: '',
    nombre: '',
    direccion: '',
    barrio: '',
    pagoEfectivo: ''
  });

  useEffect(() => {
    //console.log('Productos actuales:', pedido.productos);
    const fetchProductos = async () => {
      const response = await getProductoList(getClienteId());
      setProductos(response);
    };
    
    const fetchMedioPago = async () => {
      const response = await getMedioPagoList();
      setMedioPago(response);
    };

    const fetchTipoProductos = async () => {
      const data = await getTipoProductoList(getClienteId());
      setTipoProductos(data);
      if (data.length > 0) setActiveTipoProducto(data[0].id);
    };

    fetchMedioPago();
    fetchProductos();
    fetchTipoProductos();
  }, [pedido.productos]);

  // Función para validar todos los campos
  const validarCampos = () => {
    const newErrors = {
      telefono: '',
      nombre: '',
      direccion: '',
      barrio: '',
      pagoEfectivo: ''
    };

    let isValid = true;

    // 1. Validar Teléfono (siempre obligatorio)
    if (!pedido.cliente_telefono || pedido.cliente_telefono.trim() === '') {
      newErrors.telefono = 'El teléfono es obligatorio';
      isValid = false;
    }

    // 2. Validar Nombre, Dirección y Barrio (solo si teléfono != "1")
    if (pedido.cliente_telefono !== '1') {
      if (!pedido.cliente_nombre || pedido.cliente_nombre.trim() === '') {
        newErrors.nombre = 'El nombre es obligatorio';
        isValid = false;
      }
      if (!pedido.cliente_casa_nro || pedido.cliente_casa_nro.trim() === '') {
        newErrors.direccion = 'La dirección es obligatoria';
        isValid = false;
      }
      if (!pedido.cliente_barrio || pedido.cliente_barrio.trim() === '') {
        newErrors.barrio = 'El barrio es obligatorio';
        isValid = false;
      }
    }

    // 3. Validar Productos (ya existe lógica, la integramos)
    if (pedido.productos.length === 0) {
      setErrorProducto(true);
      isValid = false;
    } else {
      setErrorProducto(false);
    }

    // 4. Validar Medio de Pago (ya existe lógica, la integramos)
    if (!pedido.medio_pago_id) {
      setErrorMedioPago(true);
      isValid = false;
    } else {
      setErrorMedioPago(false);
    }

    // 5. Validar Pago en Efectivo
    if (isEfectivoSelected() && pedido.paga_efectivo < pedido.monto_total) {
      newErrors.pagoEfectivo = `El monto pagado ($${pedido.paga_efectivo}) debe ser mayor o igual al total ($${pedido.monto_total.toFixed(2)})`;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAgregarProducto = () => {
    setPedido({
      ...pedido,
      productos: [...pedido.productos, { 
        producto_id: '', 
        cantidad: 1,
        cantidad_mitad: 0, // Inicializar en 0
        precio_unitario: 0 ,
        observaciones: '',// Inicializar como string vacío
        monto_adicional: 0,
      }],
    });
  };

  const handleProductoChange = (index: number, field: keyof ProductoPedido, value: any) => {
    setPedido(prev => {
      const productosActualizados = prev.productos.map((prod, i) => {
        if (i === index) {
          // Asegurar que siempre tenga cantidad_mitad
          const baseProduct = {
            ...prod,
            cantidad_mitad: prod.cantidad_mitad ?? 0,
            observaciones: prod.observaciones ?? '' ,// Nuevo campo
            monto_adicional: prod.monto_adicional ?? 0,
          };
  
          const updatedProduct = {
            ...baseProduct,
            [field]: field === 'cantidad_mitad' ? Math.min(Math.max(Number(value) || 0, 0), 1) : 
                  field === 'observaciones' ? value : // Manejar el nuevo campo
                  field === 'monto_adicional' ? value : // Manejar el nuevo campo
                  value
          };
  
          if (field === 'producto_id') {
            const selectedProduct = productos.find(p => p.id == value);
            if (selectedProduct) {
              updatedProduct.precio_unitario = selectedProduct.precio_unitario;
              updatedProduct.cantidad_mitad = 0; // Reset al cambiar producto
              updatedProduct.monto_adicional = 0;
            }
          }
  
          return updatedProduct;
        }
        return { ...prod, cantidad_mitad: prod.cantidad_mitad ?? 0, monto_adicional: prod.monto_adicional ?? 0 };
      });
  
      return {
        ...prev,
        productos: productosActualizados,
        monto_total: calcularMontoTotal(productosActualizados),
      };
    });
  };

  const calcularMontoTotal = (productos: ProductoPedido[]): number => {
    return productos.reduce((total, prod) => total + calcularSubtotalProducto(prod), 0);
  };

  const calcularSubtotalProducto = (prod: ProductoPedido): number => {
    const productoInfo = productos.find((p) => p.id === prod.producto_id);
    const precioCompleto = prod.precio_unitario * prod.cantidad + prod.monto_adicional;
    
    if (productoInfo?.permite_mitad && prod.cantidad_mitad > 0) {
      const precioMitad = (prod.precio_unitario / 2) * prod.cantidad_mitad;
      return precioCompleto + precioMitad;
    }
    
    return precioCompleto;
  };

  const handleEliminarProducto = (index: number) => {
    const productosActualizados = pedido.productos.filter((_, i) => i !== index);
    setPedido({
      ...pedido,
      productos: productosActualizados,
      monto_total: calcularMontoTotal(productosActualizados),
    });
  };

  const handleMedioPagoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const medioPagoId = parseInt(e.target.value);
    const medioPagoSeleccionado = medioPago.find(mp => mp.id === medioPagoId);
    const esEfectivo = medioPagoSeleccionado?.codigo === 'EFE';
    
    setPedido({
      ...pedido,
      medio_pago_id: medioPagoId,
      paga_efectivo: esEfectivo ? pedido.paga_efectivo : 0,
      vuelto_pago_efectivo: esEfectivo ? pedido.vuelto_pago_efectivo : 0
    });
    setErrorMedioPago(false); 
  };

  const handlePagaEfectivoChange = (value: number) => {
    const pagaEfectivo = Math.max(0, value);
    const vuelto = Math.max(0, pagaEfectivo - pedido.monto_total);
    
    setPedido({
      ...pedido,
      paga_efectivo: pagaEfectivo,
      vuelto_pago_efectivo: vuelto
    });
  };
  
  // Función para verificar si el medio de pago seleccionado es efectivo
  const isEfectivoSelected = () => {
    const medioPagoSeleccionado = medioPago.find(mp => mp.id === pedido.medio_pago_id);
    return medioPagoSeleccionado?.codigo === 'EFE';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Realizar todas las validaciones
    if (!validarCampos()) {
      return;
    }
    if (!pedido.medio_pago_id) {
      setErrorMedioPago(true);
      notifyError('Debe seleccionar un medio de pago.');
      return;
    }
    
    if (pedido.productos.length === 0) {
      setErrorProducto(true);
      notifyError('Debe seleccionar al menos un producto.');
      return;
    }
    
    

    try {
      const response = await crearPedido(pedido);
      if (response.status === 'OK') {
        notifySuccess('Pedido agregado correctamente');
        onClose();
      } else {
        notifyError('Error al agregar pedido');
      }
    } catch (error) {
      console.error('Error al agregar pedido:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold mb-4">Nuevo Pedido</h2>

    {/* Teléfono Cliente */}
    <div className="mb-4">
      <label className="block text-gray-700">Teléfono Cliente(*)</label>
      <input
        type="text"
        className={`w-full border px-3 py-2 rounded ${errors.telefono ? 'border-red-500' : ''}`}
        value={pedido.cliente_telefono || ''}
        onChange={(e) => {
          setPedido({ ...pedido, cliente_telefono: e.target.value });
          // Limpiar error cuando el usuario empiece a escribir
          if (errors.telefono) {
            setErrors({ ...errors, telefono: '' });
          }
        }}
        onBlur={async () => {
          if (pedido.cliente_telefono === '1') {
            setPedido((prev) => ({
              ...prev,
              cliente_nombre: 'mostrador',
              cliente_casa_nro: 'mostrador',
              cliente_barrio: 'mostrador',
            }));
          } else if (pedido.cliente_telefono) {
            try {
              const cliente = await getClienteByTelefono(pedido.cliente_telefono);
              if (cliente && cliente.telefono) {
                setPedido((prev) => ({
                  ...prev,
                  cliente_telefono: cliente.telefono ,
                  cliente_nombre: cliente.nombre || '',
                  cliente_casa_nro: cliente.casa_nro || '',
                  cliente_barrio: cliente.barrio || '',
                  user_cliente_id :  cliente.id
                }));
                const clienteData = await getClienteEstadistica(cliente.id);
                setClienteDataEstadistica( clienteData);
              }else{
                console.warn('Cliente no encontrado, no se sobreescriben los datos.');
              }
            } catch (error) {
              console.warn('Cliente no encontrado:', error);
              // Si quieres limpiar los datos si no se encuentra, puedes hacerlo aquí
            }
          }
          if (!pedido.cliente_telefono || pedido.cliente_telefono.trim() === '') {
            setErrors({ ...errors, telefono: 'El teléfono es obligatorio' });
          }
        }}
      />
       {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
    </div>


      {/* Nombre Cliente */}
      <div className="mb-4">
        <label className="block text-gray-700"> Nombre Cliente {pedido.cliente_telefono !== '1' ? '*' : ''}</label>
        <input
          type="text"
          className={`w-full border px-3 py-2 rounded ${errors.nombre ? 'border-red-500' : ''}`}
          value={pedido.cliente_nombre}
          onChange={(e) => {
            setPedido({ ...pedido, cliente_nombre: e.target.value });
            if (errors.nombre) setErrors({ ...errors, nombre: '' });
          }}
          // Validar onBlur solo si es obligatorio
          onBlur={() => {
            if (pedido.cliente_telefono !== '1' && (!pedido.cliente_nombre || pedido.cliente_nombre.trim() === '')) {
              setErrors({ ...errors, nombre: 'El nombre es obligatorio' });
            }
          }}
        />
        {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
      </div>
     
        
     
       {/* casa Cliente */}
       <div className="mb-4">
        <label className="block text-gray-700">Direccion/Casa nro {pedido.cliente_telefono !== '1' ? '*' : ''}</label>
        <input
          type="text"
          className={`w-full border px-3 py-2 rounded ${errors.direccion ? 'border-red-500' : ''}`}
          value={pedido.cliente_casa_nro || ''}
          onChange={(e) => {
            setPedido({ ...pedido, cliente_casa_nro: e.target.value });
            if (errors.direccion) setErrors({ ...errors, direccion: '' });
          }}
          onBlur={() => {
            if (pedido.cliente_telefono !== '1' && (!pedido.cliente_casa_nro || pedido.cliente_casa_nro.trim() === '')) {
              setErrors({ ...errors, direccion: 'La dirección es obligatoria' });
            }
          }}
        />
        {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>}
      </div>

       {/* barrio Cliente */}
       <div className="mb-4">
        <label className="block text-gray-700">Barrio {pedido.cliente_telefono !== '1' ? '*' : ''}</label>
        <input
          type="text"
          className={`w-full border px-3 py-2 rounded ${errors.barrio ? 'border-red-500' : ''}`}
          value={pedido.cliente_barrio || ''}
          onChange={(e) => {
            setPedido({ ...pedido, cliente_barrio: e.target.value });
            if (errors.barrio) setErrors({ ...errors, barrio: '' });
          }}
          onBlur={() => {
            if (pedido.cliente_telefono !== '1' && (!pedido.cliente_barrio || pedido.cliente_barrio.trim() === '')) {
              setErrors({ ...errors, barrio: 'El barrio es obligatorio' });
            }
          }}
        />
        {errors.barrio && <p className="text-red-500 text-sm mt-1">{errors.barrio}</p>}
      </div>

       {/* observacion Cliente */}
       <div className="mb-4">
        <label className="block text-gray-700">Observacion (Opcional)</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          value={pedido.pedido_obs || ''}
          onChange={(e) => setPedido({ ...pedido, pedido_obs: e.target.value })}
        />
      </div>
      {clienteDataEstadistica.cantidad_pedidos > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">Historial del Cliente</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Total de pedidos */}
              <div className="text-center p-2 bg-white rounded shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{clienteDataEstadistica.cantidad_pedidos}</div>
                <div className="text-xs text-blue-500">Pedidos totales</div>
              </div>

              {/* Total gastado */}
              <div className="text-center p-2 bg-white rounded shadow-sm">
                <div className="text-xl font-bold text-green-600">
                  ${clienteDataEstadistica.total_gastado.toFixed(2)}
                </div>
                <div className="text-xs text-green-500">Total gastado</div>
              </div>

              {/* Última compra */}
              <div className="text-center p-2 bg-white rounded shadow-sm">
                <div className="text-sm font-semibold text-gray-700">
                  {clienteDataEstadistica.ultima_compra ? 
                    new Date(clienteDataEstadistica.ultima_compra).toLocaleDateString() : 
                    'Nunca'
                  }
                </div>
                <div className="text-xs text-gray-500">Última compra</div>
              </div>

              {/* Medio de pago favorito */}
              {clienteDataEstadistica.top_medio_pago && (
                <div className="text-center p-2 bg-white rounded shadow-sm">
                  <div className="text-sm font-semibold text-purple-600">
                    {clienteDataEstadistica.top_medio_pago.medio_pago_descripcion}
                  </div>
                  <div className="text-xs text-purple-500">Medio favorito</div>
                </div>
              )}
            </div>

            {/* Productos más comprados */}
            {clienteDataEstadistica.top_3_productos.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-blue-700 mb-2">Productos frecuentes:</h4>
                <div className="flex flex-wrap gap-2">
                  {clienteDataEstadistica.top_3_productos.map((producto, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {producto.producto_nombre} ({producto.cantidad_total} und)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
     {/* Tabs por tipo de producto */}
  <div className="mb-4">
    <label className="block text-gray-700 mb-2">Productos por Categoría</label>

    {/* Solapas */}
    <div className="flex space-x-2 mb-4 border-b border-gray-200">
      {tipoProductos.map((tipo) => (
        <button
          key={tipo.id}
          type="button"
          onClick={() => setActiveTipoProducto(tipo.id)}
          className={`px-4 py-2 rounded-t-md ${
            activeTipoProducto === tipo.id
              ? 'bg-blue-500 text-white font-semibold'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {tipo.nombre}
        </button>
      ))}
    </div>

        {/* Selector dinámico de productos */}
        <select
          className="w-full border px-3 py-2 rounded mb-4"
          value=""
          onChange={(e) => {
            const selectedId = parseInt(e.target.value);
            const selectedProduct = productos.find((p) => p.id === selectedId);
            if (selectedProduct) {
              const nuevosProductos = [
                ...pedido.productos,
                {
                  producto_id: selectedProduct.id,
                  cantidad: 1,
                  cantidad_mitad: 0,
                  precio_unitario: selectedProduct.precio_unitario,
                  observaciones: '',
                  monto_adicional: selectedProduct.monto_adicional || 0 // Asegura que sea 0 si es undefined
                },
              ];
              setPedido((prev) => ({
                ...prev,
                productos: nuevosProductos,
                monto_total: calcularMontoTotal(nuevosProductos),
              }));
            }
          }}
        >
          <option value="">Seleccione un producto</option>
          {productos
            .filter((p) => p.tipo_producto_id === activeTipoProducto)
            .map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre}
              </option>
            ))}
        </select>

        {/* Lista de productos agregados */}
        {pedido.productos.map((prod, index) => {
          const productoInfo = productos.find((p) => p.id === prod.producto_id);
          const permiteMitad = productoInfo?.permite_mitad;
          return (
            <div key={index} className="flex flex-col mb-3 p-2 border rounded bg-gray-50">
              {/* Información del producto */}
              <div className="flex items-center mb-2">
                <span className="w-full px-2 py-1 text-sm font-medium">
                  {productoInfo?.nombre || 'Producto'}
                </span>
                
                <button
                  type="button"
                  onClick={() => handleEliminarProducto(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded ml-2 hover:bg-red-600 text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Controles de cantidad */}
            <div className="flex items-center space-x-3">
              {/* Unidades completas */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1 text-center">Unidades</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleProductoChange(index, 'cantidad', Math.max(0, (prod.cantidad || 0) - 1))}
                    className="bg-gray-500 hover:bg-red-400 w-6 h-6 flex items-center justify-center rounded-l"
                    disabled={prod.cantidad <= 0}
                  >
                    <span className="text-sm">−</span>
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={prod.cantidad}
                    onChange={(e) => handleProductoChange(index, 'cantidad', parseInt(e.target.value) || 0)}
                    className="border-y px-1 py-0.5 w-10 text-center text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleProductoChange(index, 'cantidad', (prod.cantidad || 0) + 1)}
                    className="bg-gray-500 hover:bg-green-400 w-6 h-6 flex items-center justify-center rounded-r"
                  >
                    <span className="text-sm">+</span>
                  </button>
                </div>
              </div>

                {/* Medias unidades (solo si el producto lo permite) */}
                {permiteMitad && (
                  <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1 text-center">Medias</label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handleProductoChange(index, 'cantidad_mitad', Math.max(0, (prod.cantidad_mitad || 0) - 1))}
                      className="bg-gray-500 hover:bg-red-400 w-6 h-6 flex items-center justify-center rounded-l"
                      disabled={prod.cantidad_mitad <= 0}
                    >
                      <span className="text-sm">−</span>
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      value={prod.cantidad_mitad ?? 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const clampedValue = Math.min(Math.max(value, 0), 1);
                        handleProductoChange(index, 'cantidad_mitad', clampedValue);
                      }}
                      className="border-y px-1 py-0.5 w-10 text-center text-sm bg-yellow-50"
                    />
                    <button
                      type="button"
                      onClick={() => handleProductoChange(index, 'cantidad_mitad', Math.min(1, (prod.cantidad_mitad || 0) + 1))}
                      className="bg-gray-500 hover:bg-green-400 w-6 h-6 flex items-center justify-center rounded-r"
                      disabled={prod.cantidad_mitad >= 1}
                    >
                      <span className="text-sm">+</span>
                    </button>
                  </div>
                </div>
                )}

                {/* Precio unitario */}
                <div className="flex flex-col ml-auto">
                  <label className="text-xs text-gray-600 mb-1">Precio</label>
                  <span className="border px-2 py-1 rounded w-20 bg-gray-100 text-center text-sm">
                    ${prod.precio_unitario}
                  </span>
                </div>
                {/* monto adicioal */}
                <div className="flex flex-col ml-auto">
                  <label className="text-xs text-gray-600 mb-1">Monto Adicional</label>
                  <input
                    type="number"
                    value={prod.monto_adicional}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Permite valores vacíos temporalmente
                      if (value === '') {
                        handleProductoChange(index, 'monto_adicional', 0);
                      } else {
                        handleProductoChange(index, 'monto_adicional', parseFloat(value) || 0);
                      }
                    }}
                    onFocus={(e) => {
                      // Cuando se enfoca, si el valor es 0, lo limpia
                      if (e.target.value === '0') {
                        e.target.value = '';
                      }
                    }}
                    onBlur={(e) => {
                      // Cuando pierde el foco, si está vacío, vuelve a 0
                      if (e.target.value === '') {
                        handleProductoChange(index, 'monto_adicional', 0);
                      }
                    }}
                    className="border-y px-1 py-0.5 w-20 text-left text-sm"
                  />
                  
                </div>
                {/* Campo de Observaciones para el producto - NUEVO */}
                <div className="mt-3">
                  <label className="block text-xs text-gray-600 mb-1">Observaciones (Opcional)</label>
                  <textarea
                    rows={2}
                    placeholder="Ej: Pizza sin mucho queso, bien cocida, etc."
                    value={prod.observaciones || ''}
                    onChange={(e) => handleProductoChange(index, 'observaciones', e.target.value)}
                    className="w-full border px-2 py-1 rounded text-sm resize-y"
                  />
                </div>

                {/* Subtotal del producto */}
                <div className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">Subtotal</label>
                  <span className="border px-2 py-1 rounded w-20 bg-blue-50 text-center text-sm font-semibold">
                    ${calcularSubtotalProducto(prod).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Indicador visual de media unidad */}
              {permiteMitad && prod.cantidad_mitad > 0 && (
                <div className="mt-1 text-xs text-green-600 font-semibold">
                  ✓ Incluye media unidad
                </div>
              )}
            </div>
          );
        })}

        {/* Validación */}
        {errorProducto && (
          <p className="text-red-500 text-sm mt-2">
            Por favor, seleccione al menos un producto y su cantidad.
          </p>
        )}
      </div>

      {/* Medio de Pago */}
      <div className="mb-4">
        <label className="block text-gray-700">Medio de Pago</label>
        <div className="flex flex-wrap gap-4 mt-2">
          {medioPago.map((mp) => (
            <label key={mp.id} className="flex items-center">
              <input
                type="radio"
                name="medio_pago"
                value={mp.id}
                checked={pedido.medio_pago_id === mp.id}
                onChange={handleMedioPagoChange}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-gray-700 font-semibold text-xs">{mp.descripcion}</span>
            </label>
          ))}
          {errorMedioPago && (
          <p className="text-red-500 text-sm mt-2">Por favor, seleccione un medio de pago.</p>
        )}
        </div>
      </div>

      {/* Campos para pago en efectivo (solo visible cuando se selecciona Efectivo) */}
      {isEfectivoSelected() && (
        <div className="mb-4 p-4 border rounded-lg bg-yellow-50">
          <h3 className="font-semibold text-gray-700 mb-3">Pago en Efectivo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monto que paga el cliente */}
            <div>
              <label className="block text-gray-700 mb-1">Monto que paga el cliente</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={pedido.paga_efectivo}
                onChange={(e) => handlePagaEfectivoChange(parseFloat(e.target.value) || 0)}
                className="w-full border px-3 py-2 rounded"
                placeholder="0.00"
              />
            </div>

            {/* Vuelto (no editable, resaltado) */}
            <div>
              <label className="block text-gray-700 mb-1">Vuelto a entregar</label>
              <input
                type="number"
                value={pedido.vuelto_pago_efectivo}
                readOnly
                className="w-full border px-3 py-2 rounded bg-green-100 font-bold text-green-800"
              />
              <p className="text-xs text-gray-500 mt-1">
                Total: ${pedido.monto_total.toFixed(2)} | Paga: ${pedido.paga_efectivo.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Mensaje de validación */}
          {pedido.paga_efectivo < pedido.monto_total && (
            <p className="text-red-500 text-sm mt-2">
              El monto pagado es menor al total. Faltan ${(pedido.monto_total - pedido.paga_efectivo).toFixed(2)}
            </p>
          )}
        </div>
      )}  

      

      {/* Precio Total */}
      <div className="mb-4">
        <label className="block text-gray-700">Total</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded bg-gray-100"
          value={pedido.monto_total}
          readOnly
        />
      </div>

      {/* Botones */}
      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
        >
          Finalizar Pedido
        </button>
        <button
          type="button"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default PedidoForm;
