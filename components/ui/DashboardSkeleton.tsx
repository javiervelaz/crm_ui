/**
 * Skeleton del dashboard. Reemplaza los ~15 bloques de divs grises inline que
 * cada página tenía copiados. Imita la forma real del contenido: encabezado,
 * fila de acciones y tabla.
 */
export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="h-8 w-56 rounded-md bg-brand-100" />

      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-md bg-brand-100" />
        <div className="h-10 w-36 rounded-md bg-brand-100" />
      </div>

      <div className="overflow-hidden rounded-lg border border-brand-200 bg-white shadow-card">
        <div className="h-11 bg-brand-50" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-brand-100 px-4 py-3">
            <div className="h-4 w-1/4 rounded bg-brand-100" />
            <div className="h-4 w-1/3 rounded bg-brand-100" />
            <div className="ml-auto h-4 w-16 rounded bg-brand-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
