'use client';

import { logError } from '@/app/lib/logger';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../CartContext';
import { useHandoffSession } from '../HandoffSessionContext';
import { crearPedidoDesdeMicrositio } from '../pedidoMicrositio.api';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { fetchMedioPagoList, MedioPago } from '../medioPagoApi';

interface CheckoutTicket {
  name: string;
  phone: string;
  address: string;
  deliveryType: 'delivery' | 'pickup';
  extraNotes: string;
  items: any[];
  total: number;
  deliveryCost: number;
  grandTotal: number;
  medioPagoDescripcion: string | null;
  pagaEfectivo: number;
  vuelto: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { session } = useHandoffSession();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [extraNotes, setExtraNotes] = useState('');
  const [medioPagoList, setMedioPagoList] = useState<MedioPago[]>([]);
  const [selectedMedioPagoId, setSelectedMedioPagoId] = useState<number | null>(null);
  const [pagaEfectivo, setPagaEfectivo] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<CheckoutTicket | null>(null);

  const deliveryCost = 1000; // demo
  const grandTotal = total + deliveryCost;

  useEffect(() => {
    let cancelled = false;
    if (!session) {
      notifyError('La sesión del link ya no es válida. Pedí un nuevo enlace por WhatsApp.');
      return;
    }
    setPhone(session?.userPhoneE164);

    async function loadMediosPago() {
      const data = await fetchMedioPagoList();
      if (!cancelled) {
        setMedioPagoList(data);
        const defaultMedio =
          data.find(
            (mp) =>
              (mp.codigo && mp.codigo.toUpperCase() === 'EFE') ||
              (mp.descripcion && mp.descripcion.toUpperCase().includes('EFECTIVO')),
          ) || data[0];

        if (defaultMedio) {
          setSelectedMedioPagoId(defaultMedio.id);
        }
      }
    }

    loadMediosPago();
    return () => { cancelled = true; };
  }, []);

  const isEfectivoSelected = useMemo(() => {
    if (!selectedMedioPagoId) return false;
    const mp = medioPagoList.find((m) => m.id === selectedMedioPagoId);
    if (!mp) return false;
    const codigo = (mp.codigo ?? '').toUpperCase();
    const desc = (mp.descripcion ?? '').toUpperCase();
    return codigo === 'EFE' || desc.includes('EFECTIVO');
  }, [medioPagoList, selectedMedioPagoId]);

  // Pantalla de ticket confirmado
  if (ticket) {
    return (
      <div className="flex w-full flex-col gap-4 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            ✓
          </span>
          <h1 className="text-lg font-bold text-brand-800">Pedido confirmado</h1>
        </div>

        <div className="space-y-3 rounded-2xl border border-brand-100 bg-white p-4 text-sm text-brand-800 shadow-card">
          <p className="font-semibold text-brand-800">
            ¡Gracias, {ticket.name || 'por tu pedido'}!
          </p>
          <p className="text-xs text-brand-300">
            Tu pedido fue registrado correctamente. El local va a gestionar tu
            pedido y se contactará si es necesario.
          </p>

          <div className="mt-2 space-y-2">
            <p className="text-xs font-semibold text-brand-700">Detalle de tu pedido</p>
            <ul className="space-y-1">
              {ticket.items.map((it: any) => (
                <li key={it.product.id} className="flex justify-between text-xs">
                  <span>
                    {it.quantity}x {it.product.name}
                    {it.notes && (
                      <span className="block text-[10px] text-brand-300">
                        Nota: {it.notes}
                      </span>
                    )}
                  </span>
                  <span>
                    ${(it.quantity * it.product.price).toLocaleString('es-AR')}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-2 flex justify-between border-t border-brand-100 pt-2 text-xs text-brand-300">
              <span>Subtotal</span>
              <span>${ticket.total.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between text-xs text-brand-300">
              <span>Delivery (demo)</span>
              <span>${ticket.deliveryCost.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-bold text-brand-800">
              <span>Total</span>
              <span>${ticket.grandTotal.toLocaleString('es-AR')}</span>
            </div>
          </div>

          <div className="mt-3 space-y-1 text-xs">
            <p className="font-semibold text-brand-700">Datos de contacto y entrega</p>
            <p><span className="font-medium">Nombre: </span>{ticket.name}</p>
            <p><span className="font-medium">Teléfono: </span>{ticket.phone}</p>
            <p>
              <span className="font-medium">Entrega: </span>
              {ticket.deliveryType === 'delivery' ? 'Delivery a domicilio' : 'Retiro en local'}
            </p>
            {ticket.deliveryType === 'delivery' && (
              <p><span className="font-medium">Dirección: </span>{ticket.address}</p>
            )}
            {ticket.extraNotes && (
              <p><span className="font-medium">Comentarios: </span>{ticket.extraNotes}</p>
            )}
          </div>

          <div className="mt-3 space-y-1 text-xs">
            <p className="font-semibold text-brand-700">Medio de pago</p>
            <p>{ticket.medioPagoDescripcion ?? 'No informado'}</p>
            {ticket.pagaEfectivo > 0 && (
              <>
                <p><span className="font-medium">Paga con: </span>${ticket.pagaEfectivo.toFixed(2)}</p>
                <p><span className="font-medium">Vuelto estimado: </span>${ticket.vuelto.toFixed(2)}</p>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push('/catalogo')}
          className="mt-2 w-full rounded-full bg-brand-600 px-4 py-3.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-700 transition-colors"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  // Carrito vacío
  if (items.length === 0) {
    return (
      <div className="flex w-full flex-col gap-4 pb-4">
        <button
          type="button"
          onClick={() => router.push('/catalogo')}
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          ← Volver al catálogo
        </button>
        <p className="text-sm text-brand-300">
          No tenés productos en el carrito para confirmar.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!items.length) { notifyError('No tenés productos en el carrito.'); return; }
    if (!name.trim() || !phone.trim()) { notifyError('Completá al menos nombre y teléfono.'); return; }
    if (deliveryType === 'delivery' && !address.trim()) { notifyError('Para delivery necesitamos una dirección.'); return; }
    if (!selectedMedioPagoId) { notifyError('Seleccioná un medio de pago.'); return; }

    let pagaEfectivoNum = 0;
    let vueltoNum = 0;

    if (isEfectivoSelected) {
      pagaEfectivoNum = Number(pagaEfectivo.replace(',', '.')) || 0;
      if (pagaEfectivoNum <= 0) { notifyError('Ingresá el monto que paga el cliente.'); return; }
      if (pagaEfectivoNum < total) {
        notifyError(`El monto pagado ($${pagaEfectivoNum.toFixed(2)}) debe ser mayor o igual al total ($${total.toFixed(2)}).`);
        return;
      }
      vueltoNum = pagaEfectivoNum - total;
    }

    try {
      setSubmitting(true);
      await crearPedidoDesdeMicrositio({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        deliveryType,
        extraNotes: extraNotes.trim(),
        items,
        total,
        medio_pago_id: selectedMedioPagoId,
        paga_efectivo: pagaEfectivoNum,
        vuelto_pago_efectivo: vueltoNum,
        clienteId: session?.clienteId,
        conversation_id: session?.conversationId,
      });

      notifySuccess('Pedido registrado. El local va a gestionar tu pedido.');

      const medioSeleccionado = medioPagoList.find((m) => m.id === selectedMedioPagoId);
      setTicket({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        deliveryType,
        extraNotes: extraNotes.trim(),
        items: [...items],
        total,
        deliveryCost,
        grandTotal: total + deliveryCost,
        medioPagoDescripcion: medioSeleccionado?.descripcion ?? null,
        pagaEfectivo: pagaEfectivoNum,
        vuelto: vueltoNum,
      });

      clearCart();
    } catch (err: any) {
      logError('Error al procesar el checkout', err);
      notifyError(err.message ?? 'No se pudo registrar el pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 pb-4">
      <button
        type="button"
        onClick={() => router.push('/catalogo/carrito')}
        className="text-xs font-medium text-brand-600 hover:text-brand-700"
      >
        ← Volver al carrito
      </button>

      <h1 className="text-lg font-bold text-brand-800">Checkout</h1>

      {/* Resumen del pedido */}
      <div className="space-y-2 rounded-2xl border border-brand-100 bg-white p-4 text-sm text-brand-700 shadow-card">
        <p className="font-semibold text-brand-800">Resumen del pedido</p>
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it.product.id} className="flex justify-between">
              <span>{it.quantity}x {it.product.name}</span>
              <span>${(it.quantity * it.product.price).toLocaleString('es-AR')}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-brand-100 pt-2 text-xs text-brand-300">
          <span>Subtotal</span>
          <span>${total.toLocaleString('es-AR')}</span>
        </div>
        <div className="flex justify-between text-xs text-brand-300">
          <span>Delivery (demo)</span>
          <span>${deliveryCost.toLocaleString('es-AR')}</span>
        </div>
        <div className="flex justify-between pt-1 text-sm font-bold text-brand-800">
          <span>Total aprox.</span>
          <span>${grandTotal.toLocaleString('es-AR')}</span>
        </div>
      </div>

      {/* Tus datos */}
      <div className="space-y-3 rounded-2xl border border-brand-100 bg-white p-4 text-sm shadow-card">
        <p className="font-semibold text-brand-800">Tus datos</p>

        <div className="space-y-1">
          <label className="text-xs font-medium text-brand-600">Nombre y apellido</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-600/20"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-brand-600">Teléfono (WhatsApp)</label>
          <input
            type="tel"
            required
            value={phone}
            disabled
            className="w-full rounded-2xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm text-brand-300 outline-none"
          />
        </div>

        {/* Método de entrega */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-brand-600">Método de entrega</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeliveryType('delivery')}
              className={`flex-1 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                deliveryType === 'delivery'
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100'
              }`}
            >
              Delivery
            </button>
            <button
              type="button"
              onClick={() => setDeliveryType('pickup')}
              className={`flex-1 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                deliveryType === 'pickup'
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100'
              }`}
            >
              Retiro en local
            </button>
          </div>
        </div>

        {deliveryType === 'delivery' && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-brand-600">Dirección</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-2xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-600/20"
            />
          </div>
        )}

        {/* Medio de pago */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-brand-600">Medio de pago</label>
          <div className="flex flex-wrap gap-2">
            {medioPagoList.map((mp) => (
              <label
                key={mp.id}
                className={`flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  selectedMedioPagoId === mp.id
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100'
                }`}
              >
                <input
                  type="radio"
                  name="medio_pago"
                  value={mp.id}
                  checked={selectedMedioPagoId === mp.id}
                  onChange={() => setSelectedMedioPagoId(mp.id)}
                  className="mr-2 accent-brand-600"
                />
                <span className="font-semibold">{mp.descripcion}</span>
              </label>
            ))}
            {medioPagoList.length === 0 && (
              <p className="text-xs text-brand-300">No hay medios de pago configurados.</p>
            )}
          </div>
        </div>

        {/* Efectivo — mantiene yellow como señal semántica de alerta/info */}
        {isEfectivoSelected && (
          <div className="space-y-2 rounded-2xl border border-yellow-200 bg-yellow-50 p-3 text-xs">
            <p className="font-semibold text-brand-800">Pago en efectivo</p>
            <label className="text-[11px] font-medium text-brand-600">
              Monto que paga el cliente
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={pagaEfectivo}
              onChange={(e) => setPagaEfectivo(e.target.value)}
              className="w-full rounded-2xl border border-brand-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600/20"
            />
            {pagaEfectivo && (
              <p className="text-[11px] text-brand-600">
                Vuelto estimado:{' '}
                {(() => {
                  const num = Number(pagaEfectivo.replace(',', '.')) || 0;
                  const v = num - total;
                  return v > 0 ? `$${v.toFixed(2)}` : '$0.00';
                })()}
              </p>
            )}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-brand-600">
            Comentarios extra (opcional)
          </label>
          <textarea
            className="min-h-[80px] w-full rounded-2xl border border-brand-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-600/20"
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
            placeholder="Ej: timbrar fuerte, no poner mayonesa, etc."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full rounded-full bg-accent-500 px-4 py-3.5 text-sm font-semibold text-white shadow-accent hover:bg-accent-400 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Enviando...' : 'Confirmar pedido'}
      </button>
    </form>
  );
}
