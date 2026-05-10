'use client'

interface UserType {
  id: number;
  descripcion: string;
  codigo: string;
}

interface UsuarioTabsProps {
  userTypes: UserType[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  usuariosCount: number;
  filteredCount: number;
}

export default function UsuarioTabs({
  userTypes,
  activeTab,
  onTabChange,
  usuariosCount,
  filteredCount,
}: UsuarioTabsProps) {
  return (
    <div className="mb-4">
      {/* Scrollable tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-brand-200 scrollbar-hide">
        <button
          onClick={() => onTabChange('all')}
          className={`shrink-0 rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-brand-600 text-white'
              : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
          }`}
        >
          Todos
          <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-600'
          }`}>
            {usuariosCount}
          </span>
        </button>

        {userTypes.map((type) => (
          <button
            key={type.codigo}
            onClick={() => onTabChange(type.codigo)}
            className={`shrink-0 rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === type.codigo
                ? 'bg-brand-600 text-white'
                : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
            }`}
          >
            {type.descripcion}
          </button>
        ))}
      </div>

      {/* Counter */}
      <p className="mt-2 text-xs text-brand-300">
        {filteredCount} de {usuariosCount} usuarios
        {activeTab !== 'all' && (
          <span className="ml-1">
            · {userTypes.find((t) => t.codigo === activeTab)?.descripcion}
          </span>
        )}
      </p>
    </div>
  );
}
