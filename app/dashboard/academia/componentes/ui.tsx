'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ButtonHTMLAttributes, ReactNode } from 'react';

/** Piezas chicas compartidas por las pantallas de la academia. */

export const claseCampo =
  'h-11 w-full rounded-lg border border-brand-200 bg-white px-3 text-sm outline-none transition-colors focus:border-brand-600 disabled:bg-brand-50 disabled:text-brand-400';

export function Campo({
  id,
  label,
  error,
  ayuda,
  children,
  requerido = false,
}: {
  id: string;
  label: string;
  error?: string;
  ayuda?: ReactNode;
  children: ReactNode;
  requerido?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-brand-700">
        {label}
        {requerido && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {ayuda && !error && (
        <p className="mt-1 text-xs text-brand-400">{ayuda}</p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 text-xs text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function BotonPrimario({
  cargando,
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { cargando?: boolean }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || cargando}
      aria-busy={cargando}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {cargando && (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

export function BotonSecundario({
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-brand-200 bg-white px-5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function Encabezado({
  titulo,
  subtitulo,
  acciones,
  volver,
}: {
  titulo: string;
  subtitulo?: ReactNode;
  acciones?: ReactNode;
  volver?: { href: string; label: string };
}) {
  return (
    <div className="mb-5">
      {volver && (
        <Link
          href={volver.href}
          className="mb-2 inline-block text-sm text-brand-400 hover:text-brand-600"
        >
          ← {volver.label}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-xl text-brand-800">{titulo}</h2>
          {subtitulo && (
            <div className="mt-0.5 text-sm text-brand-400">{subtitulo}</div>
          )}
        </div>
        {acciones && (
          <div className="flex shrink-0 flex-wrap gap-2">{acciones}</div>
        )}
      </div>
    </div>
  );
}

export function Etiqueta({
  children,
  tono = 'neutro',
}: {
  children: ReactNode;
  tono?: 'neutro' | 'ok' | 'aviso' | 'apagado';
}) {
  const tonos = {
    neutro: 'bg-brand-50 text-brand-600 border-brand-100',
    ok: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    aviso: 'bg-amber-50 text-amber-700 border-amber-100',
    apagado: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tonos[tono]}`}
    >
      {children}
    </span>
  );
}

export function Tarjeta({
  titulo,
  children,
  acciones,
}: {
  titulo?: string;
  children: ReactNode;
  acciones?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-brand-100 bg-white p-4 shadow-card md:p-5">
      {(titulo || acciones) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {titulo && (
            <h3 className="font-display text-base font-semibold text-brand-800">
              {titulo}
            </h3>
          )}
          {acciones}
        </div>
      )}
      {children}
    </section>
  );
}

export function AvisoError({
  mensaje,
  lineas,
}: {
  mensaje: string;
  lineas?: string[];
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      <p>{mensaje}</p>
      {lineas && lineas.length > 1 && (
        <ul className="mt-1 list-disc pl-5 text-xs">
          {lineas.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
