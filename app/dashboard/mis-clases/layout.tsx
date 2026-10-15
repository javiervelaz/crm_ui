'use client';

import type { SessionToken } from '@/app/lib/modules';
import { jwtDecode } from 'jwt-decode';
import { CalendarDays, Receipt } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/** Solapas de la vista propia. El profesor no tiene cuotas: no ve la solapa. */
export default function MisClasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [tipo, setTipo] = useState<string | null>(null);
  useEffect(() => {
    try {
      const t = localStorage.getItem('token');
      setTipo(t ? (jwtDecode<SessionToken>(t).tipo ?? null) : null);
    } catch {
      setTipo(null);
    }
  }, []);
  const conCuotas = tipo === 'ALU' || tipo === 'TUT';
  const secciones = [
    { href: '/dashboard/mis-clases', label: 'Clases', icon: CalendarDays },
    ...(conCuotas
      ? [
          {
            href: '/dashboard/mis-clases/cuotas',
            label: 'Cuotas y pagos',
            icon: Receipt,
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto w-full max-w-6xl">
      {conCuotas && (
        <nav aria-label="Secciones" className="mb-4">
          <ul className="flex gap-1 border-b border-brand-100">
            {secciones.map(({ href, label, icon: Icon }) => {
              const activa =
                href === '/dashboard/mis-clases'
                  ? pathname === href
                  : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={activa ? 'page' : undefined}
                    className={`flex min-h-[44px] items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors ${
                      activa
                        ? 'border-brand-600 text-brand-700'
                        : 'border-transparent text-brand-400 hover:text-brand-600'
                    }`}
                  >
                    <Icon size={16} /> {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
      {children}
    </div>
  );
}
