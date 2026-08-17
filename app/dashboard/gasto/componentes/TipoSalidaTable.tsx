'use client';

import { getClienteId } from '@/app/lib/authService';
import ResponsiveTable, { Columna } from '@/components/ui/ResponsiveTable';
import { Pencil, Trash2 } from 'lucide-react';

/**
 * REFERENCIA DE MIGRACIÓN a ResponsiveTable — tarea 4.3.
 *
 * De 181 líneas a ~70, y de paso:
 *   - deja de desbordarse en teléfono (antes: overflow-x-auto y a scrollear)
 *   - pasa de la paleta gray-* a brand-*
 *   - íconos lucide en vez de FontAwesome
 *   - estado vacío real en vez de tabla con el cuerpo en blanco
 *   - sin el console.log(tipos) que corría en cada render
 *
 * Ojo: este archivo existe DUPLICADO en dashboard/tipo-salida/componentes y en
 * dashboard/gasto/componentes. Unificar primero (tarea 3.3) y después migrar
 * uno solo.
 */

interface TipoSalida {
  id: number;
  categoria_tipo_id: number;
  descripcion: string;
  nombre: string;
}

interface Props {
  tipoSalida: TipoSalida[];
  onDelete: (id: number, clienteId: bigint | null) => void;
  onEdit: (id: number, clienteId: bigint | null) => void;
  onCrear?: () => void;
}

const iconBtn =
  'flex h-9 w-9 items-center justify-center rounded-full transition-colors';

export default function TipoSalidaTable({ tipoSalida, onDelete, onEdit, onCrear }: Props) {
  const columnas: Columna<TipoSalida>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      mobile: 'primary',
      sortValue: (t) => t.nombre.toLowerCase(),
      render: (t) => <span className="font-semibold text-brand-800">{t.nombre}</span>,
    },
    {
      key: 'categoria',
      header: 'Categoría de gasto',
      mobile: 'secondary',
      sortValue: (t) => (t.descripcion || '').toLowerCase(),
      render: (t) => (
        <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
          {t.descripcion}
        </span>
      ),
    },
  ];

  return (
    <ResponsiveTable
      datos={tipoSalida}
      columnas={columnas}
      rowKey={(t) => t.id}
      vacio={{
        titulo: 'Todavía no hay categorías de gasto',
        mensaje: 'Creá la primera para poder clasificar los gastos que cargues.',
        accion: onCrear ? { label: 'Crear categoría', onClick: onCrear } : undefined,
      }}
      acciones={(t) => (
        <>
          <button
            onClick={() => onEdit(t.id, getClienteId())}
            title="Editar"
            className={iconBtn + ' bg-brand-50 text-brand-600 hover:bg-brand-100'}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(t.id, getClienteId())}
            title="Eliminar"
            className={iconBtn + ' bg-red-50 text-red-500 hover:bg-red-100'}
          >
            <Trash2 size={15} />
          </button>
        </>
      )}
    />
  );
}
