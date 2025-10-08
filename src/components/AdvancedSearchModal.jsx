import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../components/ui/Loading';
import TruncatedDescription from './ui/TruncatedDescription';

export default function AdvancedSearchModal({ isOpen, onClose }) {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    priceRange: '',
    material: '',
    finish: '',
    sortBy: 'relevance'
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'granite', label: 'Granite' },
    { value: 'marble', label: 'Marble' },
    { value: 'quartz', label: 'Quartz' },
    { value: 'tiles', label: 'Tiles' }
  ];

  const priceRanges = [
    { value: '', label: 'Any Price' },
    { value: '0-1000', label: 'Under ₹1,000' },
    { value: '1000-5000', label: '₹1,000 - ₹5,000' },
    { value: '5000-10000', label: '₹5,000 - ₹10,000' },
    { value: '10000-25000', label: '₹10,000 - ₹25,000' },
    { value: '25000+', label: 'Above ₹25,000' }
  ];

  const materials = [
    { value: '', label: 'All Materials' },
    { value: 'natural', label: 'Natural Stone' },
    { value: 'engineered', label: 'Engineered Stone' },
    { value: 'composite', label: 'Composite' }
  ];

  const finishes = [
    { value: '', label: 'All Finishes' },
    { value: 'polished', label: 'Polished' },
    { value: 'honed', label: 'Honed' },
    { value: 'flamed', label: 'Flamed' },
    { value: 'brushed', label: 'Brushed' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'newest', label: 'Newest First' }
  ];

  useEffect(() => {
    if (isOpen && filters.query) {
      handleSearch();
    }
  }, [isOpen, filters]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // Simulate API search delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock search results
      const mockResults = [
        {
          id: 1,
          name: 'Blue Mist Granite Slabs',
          category: 'granite',
          price: 15000,
          material: 'natural',
          finish: 'polished',
          image: '/slabs-blue-mist.png',
          description: 'Premium quality granite slabs with stunning blue mist pattern',
          inStock: true
        },
        {
          id: 2,
          name: 'Royal Grey Marble Tiles',
          category: 'marble',
          price: 8500,
          material: 'natural',
          finish: 'honed',
          image: '/marble-tiles.png',
          description: 'Elegant marble tiles perfect for luxury interiors',
          inStock: true
        },
        {
          id: 3,
          name: 'Quartz Surfaces Premium',
          category: 'quartz',
          price: 22000,
          material: 'engineered',
          finish: 'polished',
          image: '/quartz-surfaces.png',
          description: 'Durable engineered quartz surfaces for modern kitchens',
          inStock: false
        }
      ];

      // Filter results based on criteria
      let filteredResults = mockResults;
      
      if (filters.category) {
        filteredResults = filteredResults.filter(item => item.category === filters.category);
      }
      
      if (filters.material) {
        filteredResults = filteredResults.filter(item => item.material === filters.material);
      }
      
      if (filters.finish) {
        filteredResults = filteredResults.filter(item => item.finish === filters.finish);
      }
      
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(p => p.replace('+', ''));
        filteredResults = filteredResults.filter(item => {
          if (max) {
            return item.price >= parseInt(min) && item.price <= parseInt(max);
          } else {
            return item.price >= parseInt(min);
          }
        });
      }

      // Sort results
      switch (filters.sortBy) {
        case 'price-low':
          filteredResults.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filteredResults.sort((a, b) => b.price - a.price);
          break;
        case 'name':
          filteredResults.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          // relevance - keep original order
          break;
      }

      setResults(filteredResults);
      
      if (filteredResults.length > 0) {
        success(`Found ${filteredResults.length} products matching your criteria`);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      showError('Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    setFilters({
      query: '',
      category: '',
      priceRange: '',
      material: '',
      finish: '',
      sortBy: 'relevance'
    });
    setResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Advanced Search</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Query
              </label>
              <input
                type="text"
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                placeholder="Search for products..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <select
                value={filters.material}
                onChange={(e) => handleFilterChange('material', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              >
                {materials.map(mat => (
                  <option key={mat.value} value={mat.value}>{mat.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finish
              </label>
              <select
                value={filters.finish}
                onChange={(e) => handleFilterChange('finish', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              >
                {finishes.map(finish => (
                  <option key={finish.value} value={finish.value}>{finish.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              >
                {sortOptions.map(sort => (
                  <option key={sort.value} value={sort.value}>{sort.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mb-6">
            <button
              onClick={handleSearch}
              disabled={loading || !filters.query}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <LoadingSpinner size="sm" color="white" /> : 'Search'}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Results */}
          <div className="border-t pt-6">
            {loading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {!loading && results.length === 0 && filters.query && (
              <EmptyState
                title="No products found"
                description="Try adjusting your search criteria or filters"
              />
            )}

            {!loading && results.length > 0 && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Search Results ({results.length} products)
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map(product => (
                    <div key={product.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                      <TruncatedDescription 
                        description={product.description}
                        maxLength={80}
                        className="text-sm text-gray-600 mb-2"
                      />
                      
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{product.price.toLocaleString()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.inStock 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                          View Details
                        </button>
                        <button 
                          disabled={!product.inStock}
                          className="flex-1 px-3 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}