'use client';

import DynamicMenu from '@/app/lib/dynamicMenu';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

type SidebarProps = {
  className?: string;
  onRequestClose?: () => void;
};

export default function Sidebar({ className = '', onRequestClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`w-72 max-w-[85vw] md:w-64 bg-brand-800 text-white/80 flex flex-col border-r border-brand-700 ${className}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-brand-700 bg-brand-900">
        <Image
          src="/assets/Logos/COUNTER CRM/COUNTER CRM Logo horizontal claro.png"
          alt="Counter CRM"
          width={140}
          height={32}
          className="object-contain"
          priority
        />
        {onRequestClose && (
          <button
            type="button"
            onClick={onRequestClose}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-white/80 hover:bg-brand-700"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <DynamicMenu key={pathname} />
      </div>

      <div className="text-center text-xs text-white/40 py-3 border-t border-brand-700 bg-brand-900">
        Counter CRM v1.0 • {new Date().getFullYear()}
      </div>
    </aside>
  );
}
