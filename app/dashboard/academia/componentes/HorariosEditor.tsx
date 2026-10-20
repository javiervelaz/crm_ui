'use client';

import { DIAS, erroresHorarios, type Horario } from '@/app/lib/edu/reglas';
import { Plus, Trash2 } from 'lucide-react';
import { claseCampo } from './ui';

/**
 * Editor de los turnos de una inscripción: día + hora de inicio y fin.
 * Valida en vivo lo mismo que la API (rango y que no se pisen entre sí); la
 * superposición con otros alumnos o el profesor la informa la API al guardar.
 */
export default function HorariosEditor({
  horarios,
  onChange,
  mostrarErrores,
  conflictos = [],
}: {
  horarios: Horario[];
  onChange: (h: Horario[]) => void;
  mostrarErrores: boolean;
  /** Turnos que la API rechazó (se marcan en rojo). */
  conflictos?: Horario[];
}) {
  const { general, porFila } = erroresHorarios(horarios);
  const set = (i: number, campo: keyof Horario, valor: string) =>
    onChange(
      horarios.map((h, j) =>
        j === i
          ? { ...h, [campo]: campo === 'dia_semana' ? Number(valor) : valor }
          : h,
      ),
    );
  const enConflicto = (h: Horario) =>
    conflictos.some(
      (c) =>
        Number(c.dia_semana) === Number(h.dia_semana) &&
        c.hora_inicio.slice(0, 5) === h.hora_inicio &&
        c.hora_fin.slice(0, 5) === h.hora_fin,
    );

  const agregar = () => {
    const ultimo = horarios[horarios.length - 1];
    onChange([
      ...horarios,
      ultimo
        ? {
            dia_semana: Math.min(Number(ultimo.dia_semana) + 1, 6),
            hora_inicio: ultimo.hora_inicio,
            hora_fin: ultimo.hora_fin,
          }
        : { dia_semana: 1, hora_inicio: '17:00', hora_fin: '18:00' },
    ]);
  };

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm text-brand-700">
        Horarios <span className="text-red-500">*</span>
      </legend>
      {horarios.map((h, i) => {
        const err = mostrarErrores ? porFila[i] : undefined;
        const choca = enConflicto(h);
        return (
          <div
            key={i}
            className={`rounded-lg border p-2 ${err || choca ? 'border-red-200 bg-red-50' : 'border-brand-100 bg-white'}`}
          >
            {/* Teléfono: día + quitar arriba, desde/hasta abajo. Desde sm: una sola fila. */}
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-2 sm:grid-cols-[1.2fr_1fr_1fr_auto]">
              <label className="col-span-2 min-w-0 sm:col-span-1">
                <span className="sr-only">Día del horario {i + 1}</span>
                <select
                  value={h.dia_semana}
                  onChange={(e) => set(i, 'dia_semana', e.target.value)}
                  className={claseCampo}
                  aria-label={`Día del horario ${i + 1}`}
                >
                  {DIAS.map((d) => (
                    <option key={d.n} value={d.n}>
                      {d.largo}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => onChange(horarios.filter((_, j) => j !== i))}
                disabled={horarios.length === 1}
                aria-label={`Quitar horario ${i + 1}`}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30 sm:order-last"
              >
                <Trash2 size={16} />
              </button>
              <label className="flex min-w-0 flex-col gap-0.5 text-[11px] text-brand-400">
                <span className="sm:sr-only">Desde</span>
                <input
                  type="time"
                  step={300}
                  value={h.hora_inicio}
                  onChange={(e) => set(i, 'hora_inicio', e.target.value)}
                  className={`${claseCampo} min-w-0`}
                  aria-label={`Inicio del horario ${i + 1}`}
                />
              </label>
              <label className="flex min-w-0 flex-col gap-0.5 text-[11px] text-brand-400">
                <span className="sm:sr-only">Hasta</span>
                <input
                  type="time"
                  step={300}
                  value={h.hora_fin}
                  onChange={(e) => set(i, 'hora_fin', e.target.value)}
                  className={`${claseCampo} min-w-0`}
                  aria-label={`Fin del horario ${i + 1}`}
                />
              </label>
            </div>
            {err && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {err}
              </p>
            )}
            {!err && choca && (
              <p className="mt-1 text-xs text-red-600">
                Este turno está ocupado
              </p>
            )}
          </div>
        );
      })}
      {mostrarErrores && general && (
        <p role="alert" className="text-xs text-red-600">
          {general}
        </p>
      )}
      <button
        type="button"
        onClick={agregar}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
      >
        <Plus size={14} /> Agregar horario
      </button>
    </fieldset>
  );
}
