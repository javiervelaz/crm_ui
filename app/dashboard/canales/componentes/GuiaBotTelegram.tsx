'use client';

import {
  pasosPendientes,
  PREGUNTAS_FRECUENTES,
  QUE_HACE_EL_BOT,
  VIDEOS_GUIA,
} from '@/app/lib/guiaTelegram';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import {
  BookOpen,
  ChevronDown,
  Copy,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    notifySuccess('Copiado');
  } catch {
    notifyError('No se pudo copiar. Seleccioná el texto y copialo a mano.');
  }
}

/**
 * Guía para crear un bot en Telegram (BotFather) y vincularlo a la cuenta de
 * Counter. Sin bot: abierta, con los pasos de Telegram. Con bot: cerrada, con los
 * pasos que quedan (vincular y sumar al equipo) y las preguntas frecuentes.
 *
 * `mostrarConsultas`: el bot contesta preguntas del negocio sólo en gastronomía.
 */
export default function GuiaBotTelegram({
  tieneBot,
  mostrarConsultas = false,
  formularioToken,
}: {
  tieneBot: boolean;
  mostrarConsultas?: boolean;
  /** Campo del token + "Conectar bot": va dentro del paso "Pegalo en Counter" (o debajo del encabezado si la guía está cerrada). */
  formularioToken?: ReactNode;
}) {
  const [abierta, setAbierta] = useState(!tieneBot);
  const pasos = pasosPendientes(tieneBot);

  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-brand-800">
          <BookOpen size={16} className="text-brand-600" />
          {tieneBot
            ? 'Guía: sumar a tu equipo y resolver dudas'
            : 'Guía paso a paso: crear tu bot y vincularlo'}
        </span>
        <ChevronDown
          size={16}
          className={`text-brand-600 transition-transform ${abierta ? 'rotate-180' : ''}`}
        />
      </button>

      {!abierta && formularioToken && (
        <div className="border-t border-brand-100 px-4 py-3">
          {formularioToken}
        </div>
      )}

      {abierta && (
        <div className="space-y-5 border-t border-brand-100 px-4 py-4 text-sm text-brand-600">
          {!tieneBot && (
            <p>
              Son 10 minutos y no hace falta saber de programación. Vas a crear
              un bot propio en Telegram y conectarlo a tu cuenta. Si nunca
              usaste Telegram, arrancá por el paso 1.
            </p>
          )}

          {!tieneBot &&
            VIDEOS_GUIA.map((v) => (
              <figure key={v.id} className="space-y-2">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster={v.poster}
                  className="w-full max-w-xl rounded-xl border border-brand-100 bg-black"
                >
                  <source src={v.src} type="video/mp4" />
                  Tu navegador no puede reproducir el video.
                </video>
                <figcaption className="text-xs">
                  <span className="font-semibold text-brand-800">
                    {v.titulo}.
                  </span>{' '}
                  {v.descripcion}
                </figcaption>
              </figure>
            ))}

          <ol className="space-y-4">
            {pasos.map((p, i) => (
              <li key={p.id} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="font-medium text-brand-800">{p.titulo}</p>
                  <p>{p.detalle}</p>
                  {p.enlace && (
                    <a
                      href={p.enlace.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
                    >
                      <ExternalLink size={14} /> {p.enlace.texto}
                    </a>
                  )}
                  {p.codigo && (
                    <div className="flex items-center gap-2">
                      <code className="rounded-lg bg-white px-2 py-1 font-mono text-xs text-brand-800">
                        {p.codigo}
                      </code>
                      <button
                        type="button"
                        onClick={() => copiar(p.codigo!)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                      >
                        <Copy size={12} /> Copiar
                      </button>
                    </div>
                  )}
                  {p.id === 'conectar' && formularioToken}
                  {p.veras && (
                    <p className="rounded-lg bg-white p-2 text-xs">
                      <span className="font-semibold text-brand-800">
                        Vas a ver:
                      </span>{' '}
                      {p.veras}
                    </p>
                  )}
                  {p.aviso && (
                    <p className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                      <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                      {p.aviso}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="space-y-1.5 rounded-lg bg-white p-3 text-xs">
            <p className="font-semibold text-brand-800">Qué hace tu bot</p>
            <p>• {QUE_HACE_EL_BOT.clientes}</p>
            <p>• {QUE_HACE_EL_BOT.equipo}</p>
            {mostrarConsultas && <p>• {QUE_HACE_EL_BOT.consultas}</p>}
          </div>

          <div>
            <p className="mb-2 font-semibold text-brand-800">
              Preguntas frecuentes
            </p>
            <div className="divide-y divide-brand-100 rounded-lg border border-brand-100 bg-white">
              {PREGUNTAS_FRECUENTES.map((f) => (
                <details key={f.pregunta} className="group px-3 py-2">
                  <summary className="cursor-pointer list-none text-xs font-medium text-brand-800">
                    {f.pregunta}
                  </summary>
                  <p className="mt-1.5 text-xs">{f.respuesta}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
