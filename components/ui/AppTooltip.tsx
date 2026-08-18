'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import React from 'react';

type AppTooltipProps = {
  /** Frase a mostrar en el tooltip. */
  text: string;
  /** Ítem que dispara el tooltip al pasar el mouse (o recibir foco). */
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
};

/**
 * Componente global de tooltip: se invoca desde cualquier parte de la app
 * pasándole la frase a mostrar, sin tener que armar los 3 primitivos de
 * Radix (Tooltip/TooltipTrigger/TooltipContent) cada vez.
 *
 * Requiere `<TooltipProvider>` montado una vez en app/layout.tsx (root).
 *
 * Uso:
 *   <AppTooltip text="Catálogo, precios y stock de productos">
 *     <Link href="/dashboard/productos">Productos</Link>
 *   </AppTooltip>
 *
 * Para casos que necesiten más control (contenido rico, delay puntual, etc.)
 * usar directamente los primitivos de components/ui/tooltip.tsx.
 */
const AppTooltip: React.FC<AppTooltipProps> = ({
  text,
  children,
  side = 'top',
}) => {
  if (!text) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{text}</TooltipContent>
    </Tooltip>
  );
};

export default AppTooltip;
