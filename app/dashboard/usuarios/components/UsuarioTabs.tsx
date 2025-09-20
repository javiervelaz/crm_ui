// app/ui/dashboard/usuarios/UsuarioTabs.tsx
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
  filteredCount
}: UsuarioTabsProps) {
  const allUsersCount = usuariosCount;

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {/* Tab "Todos" */}
        <button
          onClick={() => onTabChange('all')}
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'all'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Todos
          <span className="ml-2 bg-gray-100 text-gray-900 text-xs font-medium px-2 py-0.5 rounded-full">
            {allUsersCount}
          </span>
        </button>

        {/* Tabs por tipo de usuario */}
        {userTypes.map((type) => (
          <button
            key={type.codigo}
            onClick={() => onTabChange(type.codigo)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === type.codigo
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {type.descripcion}
          </button>
        ))}
      </nav>

      {/* Contador de resultados */}
      <div className="mt-2 text-sm text-gray-600">
        Mostrando {filteredCount} de {allUsersCount} usuarios
        {activeTab !== 'all' && (
          <span className="ml-2">
            (Filtrado por {userTypes.find(t => t.codigo === activeTab)?.descripcion})
          </span>
        )}
      </div>
    </div>
  );
}