export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { ReactNode } from 'react';
import CatalogoProviders from './providers';

export default function CatalogoLayout({ children }: { children: ReactNode }) {
  
  return <CatalogoProviders>{children}</CatalogoProviders>;
}
