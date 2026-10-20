'use client';

import ResponsiveTable, { Columna } from '@/components/ui/ResponsiveTable';
import { Pencil, Trash2 } from 'lucide-react';

/**
 * [3.3 / 4.3] Migrada a ResponsiveTable, mismo patrón que gasto/componentes/TipoSalidaTable.tsx:
 *   - tarjetas en teléfono en vez de <table> desbordada
 *   - paleta brand-* e íconos lucide en vez de FontAwesome
 *   - estado vacío real vía la prop `vacio`
 */

interface TipoProducto {
  id: number;
  nombre: string;
}

interface Props {
  tipos: TipoProducto[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onCrear?: () => void;
}

const iconBtn =
  'flex h-9 w-9 items-center justify-center rounded-full transition-colors';

export default function TipoProductoTable({ tipos, onEdit, onDelete, onCrear }: Props) {
  const columnas: Columna<TipoProducto>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      mobile: 'primary',
      sortValue: (t) => t.nombre.toLowerCase(),
      render: (t) => <span className="font-semibold text-brand-800">{t.nombre}</span>,
    },
  ];

  return (
    <ResponsiveTable
      datos={tipos}
      columnas={columnas}
      rowKey={(t) => t.id}
      vacio={{
        titulo: 'Todavía no hay tipos de producto',
        mensaje: 'Creá el primero para poder clasificar los productos que cargues.',
        accion: onCrear ? { label: 'Crear tipo', onClick: onCrear } : undefined,
      }}
      acciones={(t) => (
        <>
          <button
            onClick={() => onEdit(t.id)}
            title="Editar"
            className={iconBtn + ' bg-brand-50 text-brand-600 hover:bg-brand-100'}
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(t.id)}
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
