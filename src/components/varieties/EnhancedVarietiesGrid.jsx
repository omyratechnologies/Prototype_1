import React, { useState, useMemo } from 'react';
import VarietyCard from './VarietyCard';
import { LoadingSpinner } from '../ui/Loading';

export default function EnhancedVarietiesGrid({ varieties, onCardClick }) {
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced sorting and filtering
  const processedVarieties = useMemo(() => {
    if (!varieties || !Array.isArray(varieties)) return [];
    
    let filtered = varieties;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(variety => 
        variety.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        variety.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category if needed
    if (filterBy !== 'all') {
      filtered = filtered.filter(variety => variety.category === filterBy);
    }

    // Sort varieties
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [varieties, sortBy, sortOrder, filterBy, searchTerm]);

  // Get unique categories for filtering
  const categories = useMemo(() => {
    if (!varieties || varieties.length === 0) return [];
    const uniqueCategories = [...new Set(varieties.map(variety => variety.category))];
    return uniqueCategories.filter(Boolean);
  }, [varieties]);

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  if (!varieties) {
    return <LoadingSpinner />;
  }

  if (varieties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No varieties found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search varieties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          )}

          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <button
              onClick={() => handleSortChange('name')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'name' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('price')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'price' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {processedVarieties.length} of {varieties.length} varieties
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Grid */}
      {processedVarieties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            {searchTerm ? 'No varieties match your search.' : 'No varieties available.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {processedVarieties.map(variety => (
            <VarietyCard 
              key={variety.id} 
              variety={variety} 
              onViewProduct={() => onCardClick(variety.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}