'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import EmptyState from './EmptyState';

/**
 * ResponsiveTable — tabla en md+, tarjetas por debajo.
 *
 * Las tablas de productos y usuarios ya tenían su propio tratamiento móvil
 * (y quedan como están). Esto es para las que NO lo tienen: TipoSalidaTable
 * (dos copias) y las cinco tablas de reportes, que hoy se desbordan
 * horizontalmente en teléfono.
 *
 * Define las columnas una vez y salen las dos vistas. Las columnas marcadas
 * con primary/secondary son las que se muestran en la tarjeta móvil; el resto
 * aparece solo en la tabla.
 */

export interface Columna<T> {
  key: string;
  header: string;
  /** Contenido de la celda. */
  render: (fila: T) => ReactNode;
  /** Valor de orden. Si falta, la columna no es ordenable. */
  sortValue?: (fila: T) => string | number;
  /** Rol en la tarjeta móvil. 'hidden' = solo en la tabla. */
  mobile?: 'primary' | 'secondary' | 'meta' | 'hidden';
  align?: 'left' | 'right';
}

interface Props<T> {
  datos: T[];
  columnas: Columna<T>[];
  rowKey: (fila: T) => string | number;
  acciones?: (fila: T) => ReactNode;
  vacio?: { titulo: string; mensaje?: string; accion?: { label: string; onClick: () => void } };
  /** Barra de filtro propia de la pantalla, arriba de la tabla. */
  toolbar?: ReactNode;
}

export default function ResponsiveTable<T>({
  datos, columnas, rowKey, acciones, vacio, toolbar,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [asc, setAsc] = useState(true);

  const ordenables = new Map(
    columnas.filter((c) => c.sortValue).map((c) => [c.key, c.sortValue!])
  );

  const filas = sortKey && ordenables.has(sortKey)
    ? [...datos].sort((a, b) => {
        const get = ordenables.get(sortKey)!;
        const va = get(a), vb = get(b);
        if (va < vb) return asc ? -1 : 1;
        if (va > vb) return asc ? 1 : -1;
        return 0;
      })
    : datos;

  const toggleSort = (key: string) => {
    if (sortKey === key) setAsc(!asc);
    else { setSortKey(key); setAsc(true); }
  };

  if (datos.length === 0 && vacio) {
    return (
      <div>
        {toolbar}
        <EmptyState titulo={vacio.titulo} mensaje={vacio.mensaje} accion={vacio.accion} />
      </div>
    );
  }

  const primary = columnas.find((c) => c.mobile === 'primary') ?? columnas[0];
  const secondary = columnas.filter((c) => c.mobile === 'secondary');
  const meta = columnas.filter((c) => c.mobile === 'meta');

  return (
    <div className="overflow-hidden rounded-xl border border-brand-100 bg-white shadow-card">
      {toolbar && (
        <div className="border-b border-brand-100 bg-brand-50 px-4 py-3">{toolbar}</div>
      )}

      {/* MÓVIL */}
      <div className="divide-y divide-brand-100 md:hidden">
        {filas.map((fila) => (
          <div key={rowKey(fila)} className="flex gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-800">
                {primary.render(fila)}
              </p>

              {secondary.length > 0 && (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {secondary.map((c) => (
                    <span key={c.key} className="text-sm text-brand-700">
                      {c.render(fila)}
                    </span>
                  ))}
                </div>
              )}

              {meta.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-brand-300">
                  {meta.map((c) => (
                    <span key={c.key}>
                      {c.header}: {c.render(fila)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {acciones && (
              <div className="flex shrink-0 flex-col justify-center gap-1.5">{acciones(fila)}</div>
            )}
          </div>
        ))}
      </div>

      {/* ESCRITORIO */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full divide-y divide-brand-100">
          <thead className="bg-brand-50">
            <tr>
              {columnas.map((c) => {
                const sortable = Boolean(c.sortValue);
                const activa = sortKey === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={activa ? (asc ? 'ascending' : 'descending') : undefined}
                    className={
                      'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-600 ' +
                      (c.align === 'right' ? 'text-right ' : 'text-left ') +
                      (sortable ? 'cursor-pointer select-none hover:text-brand-800' : '')
                    }
                    onClick={sortable ? () => toggleSort(c.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.header}
                      {sortable &&
                        (activa
                          ? asc
                            ? <ChevronUp size={12} />
                            : <ChevronDown size={12} />
                          : <ChevronsUpDown size={12} className="opacity-40" />)}
                    </span>
                  </th>
                );
              })}
              {acciones && (
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-600">
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-brand-100 bg-white">
            {filas.map((fila) => (
              <tr key={rowKey(fila)} className="transition-colors hover:bg-brand-50">
                {columnas.map((c) => (
                  <td
                    key={c.key}
                    className={'px-4 py-3 text-sm ' + (c.align === 'right' ? 'text-right' : '')}
                  >
                    {c.render(fila)}
                  </td>
                ))}
                {acciones && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">{acciones(fila)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-brand-100 px-4 py-2.5 text-xs text-brand-300">
        {filas.length} {filas.length === 1 ? 'registro' : 'registros'}
      </div>
    </div>
  );
}
