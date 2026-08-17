'use client';

import { ErroresPedido, PedidoState, TELEFONO_MOSTRADOR } from './types';

interface Props {
  pedido: PedidoState;
  errors: ErroresPedido;
  setCampo: (campo: keyof PedidoState, valor: any) => void;
  limpiarError: (campo: keyof ErroresPedido) => void;
  setErrors: React.Dispatch<React.SetStateAction<ErroresPedido>>;
  onBlurTelefono: () => void;
}

const input = (hayError: string) =>
  'w-full rounded-lg border px-3 py-2.5 text-base outline-none transition-colors ' +
  (hayError ? 'border-red-500' : 'border-brand-200 focus:border-brand-600');

export default function DatosCliente({
  pedido, errors, setCampo, limpiarError, setErrors, onBlurTelefono,
}: Props) {
  const esMostrador = pedido.cliente_telefono === TELEFONO_MOSTRADOR;
  const req = esMostrador ? '' : '*';

  const validarSiVacio = (campo: keyof ErroresPedido, valor: string, mensaje: string) => {
    if (!esMostrador && !valor?.trim()) setErrors((prev) => ({ ...prev, [campo]: mensaje }));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm text-brand-700">Telefono cliente *</label>
        <input
          type="tel"
          inputMode="numeric"
          className={input(errors.telefono)}
          value={pedido.cliente_telefono || ''}
          onChange={(e) => { setCampo('cliente_telefono', e.target.value); limpiarError('telefono'); }}
          onBlur={onBlurTelefono}
        />
        {errors.telefono && <p className="mt-1 text-sm text-red-500">{errors.telefono}</p>}
        <p className="mt-1 text-xs text-brand-300">Escribi 1 para venta de mostrador.</p>
      </div>

      <div>
        <label className="mb-1 block text-sm text-brand-700">Nombre cliente {req}</label>
        <input
          type="text"
          className={input(errors.nombre)}
          value={pedido.cliente_nombre}
          onChange={(e) => { setCampo('cliente_nombre', e.target.value); limpiarError('nombre'); }}
          onBlur={() => validarSiVacio('nombre', pedido.cliente_nombre, 'El nombre es obligatorio')}
        />
        {errors.nombre && <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm text-brand-700">Direccion / Casa nro {req}</label>
        <input
          type="text"
          className={input(errors.direccion)}
          value={pedido.cliente_casa_nro || ''}
          onChange={(e) => { setCampo('cliente_casa_nro', e.target.value); limpiarError('direccion'); }}
          onBlur={() => validarSiVacio('direccion', pedido.cliente_casa_nro, 'La direccion es obligatoria')}
        />
        {errors.direccion && <p className="mt-1 text-sm text-red-500">{errors.direccion}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm text-brand-700">Barrio {req}</label>
        <input
          type="text"
          className={input(errors.barrio)}
          value={pedido.cliente_barrio || ''}
          onChange={(e) => { setCampo('cliente_barrio', e.target.value); limpiarError('barrio'); }}
          onBlur={() => validarSiVacio('barrio', pedido.cliente_barrio, 'El barrio es obligatorio')}
        />
        {errors.barrio && <p className="mt-1 text-sm text-red-500">{errors.barrio}</p>}
      </div>

      <div className="md:col-span-2">
        <label className="mb-1 block text-sm text-brand-700">Observacion del pedido (opcional)</label>
        <input
          type="text"
          className={input('')}
          value={pedido.pedido_obs || ''}
          onChange={(e) => setCampo('pedido_obs', e.target.value)}
        />
      </div>
    </div>
  );
}
