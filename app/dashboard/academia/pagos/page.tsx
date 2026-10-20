'use client';

import { estadoPago, num, type EstadoPago } from '@/app/lib/edu/cuotas';
import { getPago, listarPagos, type Pago } from '@/app/lib/edu/cuotas.api';
import { errorDeApi, fechaCorta, pesos } from '@/app/lib/edu/reglas';
import { logError } from '@/app/lib/logger';
import { notifyError } from '@/app/lib/notificationService';
import { TableSkeleton } from '@/app/ui/TableSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import ResponsiveTable, { Columna } from '@/components/ui/ResponsiveTable';
import { useCallback, useEffect, useState } from 'react';
import PagoDetalleDialog from '../componentes/PagoDetalleDialog';
import {
  BotonSecundario,
  claseCampo,
  Encabezado,
  Etiqueta,
} from '../componentes/ui';

export default function PagosPage() {
  const [estado, setEstado] = useState<EstadoPago | ''>('pendiente');
  const [datos, setDatos] = useState<Pago[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [abierto, setAbierto] = useState<Pago | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(false);
      setCargando(true);
      setDatos(await listarPagos(estado || undefined));
    } catch (err) {
      logError('Error al cargar pagos', err);
      setError(true);
    } finally {
      setCargando(false);
    }
  }, [estado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrir = async (p: Pago) => {
    try {
      setAbierto(await getPago(p.id));
    } catch (err) {
      notifyError(errorDeApi(err, 'No se pudo abrir el pago').mensaje);
    }
  };

  const columnas: Columna<Pago>[] = [
    {
      key: 'alumnos',
      header: 'Alumnos',
      mobile: 'primary',
      render: (p) => (
        <span className="font-semibold text-brand-800">
          {[...new Set(p.cuotas.map((c) => c.alumno))].join(', ') || '—'}
        </span>
      ),
    },
    {
      key: 'importe',
      header: 'Importe',
      align: 'right',
      mobile: 'secondary',
      sortValue: (p) => num(p.importe_total),
      render: (p) => (p.estado === 'pendiente' ? '—' : pesos(p.importe_total)),
    },
    {
      key: 'cuotas',
      header: 'Cuotas',
      mobile: 'secondary',
      render: (p) => `${p.cuotas.length}`,
    },
    {
      key: 'origen',
      header: 'Origen',
      mobile: 'meta',
      render: (p) => (p.origen === 'portal' ? 'Alumno / tutor' : 'Academia'),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      mobile: 'meta',
      sortValue: (p) => p.fecha_pago ?? '',
      render: (p) => fechaCorta(p.fecha_pago),
    },
    {
      key: 'estado',
      header: 'Estado',
      mobile: 'meta',
      render: (p) => {
        const e = estadoPago(p.estado);
        return (
          <span className="flex flex-wrap gap-1">
            <Etiqueta tono={e.tono}>{e.texto}</Etiqueta>
            {p.fuera_de_termino && p.estado === 'pendiente' && (
              <Etiqueta tono="aviso">Fuera de término</Etiqueta>
            )}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <Encabezado
        titulo="Pagos"
        subtitulo="Pagos registrados e informados por alumnos y tutores"
      />
      <div className="mb-4 max-w-xs">
        <label>
          <span className="sr-only">Estado</span>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoPago | '')}
            className={claseCampo}
          >
            <option value="pendiente">Pendientes de revisión</option>
            <option value="aprobado">Aprobados</option>
            <option value="rechazado">Rechazados</option>
            <option value="">Todos</option>
          </select>
        </label>
      </div>
      {cargando ? (
        <TableSkeleton rows={4} cols={5} withFilter={false} />
      ) : error ? (
        <ErrorState onRetry={cargar} />
      ) : (
        <ResponsiveTable
          datos={datos}
          columnas={columnas}
          rowKey={(p) => p.id}
          acciones={(p) => (
            <BotonSecundario
              type="button"
              onClick={() => abrir(p)}
              aria-label={`Ver pago ${p.id}`}
            >
              {p.estado === 'pendiente' ? 'Revisar' : 'Ver'}
            </BotonSecundario>
          )}
          vacio={{
            titulo: estado === 'pendiente' ? 'Nada para revisar' : 'Sin pagos',
            mensaje:
              estado === 'pendiente'
                ? 'Cuando un alumno o tutor informe un pago, aparece acá.'
                : undefined,
          }}
        />
      )}
      {abierto && (
        <PagoDetalleDialog
          pago={abierto}
          onClose={() => setAbierto(null)}
          onResuelto={() => {
            setAbierto(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}
