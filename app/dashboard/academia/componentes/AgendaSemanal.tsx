'use client';

import { armarAgenda, nombreDia, type TurnoAgenda } from '@/app/lib/edu/reglas';
import EmptyState from '@/components/ui/EmptyState';
import { CalendarDays } from 'lucide-react';
import Link from 'next/link';

const PX_POR_MIN = 1.1;

/**
 * Semana tipo: grilla por día y hora en pantallas medianas, lista por día en
 * el teléfono. Un taller con varios alumnos en el mismo turno es un bloque.
 */
export default function AgendaSemanal({
  turnos,
  mostrarProfesor = true,
  linkInscripcion = true,
}: {
  turnos: TurnoAgenda[];
  mostrarProfesor?: boolean;
  linkInscripcion?: boolean;
}) {
  const { bloques, desde, hasta, dias } = armarAgenda(turnos);
  if (!bloques.length) {
    return (
      <EmptyState
        icono={CalendarDays}
        titulo="Sin clases en la semana"
        mensaje="Cuando haya inscripciones activas con horarios, aparecen acá."
      />
    );
  }
  const horas = Array.from(
    { length: (hasta - desde) / 60 + 1 },
    (_, i) => desde + i * 60,
  );
  // Margen abajo para que la etiqueta de la última hora no quede cortada.
  const alto = (hasta - desde) * PX_POR_MIN + 12;
  const color = (b: { es_grupal: boolean }) =>
    b.es_grupal
      ? 'border-amber-300 bg-amber-50 text-amber-900'
      : 'border-brand-300 bg-brand-50 text-brand-900';

  const Contenido = ({ b }: { b: (typeof bloques)[number] }) => (
    <>
      <p className="truncate font-semibold">
        {b.clase}
        {b.es_grupal ? ` · ${b.alumnos.length} alumnos` : ''}
      </p>
      <p className="truncate">
        {b.es_grupal ? b.alumnos.join(', ') : b.alumnos[0]}
      </p>
      {mostrarProfesor && <p className="truncate opacity-70">{b.profesor}</p>}
    </>
  );
  const enlace = (b: (typeof bloques)[number]) =>
    linkInscripcion && b.inscripciones.length === 1
      ? `/dashboard/academia/inscripciones/${b.inscripciones[0]}`
      : null;

  return (
    <>
      {/* Teléfono: lista por día */}
      <div className="space-y-4 md:hidden">
        {dias
          .filter((d) => bloques.some((b) => b.dia_semana === d))
          .map((d) => (
            <section key={d}>
              <h3 className="mb-2 font-display text-sm font-semibold text-brand-700">
                {nombreDia(d)}
              </h3>
              <ul className="space-y-2">
                {bloques
                  .filter((b) => b.dia_semana === d)
                  .map((b) => {
                    const href = enlace(b);
                    const cuerpo = (
                      <div
                        className={`flex gap-3 rounded-lg border p-3 text-xs ${color(b)}`}
                      >
                        <span className="w-20 shrink-0 font-semibold">
                          {b.hora_inicio}–{b.hora_fin}
                        </span>
                        <div className="min-w-0">
                          <Contenido b={b} />
                        </div>
                      </div>
                    );
                    return (
                      <li
                        key={`${b.dia_semana}-${b.hora_inicio}-${b.inscripciones[0]}`}
                      >
                        {href ? <Link href={href}>{cuerpo}</Link> : cuerpo}
                      </li>
                    );
                  })}
              </ul>
            </section>
          ))}
      </div>

      {/* Mediana en adelante: grilla */}
      <div className="hidden overflow-x-auto rounded-xl border border-brand-100 bg-white shadow-card md:block">
        <div
          className="grid min-w-[720px]"
          style={{
            gridTemplateColumns: `56px repeat(${dias.length}, minmax(0, 1fr))`,
          }}
        >
          <div />
          {dias.map((d) => (
            <div
              key={d}
              className="border-b border-l border-brand-100 px-2 py-2 text-center text-xs font-semibold text-brand-700"
            >
              {nombreDia(d)}
            </div>
          ))}
          <div className="relative" style={{ height: alto }}>
            {horas.map((m) => (
              <span
                key={m}
                className="absolute right-2 -translate-y-1/2 text-[10px] text-brand-300"
                style={{ top: (m - desde) * PX_POR_MIN }}
              >
                {String(Math.floor(m / 60)).padStart(2, '0')}:00
              </span>
            ))}
          </div>
          {dias.map((d) => (
            <div
              key={d}
              className="relative border-l border-brand-100"
              style={{ height: alto }}
            >
              {horas.map((m) => (
                <div
                  key={m}
                  className="absolute inset-x-0 border-t border-dashed border-brand-50"
                  style={{ top: (m - desde) * PX_POR_MIN }}
                />
              ))}
              {bloques
                .filter((b) => b.dia_semana === d)
                .map((b) => {
                  const href = enlace(b);
                  const estilo = {
                    top: b.top * PX_POR_MIN + 1,
                    height: Math.max(b.alto * PX_POR_MIN - 2, 22),
                  };
                  const clase = `absolute inset-x-1 overflow-hidden rounded-md border px-1.5 py-1 text-[11px] leading-tight shadow-sm ${color(b)}`;
                  const titulo = `${b.hora_inicio}–${b.hora_fin} · ${b.clase} · ${b.alumnos.join(', ')}${mostrarProfesor ? ` · ${b.profesor}` : ''}`;
                  return href ? (
                    <Link
                      key={`${b.hora_inicio}-${b.inscripciones[0]}`}
                      href={href}
                      className={`${clase} hover:ring-2 hover:ring-brand-300`}
                      style={estilo}
                      title={titulo}
                    >
                      <Contenido b={b} />
                    </Link>
                  ) : (
                    <div
                      key={`${b.hora_inicio}-${b.inscripciones[0]}`}
                      className={clase}
                      style={estilo}
                      title={titulo}
                    >
                      <Contenido b={b} />
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
