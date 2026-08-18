'use client';

import { Search } from 'lucide-react';

interface Props {
  placeholder: string;
  onSearch: (query: string) => void;
}

/** [2.5] FontAwesome → lucide. [4.4] input de 44px para uso táctil. */
export default function SearchTipoProducto({ placeholder, onSearch }: Props) {
  return (
    <div className="relative flex-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search size={16} className="text-brand-300" />
      </div>
      <input
        type="search"
        className="block h-11 w-full rounded-lg border border-brand-200 bg-white pl-10 pr-3 text-sm placeholder-brand-300 outline-none transition-colors focus:border-brand-600"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
