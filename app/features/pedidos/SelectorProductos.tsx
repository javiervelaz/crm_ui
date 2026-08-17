'use client';

import LineaProducto from './LineaProducto';
import { Producto, ProductoPedido, TipoProducto } from './types';

interface Props {
  tipoProductos: TipoProducto[];
  productos: Producto[];
  activeTipoProducto: number | null;
  setActiveTipoProducto: (id: number) => void;
  lineas: ProductoPedido[];
  error: boolean;
  productoPorId: (id: string | number) => Producto | undefined;
  subtotal: (linea: ProductoPedido) => number;
  onAgregar: (productoId: number) => void;
  onCambiar: (index: number, field: keyof ProductoPedido, value: any) => void;
  onEliminar: (index: number) => void;
}

export default function SelectorProductos({
  tipoProductos, productos, activeTipoProducto, setActiveTipoProducto,
  lineas, error, productoPorId, subtotal, onAgregar, onCambiar, onEliminar,
}: Props) {
  const delTipo = productos.filter((p) => p.tipo_producto_id === activeTipoProducto);

  return (
    <div>
      <label className="mb-2 block text-sm text-brand-700">Productos</label>

      <div className="mb-4 flex flex-wrap gap-2 border-b border-brand-200 pb-px">
        {tipoProductos.map((tipo) => (
          <button
            key={tipo.id}
            type="button"
            onClick={() => setActiveTipoProducto(tipo.id)}
            className={
              'min-h-[44px] rounded-t-lg px-4 py-2 transition-colors ' +
              (activeTipoProducto === tipo.id
                ? 'bg-brand-600 font-semibold text-white'
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100')
            }
          >
            {tipo.nombre}
          </button>
        ))}
      </div>

      {/*
        Grilla tactil en vez del select del original: en tablet el cajero toca
        el producto directo, sin abrir un desplegable nativo. Debajo de md sigue
        habiendo una grilla, solo que de 2 columnas.
      */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {delTipo.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onAgregar(p.id)}
            className="flex min-h-[64px] flex-col items-start justify-between rounded-lg border border-brand-200 bg-white p-3 text-left transition-colors hover:border-brand-600 hover:bg-brand-50"
          >
            <span className="text-sm font-medium leading-tight text-brand-800">{p.nombre}</span>
            <span className="mt-1 text-sm text-brand-300">{'$' + p.precio_unitario}</span>
          </button>
        ))}
        {delTipo.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-brand-300">
            No hay productos en esta categoria.
          </p>
        )}
      </div>

      <div className="space-y-3">
        {lineas.map((linea, index) => (
          <LineaProducto
            key={index}
            linea={linea}
            index={index}
            info={productoPorId(linea.producto_id)}
            subtotal={subtotal(linea)}
            onCambiar={onCambiar}
            onEliminar={onEliminar}
          />
        ))}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">
          Por favor, seleccioná al menos un producto y su cantidad.
        </p>
      )}
    </div>
  );
}
