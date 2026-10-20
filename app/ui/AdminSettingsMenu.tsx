// app/ui/AdminSettingsMenu.tsx
'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MODULES, settingsModules } from '@/app/lib/modules';
import { CreditCard, LogOut, Settings, ShieldCheck, UserCog, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AppTooltip from '@/components/ui/AppTooltip';

type AdminSettingsMenuProps = {
  userId: string | number;
  /** Módulos del token: sólo se muestran los accesos que el usuario tiene. */
  modules: string[];
};

/**
 * Menú de configuración del header, visible solo para el usuario admin
 * (ver Header.tsx: gating por decoded.role.includes('admin')).
 *
 * Agrupa accesos ya existentes en la app — no crea pantallas nuevas — para
 * que el admin los tenga a mano sin depender de que esos módulos estén en
 * el sidebar.
 */
const AdminSettingsMenu: React.FC<AdminSettingsMenuProps> = ({ userId, modules }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const porModulo = {
    usuarios: { href: MODULES.usuarios.href, label: 'Usuarios', icon: Users, description: MODULES.usuarios.description },
    roles: { href: MODULES.roles.href, label: 'Roles', icon: ShieldCheck, description: MODULES.roles.description },
    plan: { href: MODULES.plan.href, label: 'Planes', icon: CreditCard, description: MODULES.plan.description },
  };

  // Mi perfil es alwaysOpen: no depende de ningún módulo.
  const items = [
    ...settingsModules(modules).map((k) => porModulo[k]),
    { href: MODULES.canales.href, label: 'Canales de pedidos', icon: MODULES.canales.icon, description: MODULES.canales.description },
    { href: MODULES['mi-telegram'].href, label: 'Mi Telegram', icon: MODULES['mi-telegram'].icon, description: MODULES['mi-telegram'].description },
    { href: `/dashboard/profile/${userId}/edit`, label: 'Mi perfil', icon: UserCog, description: 'Mi perfil' },
    { href: MODULES.cuenta.href + '/password', label: 'Cambiar contraseña', icon: MODULES.cuenta.icon, description: MODULES.cuenta.description },
  ];

  // Misma lógica que el "Cerrar sesión" del sidebar (app/lib/dynamicMenu.tsx)
  // — se duplica acá porque ese componente no expone un helper reutilizable.
  const handleLogout = () => {
    setOpen(false);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Configuración"
          className="
            inline-flex h-9 w-9 items-center justify-center
            rounded-full
            bg-brand-100 text-brand-800
            border border-brand-200
            hover:bg-brand-200
            active:bg-brand-300
          "
        >
          <Settings size={18} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1.5">
        <nav className="flex flex-col">
          {items.map(({ href,description, label, icon: Icon }) => (
            <AppTooltip key={href} text={description ?? label} side="right">
              <Link
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-brand-800 hover:bg-brand-50"
            >
              <Icon size={16} />
              {label}
            </Link>
            </AppTooltip>
            
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex items-center gap-2.5 rounded-md border-t border-brand-100 px-3 pt-2.5 pb-2 text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </nav>
      </PopoverContent>
    </Popover>
  );
};

export default AdminSettingsMenu;
