'use client';

import Dialog from '@/components/ui/Dialog';
import {
  desvincularMiTelegram,
  generarVinculacion,
  getMiTelegram,
  mensajeError,
  MiTelegram,
  setMisAvisos,
} from '@/app/lib/canales.api';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { Bell, BellOff, ExternalLink, Send } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Vincula el Telegram del usuario logueado con el bot del comercio.
 * Se usa en /dashboard/mi-telegram y dentro de Canales (para el admin).
 */
export default function MiTelegramCard({
  compacto = false,
}: {
  compacto?: boolean;
}) {
  const [estado, setEstado] = useState<MiTelegram | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<{ url: string; venceAt: number } | null>(
    null,
  );
  const [ocupado, setOcupado] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const sondeo = useRef<ReturnType<typeof setInterval> | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const e = await getMiTelegram();
      setEstado(e);
      return e;
    } catch (err) {
      setError(mensajeError(err, 'No se pudo cargar tu Telegram.'));
      return null;
    }
  }, []);

  useEffect(() => {
    cargar();
    return () => {
      if (sondeo.current) clearInterval(sondeo.current);
    };
  }, [cargar]);

  // Mientras el link está vivo, se espera a que el usuario toque "Iniciar"
  useEffect(() => {
    if (!link) return;
    sondeo.current = setInterval(async () => {
      if (Date.now() > link.venceAt) {
        setLink(null);
        return;
      }
      const e = await cargar();
      if (e?.vinculo) {
        setLink(null);
        notifySuccess('Telegram vinculado');
      }
    }, 3000);
    return () => {
      if (sondeo.current) clearInterval(sondeo.current);
    };
  }, [link, cargar]);

  const vincular = async () => {
    try {
      setOcupado(true);
      const r = await generarVinculacion();
      setLink({ url: r.url, venceAt: Date.now() + r.expira_en * 1000 });
      window.open(r.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      notifyError(mensajeError(err, 'No se pudo generar el link.'));
    } finally {
      setOcupado(false);
    }
  };

  const toggleAvisos = async () => {
    if (!estado?.vinculo) return;
    try {
      setOcupado(true);
      await setMisAvisos(!estado.vinculo.avisos);
      await cargar();
    } catch (err) {
      notifyError(mensajeError(err));
    } finally {
      setOcupado(false);
    }
  };

  const desvincular = async () => {
    try {
      setOcupado(true);
      await desvincularMiTelegram();
      setConfirmar(false);
      notifySuccess('Telegram desvinculado');
      await cargar();
    } catch (err) {
      notifyError(mensajeError(err));
    } finally {
      setOcupado(false);
    }
  };

  const contenedor = compacto
    ? 'rounded-xl border border-brand-100 bg-brand-50 p-3'
    : 'rounded-2xl border border-brand-100 bg-white p-5 shadow-card';

  if (error)
    return (
      <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
    );
  if (!estado) return <p className="text-sm text-brand-300">Cargando…</p>;

  if (!estado.bot) {
    return (
      <div className={contenedor}>
        <p className="text-sm text-brand-600">
          Tu comercio todavía no conectó un bot de Telegram. El administrador lo
          conecta desde Canales de pedidos.
        </p>
      </div>
    );
  }

  return (
    <div className={`${contenedor} space-y-3 text-sm text-brand-600`}>
      <p className="flex items-center gap-1.5 font-medium text-brand-800">
        <Send size={14} /> Mi Telegram
      </p>

      {!estado.vinculo ? (
        <>
          <p>
            Vinculá tu Telegram con {estado.bot.nombre} para recibir los pedidos
            nuevos en el celular. Cada persona vincula el suyo desde su usuario.
          </p>
          {link ? (
            <div className="space-y-2 rounded-lg border border-brand-200 bg-white p-3">
              <p>
                Se abrió Telegram: tocá <strong>Iniciar</strong>. ¿No se abrió?
              </p>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-medium text-white"
              >
                <ExternalLink size={14} /> Abrir en Telegram
              </a>
              <p className="text-xs text-brand-300">
                El link sirve una sola vez y vence en 10 minutos.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={vincular}
              disabled={ocupado}
              className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-400 disabled:opacity-60"
            >
              {ocupado ? 'Generando…' : 'Vincular mi Telegram'}
            </button>
          )}
        </>
      ) : (
        <>
          <p>
            Vinculado con{' '}
            <a
              href={estado.bot.url_bot ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-800 underline"
            >
              {estado.bot.nombre}
            </a>
            .{' '}
            {estado.vinculo.avisos
              ? 'Te llegan los pedidos nuevos.'
              : 'Los avisos de pedidos están apagados.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleAvisos}
              disabled={ocupado}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 disabled:opacity-60"
            >
              {estado.vinculo.avisos ? (
                <BellOff size={14} />
              ) : (
                <Bell size={14} />
              )}
              {estado.vinculo.avisos ? 'Apagar avisos' : 'Prender avisos'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmar(true)}
              disabled={ocupado}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Desvincular
            </button>
          </div>
          <p className="text-xs text-brand-300">
            Sólo recibís avisos si tu usuario tiene acceso a Pedidos.
          </p>
        </>
      )}

      {confirmar && (
        <Dialog
          titulo="¿Desvincular tu Telegram?"
          onClose={() => setConfirmar(false)}
          bloquear={ocupado}
        >
          <p className="text-sm text-brand-600">
            Dejás de recibir los avisos en ese chat. Lo podés volver a vincular
            cuando quieras.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmar(false)}
              disabled={ocupado}
              className="rounded-full border border-brand-200 px-4 py-2 text-sm text-brand-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={desvincular}
              disabled={ocupado}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {ocupado ? 'Desvinculando…' : 'Desvincular'}
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
