'use client';

import type { ComprobanteUrl } from '@/app/lib/edu/cuotas.api';
import { errorDeApi } from '@/app/lib/edu/reglas';
import { notifyError } from '@/app/lib/notificationService';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import { BotonSecundario } from './ui';

/**
 * Abre el comprobante en una pestaña nueva. La URL es firmada y vence en
 * minutos: se pide al hacer click, nunca se guarda.
 */
export default function ComprobanteBoton({
  obtener,
}: {
  obtener: () => Promise<ComprobanteUrl>;
}) {
  const [cargando, setCargando] = useState(false);

  const abrir = async () => {
    // La pestaña se abre en el click (antes del await) para que el navegador no la bloquee.
    const ventana = window.open('', '_blank');
    try {
      setCargando(true);
      const { url } = await obtener();
      if (ventana) {
        ventana.opener = null;
        ventana.location.href = url;
      } else window.location.href = url;
    } catch (err) {
      ventana?.close();
      notifyError(errorDeApi(err, 'No se pudo abrir el comprobante').mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <BotonSecundario type="button" onClick={abrir} disabled={cargando}>
      <FileText size={16} aria-hidden="true" />
      {cargando ? 'Abriendo…' : 'Ver comprobante'}
    </BotonSecundario>
  );
}
