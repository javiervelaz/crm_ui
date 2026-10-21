'use client';

import Dialog from '@/components/ui/Dialog';
import {
  CanalesEstado,
  CanalTelegram,
  conectarTelegram,
  crearLink,
  desconectarCanal,
  getCanales,
  mensajeError,
  quitarVinculado,
  UsuarioVinculado,
} from '@/app/lib/canales.api';
import { useClientePlan } from '@/app/lib/useClientePlan';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import MiTelegramCard from '@/app/dashboard/mi-telegram/componentes/MiTelegramCard';
import { Copy, ExternalLink, Link2, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useCallback, useEffect, useState } from 'react';

const TOKEN_BOT_RE = /^\d{5,20}:[A-Za-z0-9_-]{30,60}$/;

async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    notifySuccess('Copiado');
  } catch {
    notifyError('No se pudo copiar. Seleccioná el texto y copialo a mano.');
  }
}

function Seccion({
  icon: Icon,
  titulo,
  children,
}: {
  icon: any;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} className="text-brand-600" />
        <h2 className="text-base font-semibold text-brand-800">{titulo}</h2>
      </div>
      {children}
    </section>
  );
}

export default function CanalesPage() {
  const { plan } = useClientePlan();
  const [estado, setEstado] = useState<CanalesEstado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setEstado(await getCanales());
    } catch (err) {
      setError(mensajeError(err, 'No se pudieron cargar los canales.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const puedeBot = plan?.features?.canUseBot === true;
  // El link de pedidos depende del rubro (p. ej. educación no lo tiene). Mientras carga el plan, se muestra.
  const tieneLinkPedidos = plan?.features?.canUsePedidosOnline !== false;

  return (
    <main className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-brand-800">
          Canales de pedidos
        </h1>
        <p className="mt-1 text-sm text-brand-300">
          Por dónde te llegan los pedidos online. Todos terminan en el mismo
          lugar: la lista de pedidos del día.
        </p>
      </div>

      {cargando && <p className="text-sm text-brand-300">Cargando…</p>}
      {error && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {estado && (
        <>
          {tieneLinkPedidos && <LinkPublico estado={estado} onCambio={cargar} />}
          <Telegram estado={estado} puedeBot={puedeBot} onCambio={cargar} />
          <Seccion icon={MessageCircle} titulo="WhatsApp">
            {estado.whatsapp.habilitado ? (
              <p className="text-sm text-brand-600">
                {estado.whatsapp.cuentas.length
                  ? `Número conectado: ${estado.whatsapp.cuentas.map((c) => c.nombre).join(', ')}`
                  : 'Todavía no conectaste un número.'}
              </p>
            ) : (
              <p className="text-sm text-brand-300">
                Próximamente: el bot va a contestar desde tu propio número de
                WhatsApp.
                {tieneLinkPedidos &&
                  ' Mientras tanto, mandá tu link de pedidos como respuesta rápida desde WhatsApp Business.'}
              </p>
            )}
          </Seccion>
        </>
      )}
    </main>
  );
}

function LinkPublico({
  estado,
  onCambio,
}: {
  estado: CanalesEstado;
  onCambio: () => void;
}) {
  const [creando, setCreando] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const link = estado.link;

  useEffect(() => {
    if (!link) return;
    QRCode.toDataURL(link.url, { margin: 1, width: 240 })
      .then(setQr)
      .catch(() => setQr(null));
  }, [link]);

  const crear = async () => {
    try {
      setCreando(true);
      await crearLink();
      onCambio();
    } catch (err) {
      notifyError(mensajeError(err));
    } finally {
      setCreando(false);
    }
  };

  return (
    <Seccion icon={Link2} titulo="Link de pedidos">
      {!link ? (
        <div className="space-y-3">
          <p className="text-sm text-brand-600">
            Un link a tu catálogo para que tus clientes pidan solos. Ponelo en
            la bio de Instagram, en un QR en el mostrador o como respuesta
            rápida en WhatsApp Business.
          </p>
          <button
            type="button"
            onClick={crear}
            disabled={creando}
            className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-400 disabled:opacity-60"
          >
            {creando ? 'Creando…' : 'Crear mi link de pedidos'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2">
              <span className="truncate text-sm text-brand-800">
                {link.url}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copiar(link.url)}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
              >
                <Copy size={14} /> Copiar link
              </button>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
              >
                <ExternalLink size={14} /> Probarlo
              </a>
              {qr && (
                <a
                  href={qr}
                  download="qr-pedidos.png"
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
                >
                  Descargar QR
                </a>
              )}
            </div>
            <p className="text-xs text-brand-300">
              Los pedidos sólo entran con la caja abierta. Te pedimos el
              teléfono del cliente en el checkout.
            </p>
          </div>
          {qr && (
            <img
              src={qr}
              alt="QR del link de pedidos"
              className="h-32 w-32 rounded-lg border border-brand-100"
            />
          )}
        </div>
      )}
    </Seccion>
  );
}

function Telegram({
  estado,
  puedeBot,
  onCambio,
}: {
  estado: CanalesEstado;
  puedeBot: boolean;
  onCambio: () => void;
}) {
  const [token, setToken] = useState('');
  const [conectando, setConectando] = useState(false);
  const [aDesconectar, setADesconectar] = useState<CanalTelegram | null>(null);
  const [desconectando, setDesconectando] = useState(false);
  const bot = estado.telegram.find((t) => t.status === 'active') || null;

  if (!puedeBot) {
    return (
      <Seccion icon={Send} titulo="Bot de Telegram">
        <p className="text-sm text-brand-600">
          Con un plan Premium tu bot contesta solo con el link de pedidos y te
          avisa por Telegram cada pedido nuevo.
        </p>
        <Link
          href="/dashboard/plan"
          className="mt-3 inline-block text-sm font-semibold text-accent-500 hover:underline"
        >
          Ver planes →
        </Link>
      </Seccion>
    );
  }

  const tokenOk = TOKEN_BOT_RE.test(token.trim());

  const conectar = async () => {
    try {
      setConectando(true);
      await conectarTelegram(token.trim());
      setToken('');
      notifySuccess('Bot conectado');
      onCambio();
    } catch (err) {
      notifyError(mensajeError(err, 'No se pudo conectar el bot.'));
    } finally {
      setConectando(false);
    }
  };

  const desconectar = async () => {
    if (!aDesconectar) return;
    try {
      setDesconectando(true);
      await desconectarCanal(aDesconectar.id);
      setADesconectar(null);
      notifySuccess('Bot desconectado');
      onCambio();
    } catch (err) {
      notifyError(mensajeError(err));
    } finally {
      setDesconectando(false);
    }
  };

  return (
    <Seccion icon={Send} titulo="Bot de Telegram">
      {!bot ? (
        <div className="space-y-3 text-sm text-brand-600">
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              En Telegram abrí{' '}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent-500 underline"
              >
                @BotFather
              </a>{' '}
              y mandale{' '}
              <code className="rounded bg-brand-50 px-1">/newbot</code>.
            </li>
            <li>
              Elegí el nombre (ej. “Pizzería Don José”) y un usuario que termine
              en “bot”.
            </li>
            <li>Copiá el token que te da y pegalo acá.</li>
          </ol>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="123456789:AA…"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl border border-brand-200 px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-brand-600/20"
            />
            <button
              type="button"
              onClick={conectar}
              disabled={!tokenOk || conectando}
              className="shrink-0 rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-400 disabled:opacity-50"
            >
              {conectando ? 'Conectando…' : 'Conectar bot'}
            </button>
          </div>
          {token && !tokenOk && (
            <p className="text-xs text-red-600">
              Eso no parece un token de @BotFather.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4 text-sm text-brand-600">
          <p>
            Conectado:{' '}
            <a
              href={bot.url_bot ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-800 underline"
            >
              {bot.nombre}
            </a>
            . Cuando un cliente le escribe, le contesta con el botón “Hacer mi
            pedido”.
          </p>
          <MiTelegramCard compacto />
          <Vinculados vinculados={bot.vinculados ?? []} onCambio={onCambio} />
          <button
            type="button"
            onClick={() => setADesconectar(bot)}
            className="text-xs font-medium text-red-600 hover:underline"
          >
            Desconectar bot
          </button>
        </div>
      )}

      {aDesconectar && (
        <Dialog
          titulo="¿Desconectar el bot?"
          onClose={() => setADesconectar(null)}
          bloquear={desconectando}
        >
          <p className="text-sm text-brand-600">
            {aDesconectar.nombre} deja de contestar y de mandar avisos. Los
            links que ya mandó dejan de funcionar. Lo podés volver a conectar
            con el mismo token.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setADesconectar(null)}
              disabled={desconectando}
              className="rounded-full border border-brand-200 px-4 py-2 text-sm text-brand-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={desconectar}
              disabled={desconectando}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {desconectando ? 'Desconectando…' : 'Desconectar'}
            </button>
          </div>
        </Dialog>
      )}
    </Seccion>
  );
}

function Vinculados({
  vinculados,
  onCambio,
}: {
  vinculados: UsuarioVinculado[];
  onCambio: () => void;
}) {
  const [aQuitar, setAQuitar] = useState<UsuarioVinculado | null>(null);
  const [quitando, setQuitando] = useState(false);

  const quitar = async () => {
    if (!aQuitar) return;
    try {
      setQuitando(true);
      await quitarVinculado(aQuitar.id);
      setAQuitar(null);
      notifySuccess('Telegram desvinculado');
      onCambio();
    } catch (err) {
      notifyError(mensajeError(err));
    } finally {
      setQuitando(false);
    }
  };

  return (
    <div>
      <p className="font-medium text-brand-800">
        Personas con el Telegram vinculado
      </p>
      {vinculados.length === 0 ? (
        <p className="mt-1 text-xs text-brand-300">
          Nadie todavía. Cada persona lo vincula desde su usuario (ícono de
          Telegram arriba a la derecha).
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-brand-100 rounded-xl border border-brand-100">
          {vinculados.map((v) => (
            <li
              key={v.id}
              className="flex items-center justify-between gap-3 px-3 py-2"
            >
              <span className="min-w-0 truncate">
                {v.nombre}
                <span className="ml-2 text-xs text-brand-300">
                  {v.recibe_avisos ? 'recibe avisos' : v.avisos ? 'sin acceso a Pedidos' : 'avisos apagados'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setAQuitar(v)}
                className="shrink-0 text-xs font-medium text-red-600 hover:underline"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
      {aQuitar && (
        <Dialog
          titulo="¿Quitar este Telegram?"
          onClose={() => setAQuitar(null)}
          bloquear={quitando}
        >
          <p className="text-sm text-brand-600">
            {aQuitar.nombre} deja de recibir los pedidos en su Telegram. Lo
            puede volver a vincular desde su usuario.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAQuitar(null)}
              disabled={quitando}
              className="rounded-full border border-brand-200 px-4 py-2 text-sm text-brand-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={quitar}
              disabled={quitando}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {quitando ? 'Quitando…' : 'Quitar'}
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
