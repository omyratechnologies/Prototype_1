import React, { useState } from "react";
import AdvancedSearchModal from "./AdvancedSearchModal";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Basic search functionality
      console.log('Searching for:', searchQuery);
      // In real app, this would trigger search
    }
  };

  return (
    <>
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center bg-[#F6F6F6] rounded-full px-4 py-2 shadow-none border border-transparent">
            <svg
              className="w-5 h-5 text-gray-400 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="bg-transparent flex-1 border-none outline-none placeholder-gray-400 text-gray-800 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowAdvancedSearch(true)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Advanced Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <AdvancedSearchModal 
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
      />
    </>
  );
};

export default SearchBar;
