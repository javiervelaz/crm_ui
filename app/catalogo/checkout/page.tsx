'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;



import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../CartContext';
import { crearPedidoDesdeMicrositio } from '../pedidoMicrositio.api';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { fetchMedioPagoList, MedioPago } from '../medioPagoApi';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>(
    'delivery',
  );
  const [extraNotes, setExtraNotes] = useState('');

  // 🔹 Estado para medios de pago
  const [medioPagoList, setMedioPagoList] = useState<MedioPago[]>([]);
  const [selectedMedioPagoId, setSelectedMedioPagoId] = useState<number | null>(
    null,
  );
  const [pagaEfectivo, setPagaEfectivo] = useState<string>('');

  // 🔹 Estado de envío
  const [submitting, setSubmitting] = useState(false);

  // Costos (el delivery acá es solo visual; al backend le mandamos solo total de productos)
  const deliveryCost = 1000; // demo
  const grandTotal = total + deliveryCost;

  useEffect(() => {
    let cancelled = false;

    async function loadMediosPago() {
      const data = await fetchMedioPagoList();
      if (!cancelled) {
        setMedioPagoList(data);
        // si querés seleccionar uno por defecto (p.ej. efectivo):
        const defaultMedio =
          data.find(
            (mp) =>
              (mp.codigo && mp.codigo.toUpperCase() === 'EFE') ||
              (mp.descripcion &&
                mp.descripcion.toUpperCase().includes('EFECTIVO')),
          ) || data[0];

        if (defaultMedio) {
          setSelectedMedioPagoId(defaultMedio.id);
        }
      }
    }

    loadMediosPago();

    return () => {
      cancelled = true;
    };
  }, []);

  const isEfectivoSelected = useMemo(() => {
    if (!selectedMedioPagoId) return false;
    const mp = medioPagoList.find((m) => m.id === selectedMedioPagoId);
    if (!mp) return false;
    const codigo = (mp.codigo ?? '').toUpperCase();
    const desc = (mp.descripcion ?? '').toUpperCase();
    return codigo === 'EFE' || desc.includes('EFECTIVO');
  }, [medioPagoList, selectedMedioPagoId]);

  if (items.length === 0) {
    return (
      <div className="flex w-full flex-col gap-4 pb-4">
        <button
          type="button"
          onClick={() => router.push('/catalogo')}
          className="text-xs font-medium text-slate-600"
        >
          ← Volver al catálogo
        </button>
        <p className="text-sm text-slate-500">
          No tenés productos en el carrito para confirmar.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!items.length) {
      notifyError('No tenés productos en el carrito.');
      return;
    }

    if (!name.trim() || !phone.trim()) {
      notifyError('Completá al menos nombre y teléfono.');
      return;
    }

    if (deliveryType === 'delivery' && !address.trim()) {
      notifyError('Para delivery necesitamos una dirección.');
      return;
    }

    if (!selectedMedioPagoId) {
      notifyError('Seleccioná un medio de pago.');
      return;
    }

    let pagaEfectivoNum = 0;
    let vueltoNum = 0;

    if (isEfectivoSelected) {
      pagaEfectivoNum = Number(pagaEfectivo.replace(',', '.')) || 0;

      if (pagaEfectivoNum <= 0) {
        notifyError('Ingresá el monto que paga el cliente.');
        return;
      }

      if (pagaEfectivoNum < total) {
        notifyError(
          `El monto pagado ($${pagaEfectivoNum.toFixed(
            2,
          )}) debe ser mayor o igual al total ($${total.toFixed(2)}).`,
        );
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
        total, // lo que consume el backend como monto_total
        medio_pago_id: selectedMedioPagoId,
        paga_efectivo: pagaEfectivoNum,
        vuelto_pago_efectivo: vueltoNum,
      });

      notifySuccess(
        'Pedido registrado. El local va a gestionar tu pedido.',
      );
      clearCart();
      router.push('/catalogo');
    } catch (err: any) {
      console.error(err);
      notifyError(err.message ?? 'No se pudo registrar el pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4 pb-4"
    >
      <button
        type="button"
        onClick={() => router.push('/catalogo/carrito')}
        className="text-xs font-medium text-slate-600"
      >
        ← Volver al carrito
      </button>

      <h1 className="text-lg font-bold text-slate-900">Checkout</h1>

      {/* Resumen */}
      <div className="space-y-2 rounded-2xl border bg-white p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Resumen del pedido</p>
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it.product.id} className="flex justify-between">
              <span>
                {it.quantity}x {it.product.name}
              </span>
              <span>
                $
                {(it.quantity * it.product.price).toLocaleString('es-AR')}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t pt-2 text-xs text-slate-600">
          <span>Subtotal</span>
          <span>${total.toLocaleString('es-AR')}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>Delivery (demo)</span>
          <span>${deliveryCost.toLocaleString('es-AR')}</span>
        </div>
        <div className="flex justify-between pt-1 text-sm font-semibold">
          <span>Total aprox.</span>
          <span>${grandTotal.toLocaleString('es-AR')}</span>
        </div>
      </div>

      {/* Tus datos */}
      <div className="space-y-3 rounded-2xl border bg-white p-4 text-sm">
        <p className="font-semibold text-slate-900">Tus datos</p>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Nombre y apellido
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-900/10 focus:ring-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Teléfono (WhatsApp)
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-900/10 focus:ring-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Método de entrega
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeliveryType('delivery')}
              className={`flex-1 rounded-2xl border px-3 py-2 text-xs font-medium ${
                deliveryType === 'delivery'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              Delivery
            </button>
            <button
              type="button"
              onClick={() => setDeliveryType('pickup')}
              className={`flex-1 rounded-2xl border px-3 py-2 text-xs font-medium ${
                deliveryType === 'pickup'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              Retiro en local
            </button>
          </div>
        </div>

        {deliveryType === 'delivery' && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Dirección
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-900/10 focus:ring-2"
            />
          </div>
        )}

        {/* Medio de pago */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600">
            Medio de pago
          </label>
          <div className="flex flex-wrap gap-3">
            {medioPagoList.map((mp) => (
              <label
                key={mp.id}
                className={`flex items-center rounded-full border px-3 py-1 text-xs ${
                  selectedMedioPagoId === mp.id
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="medio_pago"
                  value={mp.id}
                  checked={selectedMedioPagoId === mp.id}
                  onChange={() => setSelectedMedioPagoId(mp.id)}
                  className="mr-2"
                />
                <span className="font-semibold">{mp.descripcion}</span>
              </label>
            ))}
            {medioPagoList.length === 0 && (
              <p className="text-xs text-slate-500">
                No hay medios de pago configurados.
              </p>
            )}
          </div>
        </div>

        {/* Pago en efectivo */}
        {isEfectivoSelected && (
          <div className="space-y-2 rounded-2xl border border-yellow-200 bg-yellow-50 p-3 text-xs">
            <p className="font-semibold text-slate-800">
              Pago en efectivo
            </p>
            <label className="text-[11px] font-medium text-slate-600">
              Monto que paga el cliente
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={pagaEfectivo}
              onChange={(e) => setPagaEfectivo(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-900/10 focus:ring-2"
            />
            {pagaEfectivo && (
              <p className="text-[11px] text-slate-600">
                Vuelto estimado:{' '}
                {(() => {
                  const num =
                    Number(pagaEfectivo.replace(',', '.')) || 0;
                  const v = num - total;
                  return v > 0
                    ? `$${v.toFixed(2)}`
                    : '$0.00';
                })()}
              </p>
            )}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Comentarios extra (opcional)
          </label>
          <textarea
            className="min-h-[80px] w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-900/10 focus:ring-2"
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
            placeholder="Ej: timbrar fuerte, no poner mayonesa, etc."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Enviando...' : 'Confirmar pedido'}
      </button>
    </form>
  );
}
