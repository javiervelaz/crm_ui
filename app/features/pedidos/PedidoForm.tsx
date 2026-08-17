'use client';

import { logError } from '@/app/lib/logger';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { crearPedido } from '@/app/lib/operaciones.api';
import { useState } from 'react';
import DatosCliente from './DatosCliente';
import HistorialCliente from './HistorialCliente';
import SelectorMedioPago from './SelectorMedioPago';
import SelectorProductos from './SelectorProductos';
import { ModoPedido } from './types';
import { useCarritoPedido } from './useCarritoPedido';

interface Props {
  onClose: () => void;
  registroDiario: number;
  usuario_id: number;
  /**
   * Unica diferencia real entre las dos copias que existian:
   *   'caja'     -> cajero con permisos completos
   *   'empleado' -> toma pedidos, sin acciones de caja
   * Hoy no cambia nada del formulario. Es el punto de extension para cuando
   * haga falta (descuentos, anulacion), en vez de volver a duplicar el archivo.
   */
  modo?: ModoPedido;
}

export default function PedidoForm({
  onClose, registroDiario, usuario_id, modo = 'empleado',
}: Props) {
  const c = useCarritoPedido(registroDiario, usuario_id);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return; // [FIX] el original permitia doble submit
    if (!c.validar()) return;

    setEnviando(true);
    try {
      const response = await crearPedido(c.pedido);
      if (response?.status === 'OK') {
        notifySuccess('Pedido agregado correctamente');
        onClose();
      } else {
        notifyError('Error al agregar pedido');
      }
    } catch (error) {
      logError('Error al agregar pedido', error);
      notifyError('No se pudo agregar el pedido. Reintentá.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="font-display text-xl font-bold text-brand-800">Nuevo pedido</h2>

      <DatosCliente
        pedido={c.pedido}
        errors={c.errors}
        setCampo={c.setCampo}
        limpiarError={c.limpiarError}
        setErrors={c.setErrors}
        onBlurTelefono={c.buscarClientePorTelefono}
      />

      <HistorialCliente data={c.estadistica} />

      <SelectorProductos
        tipoProductos={c.tipoProductos}
        productos={c.productos}
        activeTipoProducto={c.activeTipoProducto}
        setActiveTipoProducto={c.setActiveTipoProducto}
        lineas={c.pedido.productos}
        error={c.errorProducto}
        productoPorId={c.productoPorId}
        subtotal={c.subtotal}
        onAgregar={c.agregarProducto}
        onCambiar={c.cambiarLinea}
        onEliminar={c.eliminarLinea}
      />

      <SelectorMedioPago
        medioPago={c.medioPago}
        pedido={c.pedido}
        error={c.errorMedioPago}
        esEfectivo={c.esEfectivo}
        onCambiar={c.cambiarMedioPago}
        onPagaEfectivo={c.cambiarPagaEfectivo}
      />

      {/* Barra de total y acciones, pegada abajo en pantallas chicas */}
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-brand-200 bg-white px-4 py-3 md:mx-0 md:rounded-lg md:border">
        <div className="mr-auto">
          <span className="block text-xs text-brand-300">Total</span>
          <span className="font-display text-2xl font-bold text-brand-800">
            {'$' + c.pedido.monto_total.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] rounded-lg border border-brand-200 bg-white px-5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className="min-h-[44px] rounded-lg bg-brand-600 px-6 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-700"
        >
          {enviando ? 'Guardando...' : 'Finalizar pedido'}
        </button>
      </div>
    </form>
  );
}
