/**
 * TableSkeleton — reemplaza en el lugar al de 4 barras grises.
 *
 * Los 9 archivos que ya lo importan desde '@/app/ui/TableSkeleton' siguen
 * funcionando sin tocar una línea: misma ruta, mismo named export, props
 * opcionales.
 *
 * Cambios: paleta brand en vez de gray-300, y la forma del contenido real
 * (filtro, encabezado, filas con celdas de distinto ancho) en vez de barras
 * uniformes que no se parecen a nada.
 */
interface Props {
  /** Filas a simular. Default 6. */
  rows?: number;
  /** Columnas por fila. Default 4. */
  cols?: number;
  /** Barra de filtro/búsqueda arriba. Default true. */
  withFilter?: boolean;
}

export const TableSkeleton = ({ rows = 6, cols = 4, withFilter = true }: Props = {}) => {
  // Anchos variados: un skeleton de columnas iguales se lee como una grilla,
  // no como una tabla de datos.
  const widths = ['w-2/5', 'w-1/4', 'w-1/3', 'w-1/5', 'w-1/6'];

  return (
    <div
      className="overflow-hidden rounded-xl border border-brand-100 bg-white shadow-card"
      aria-busy="true"
      aria-label="Cargando datos"
    >
      {withFilter && (
        <div className="flex items-center gap-3 border-b border-brand-100 bg-brand-50 px-4 py-3">
          <div className="h-9 flex-1 animate-pulse rounded-lg bg-brand-100" />
          <div className="h-4 w-16 animate-pulse rounded bg-brand-100" />
        </div>
      )}

      <div className="hidden border-b border-brand-100 bg-brand-50 px-4 py-3 md:flex md:gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className={`h-3 animate-pulse rounded bg-brand-200 ${widths[i % widths.length]}`}
          />
        ))}
      </div>

      <div className="divide-y divide-brand-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className={`h-4 animate-pulse rounded bg-brand-100 ${widths[c % widths.length]}`}
                style={{ animationDelay: `${r * 60}ms` }}
              />
            ))}
            <div className="ml-auto flex shrink-0 gap-2">
              <div className="h-8 w-8 animate-pulse rounded-full bg-brand-100" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-brand-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
