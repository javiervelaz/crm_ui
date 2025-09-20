'use client'

import React, { useState } from 'react';

interface SearchOrderProps {
  placeholder: string;
  onSearch: (query: string) => void;
}

const SearchOrder: React.FC<SearchOrderProps> = ({ placeholder, onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <div className="flex">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="border rounded-l px-4 py-2"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-4 py-2 rounded-r"
      >
        Search
      </button>
    </div>
  );
};

export default SearchOrder;
