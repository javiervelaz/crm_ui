'use client';

import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  UserRound,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Academia (módulo "alumnos", rubro educación). Una sola entrada en el menú
 * lateral y solapas para cada sección.
 */
const SECCIONES = [
  {
    href: '/dashboard/academia/inscripciones',
    label: 'Inscripciones',
    icon: ClipboardList,
  },
  {
    href: '/dashboard/academia/alumnos',
    label: 'Alumnos',
    icon: GraduationCap,
  },
  { href: '/dashboard/academia/tutores', label: 'Tutores', icon: Users },
  {
    href: '/dashboard/academia/profesores',
    label: 'Profesores',
    icon: UserRound,
  },
  { href: '/dashboard/academia/clases', label: 'Clases', icon: BookOpen },
  { href: '/dashboard/academia/agenda', label: 'Agenda', icon: CalendarDays },
];

export default function AcademiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="mb-3 font-display text-2xl text-brand-800">Academia</h1>
      <nav
        aria-label="Secciones de la academia"
        className="-mx-4 mb-5 overflow-x-auto px-4 md:mx-0 md:px-0"
      >
        <ul className="flex min-w-max gap-1 border-b border-brand-100">
          {SECCIONES.map(({ href, label, icon: Icon }) => {
            const activa = pathname === href || pathname.startsWith(href + '/');
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
      {children}
    </div>
  );
}
