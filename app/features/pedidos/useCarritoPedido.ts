'use client';

import { getClienteId } from '@/app/lib/authService';
import { logError } from '@/app/lib/logger';
import { getMedioPagoList } from '@/app/lib/mediopago.api';
import { getProductoList } from '@/app/lib/producto.api';
import { getClienteByTelefono } from '@/app/lib/profile.api';
import { getTipoProductoList } from '@/app/lib/tipoproducto.api';
import { getClienteEstadistica } from '@/app/lib/usuario.api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ClienteEstadistica,
  ERRORES_VACIOS,
  ESTADISTICA_VACIA,
  ErroresPedido,
  MedioPago,
  PedidoState,
  Producto,
  ProductoPedido,
  TELEFONO_MOSTRADOR,
  TipoProducto,
  pedidoInicial,
} from './types';

/**
 * Toda la logica del carrito del POS. Sale de PedidoForm (889 lineas) sin
 * cambios de comportamiento, salvo tres correcciones marcadas con [FIX].
 */
export function useCarritoPedido(registroDiario: number, usuarioId: number) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [medioPago, setMedioPago] = useState<MedioPago[]>([]);
  const [tipoProductos, setTipoProductos] = useState<TipoProducto[]>([]);
  const [activeTipoProducto, setActiveTipoProducto] = useState<number | null>(null);
  const [estadistica, setEstadistica] = useState<ClienteEstadistica>(ESTADISTICA_VACIA);

  const [pedido, setPedido] = useState<PedidoState>(() =>
    pedidoInicial(registroDiario, usuarioId)
  );
  const [errors, setErrors] = useState<ErroresPedido>(ERRORES_VACIOS);
  const [errorMedioPago, setErrorMedioPago] = useState(false);
  const [errorProducto, setErrorProducto] = useState(false);

  // [FIX] El original tenia useEffect(..., [pedido.productos]) -> volvia a pedir
  // productos, tipos y medios de pago en CADA cambio del carrito. En una tablet
  // con conexion lenta eso son 3 requests por cada "+" que toca el cajero.
  useEffect(() => {
    const cliente = getClienteId();
    (async () => {
      try {
        const [prods, medios, tipos] = await Promise.all([
          getProductoList(cliente),
          getMedioPagoList(),
          getTipoProductoList(cliente),
        ]);
        setProductos(prods ?? []);
        setMedioPago(medios ?? []);
        setTipoProductos(tipos ?? []);
        if (tipos?.length) setActiveTipoProducto(tipos[0].id);
      } catch (error) {
        logError('Error cargando catalogo del pedido', error);
      }
    })();
  }, []);

  // [FIX] El original comparaba con === contra un producto_id que puede venir
  // como string desde la linea vacia. Coercion explicita.
  const productoPorId = useCallback(
    (id: string | number) => productos.find((p) => Number(p.id) === Number(id)),
    [productos]
  );

  const subtotal = useCallback(
    (linea: ProductoPedido): number => {
      const info = productoPorId(linea.producto_id);
      const completo = linea.precio_unitario * linea.cantidad + linea.monto_adicional;
      if (info?.permite_mitad && linea.cantidad_mitad > 0) {
        return completo + (linea.precio_unitario / 2) * linea.cantidad_mitad;
      }
      return completo;
    },
    [productoPorId]
  );

  const total = useCallback(
    (lineas: ProductoPedido[]) => lineas.reduce((acc, l) => acc + subtotal(l), 0),
    [subtotal]
  );

  const esEfectivo = useMemo(
    () => medioPago.find((mp) => mp.id === pedido.medio_pago_id)?.codigo === 'EFE',
    [medioPago, pedido.medio_pago_id]
  );

  const agregarProducto = useCallback(
    (productoId: number) => {
      const p = productoPorId(productoId);
      if (!p) return;
      setPedido((prev) => {
        const lineas = [
          ...prev.productos,
          {
            producto_id: p.id,
            cantidad: 1,
            cantidad_mitad: 0,
            precio_unitario: p.precio_unitario,
            observaciones: '',
            monto_adicional: p.monto_adicional || 0,
          },
        ];
        return { ...prev, productos: lineas, monto_total: total(lineas) };
      });
      setErrorProducto(false);
    },
    [productoPorId, total]
  );

  const cambiarLinea = useCallback(
    (index: number, field: keyof ProductoPedido, value: any) => {
      setPedido((prev) => {
        const lineas = prev.productos.map((linea, i) => {
          const base = {
            ...linea,
            cantidad_mitad: linea.cantidad_mitad ?? 0,
            observaciones: linea.observaciones ?? '',
            monto_adicional: linea.monto_adicional ?? 0,
          };
          if (i !== index) return base;

          const actualizada = {
            ...base,
            [field]:
              field === 'cantidad_mitad'
                ? Math.min(Math.max(Number(value) || 0, 0), 1)
                : value,
          };

          if (field === 'producto_id') {
            const sel = productoPorId(value);
            if (sel) {
              actualizada.precio_unitario = sel.precio_unitario;
              actualizada.cantidad_mitad = 0;
              actualizada.monto_adicional = 0;
            }
          }
          return actualizada;
        });
        return { ...prev, productos: lineas, monto_total: total(lineas) };
      });
    },
    [productoPorId, total]
  );

  const eliminarLinea = useCallback(
    (index: number) => {
      setPedido((prev) => {
        const lineas = prev.productos.filter((_, i) => i !== index);
        return { ...prev, productos: lineas, monto_total: total(lineas) };
      });
    },
    [total]
  );

  const cambiarMedioPago = useCallback(
    (medioPagoId: number) => {
      const seleccionado = medioPago.find((mp) => mp.id === medioPagoId);
      const efectivo = seleccionado?.codigo === 'EFE';
      setPedido((prev) => ({
        ...prev,
        medio_pago_id: medioPagoId,
        paga_efectivo: efectivo ? prev.paga_efectivo : 0,
        vuelto_pago_efectivo: efectivo ? prev.vuelto_pago_efectivo : 0,
      }));
      setErrorMedioPago(false);
    },
    [medioPago]
  );

  const cambiarPagaEfectivo = useCallback((valor: number) => {
    setPedido((prev) => {
      const paga = Math.max(0, valor);
      return {
        ...prev,
        paga_efectivo: paga,
        vuelto_pago_efectivo: Math.max(0, paga - prev.monto_total),
      };
    });
  }, []);

  /** Autocompleta cliente por telefono. '1' = venta de mostrador. */
  const buscarClientePorTelefono = useCallback(async () => {
    const tel = pedido.cliente_telefono;

    if (tel === TELEFONO_MOSTRADOR) {
      setPedido((prev) => ({
        ...prev,
        cliente_nombre: 'mostrador',
        cliente_casa_nro: 'mostrador',
        cliente_barrio: 'mostrador',
      }));
      return;
    }

    if (!tel || !tel.trim()) {
      setErrors((prev) => ({ ...prev, telefono: 'El telefono es obligatorio' }));
      return;
    }

    try {
      const cliente = await getClienteByTelefono(tel);
      if (!cliente?.telefono) return; // cliente nuevo: no pisamos lo tipeado
      setPedido((prev) => ({
        ...prev,
        cliente_telefono: cliente.telefono,
        cliente_nombre: cliente.nombre || '',
        cliente_casa_nro: cliente.casa_nro || '',
        cliente_barrio: cliente.barrio || '',
        user_cliente_id: cliente.id,
      }));
      setEstadistica(await getClienteEstadistica(cliente.id));
    } catch {
      // Cliente no encontrado: se carga como nuevo, sin ruido.
    }
  }, [pedido.cliente_telefono]);

  const validar = useCallback((): boolean => {
    const nuevos = { ...ERRORES_VACIOS };
    let ok = true;

    if (!pedido.cliente_telefono?.trim()) {
      nuevos.telefono = 'El telefono es obligatorio';
      ok = false;
    }

    if (pedido.cliente_telefono !== TELEFONO_MOSTRADOR) {
      if (!pedido.cliente_nombre?.trim()) { nuevos.nombre = 'El nombre es obligatorio'; ok = false; }
      if (!pedido.cliente_casa_nro?.trim()) { nuevos.direccion = 'La direccion es obligatoria'; ok = false; }
      if (!pedido.cliente_barrio?.trim()) { nuevos.barrio = 'El barrio es obligatorio'; ok = false; }
    }

    const sinProductos = pedido.productos.length === 0;
    setErrorProducto(sinProductos);
    if (sinProductos) ok = false;

    const sinMedioPago = !pedido.medio_pago_id;
    setErrorMedioPago(sinMedioPago);
    if (sinMedioPago) ok = false;

    if (esEfectivo && pedido.paga_efectivo < pedido.monto_total) {
      nuevos.pagoEfectivo =
        'El monto pagado ($' + pedido.paga_efectivo +
        ') debe ser mayor o igual al total ($' + pedido.monto_total.toFixed(2) + ')';
      ok = false;
    }

    setErrors(nuevos);
    return ok;
  }, [pedido, esEfectivo]);

  const setCampo = useCallback((campo: keyof PedidoState, valor: any) => {
    setPedido((prev) => ({ ...prev, [campo]: valor }));
  }, []);

  const limpiarError = useCallback((campo: keyof ErroresPedido) => {
    setErrors((prev) => (prev[campo] ? { ...prev, [campo]: '' } : prev));
  }, []);

  return {
    pedido, setCampo,
    productos, medioPago, tipoProductos,
    activeTipoProducto, setActiveTipoProducto,
    estadistica,
    errors, setErrors, limpiarError,
    errorMedioPago, errorProducto,
    esEfectivo,
    productoPorId, subtotal,
    agregarProducto, cambiarLinea, eliminarLinea,
    cambiarMedioPago, cambiarPagaEfectivo,
    buscarClientePorTelefono, validar,
  };
}
