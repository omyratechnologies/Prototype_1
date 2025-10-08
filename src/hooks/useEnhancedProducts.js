import { useState, useEffect, useCallback } from 'react';
import { graniteService, businessLogicService } from '../services/enhancedApi.js';

// ==================== ENHANCED GRANITE VARIANTS HOOK ====================
export function useGraniteVariants(options = {}) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVariants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await graniteService.getVariants(options);
      setVariants(response.data || []);
    } catch (err) {
      console.error('Error fetching variants:', err);
      setError(err.message || 'Failed to load product categories');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(options)]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  return { 
    variants, 
    loading, 
    error, 
    refetch: fetchVariants,
    refresh: fetchVariants
  };
}

// ==================== ENHANCED SPECIFIC VARIANTS HOOK ====================
export function useSpecificVariants(variantId, options = {}) {
  const [specificVariants, setSpecificVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSpecificVariants = useCallback(async () => {
    if (!variantId) {
      setSpecificVariants([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await graniteService.getSpecificVariantsByVariant(variantId);
      setSpecificVariants(response.data || []);
    } catch (err) {
      console.error('Error fetching specific variants:', err);
      setError(err.message || 'Failed to load product varieties');
    } finally {
      setLoading(false);
    }
  }, [variantId, JSON.stringify(options)]);

  useEffect(() => {
    fetchSpecificVariants();
  }, [fetchSpecificVariants]);

  return { 
    specificVariants, 
    loading, 
    error, 
    refetch: fetchSpecificVariants 
  };
}

// ==================== ENHANCED PRODUCTS BY SPECIFIC VARIANT HOOK ====================
export function useProductsBySpecificVariant(specificVariantId, options = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchProducts = useCallback(async () => {
    if (!specificVariantId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await graniteService.getProductsBySpecificVariant(specificVariantId, options);
      setProducts(response.data || []);
      setPagination(response.pagination || null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [specificVariantId, JSON.stringify(options)]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { 
    products, 
    loading, 
    error, 
    pagination,
    refetch: fetchProducts 
  };
}

// ==================== ENHANCED SINGLE PRODUCT HOOK ====================
export function useProduct(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businessConfig, setBusinessConfig] = useState(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch product and business config in parallel
      const [productResponse, configResponse] = await Promise.all([
        graniteService.getProduct(productId),
        businessLogicService.getBusinessConfig()
      ]);
      
      setProduct(productResponse.data || null);
      setBusinessConfig(configResponse.data || null);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { 
    product, 
    businessConfig,
    loading, 
    error, 
    refetch: fetchProduct 
  };
}

// ==================== ENHANCED PRODUCT SEARCH HOOK ====================
export function useProductSearch(initialQuery = '', initialFilters = {}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState(initialFilters);

  const search = useCallback(async (searchQuery = query, searchFilters = filters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setPagination(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await graniteService.searchProducts(searchQuery, searchFilters);
      setResults(response.data || []);
      setPagination(response.pagination || null);
    } catch (err) {
      console.error('Error searching products:', err);
      setError(err.message || 'Search failed');
      setResults([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [query, filters]);

  const updateQuery = useCallback((newQuery) => {
    setQuery(newQuery);
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters({});
    setResults([]);
    setPagination(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        search();
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
      setPagination(null);
    }
  }, [query, search]);

  return {
    results,
    loading,
    error,
    pagination,
    query,
    filters,
    search,
    updateQuery,
    updateFilters,
    clearSearch
  };
}

// ==================== BUSINESS LOGIC CALCULATION HOOK ====================
export function useBusinessCalculation(cartItems = []) {
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shippingValidation, setShippingValidation] = useState(null);

  const calculate = useCallback(async () => {
    if (!cartItems || cartItems.length === 0) {
      setCalculation(null);
      setShippingValidation(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Calculate cart totals and check shipping in parallel
      const [calcResponse, shippingResponse] = await Promise.all([
        businessLogicService.calculateCart(cartItems),
        businessLogicService.checkShippingWeight(cartItems)
      ]);
      
      setCalculation(calcResponse.data || null);
      setShippingValidation(shippingResponse.data || null);
    } catch (err) {
      console.error('Error calculating business logic:', err);
      setError(err.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(cartItems)]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  return {
    calculation,
    shippingValidation,
    loading,
    error,
    recalculate: calculate
  };
}

// ==================== PRICING CALCULATION HOOK ====================
export function usePricingCalculation(productId, crateQty = 0, pieceQty = 0) {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculate = useCallback(async () => {
    if (!productId || (crateQty === 0 && pieceQty === 0)) {
      setPricing(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await businessLogicService.calculatePricing(productId, crateQty, pieceQty);
      setPricing(response.data || null);
    } catch (err) {
      console.error('Error calculating pricing:', err);
      setError(err.message || 'Pricing calculation failed');
    } finally {
      setLoading(false);
    }
  }, [productId, crateQty, pieceQty]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  return {
    pricing,
    loading,
    error,
    recalculate: calculate
  };
}

// ==================== PRODUCT SIZES HOOK ====================
export function useProductSizes(productId) {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSizes = useCallback(async () => {
    if (!productId) {
      setSizes([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await businessLogicService.getProductSizes(productId);
      setSizes(response.data || []);
    } catch (err) {
      console.error('Error fetching product sizes:', err);
      setError(err.message || 'Failed to load sizes');
      setSizes([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchSizes();
  }, [fetchSizes]);

  return {
    sizes,
    loading,
    error,
    refetch: fetchSizes
  };
}

// ==================== UTILITY HOOKS ====================

// Hook for granite categories
export function useGraniteCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await graniteService.getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

// Hook for granite colors
export function useGraniteColors() {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await graniteService.getColors();
        setColors(response.data || []);
      } catch (err) {
        console.error('Error fetching colors:', err);
        setError(err.message || 'Failed to load colors');
      } finally {
        setLoading(false);
      }
    };

    fetchColors();
  }, []);

  return { colors, loading, error };
}

// Hook for granite finishes
export function useGraniteFinishes() {
  const [finishes, setFinishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinishes = async () => {
      try {
        const response = await graniteService.getFinishes();
        setFinishes(response.data || []);
      } catch (err) {
        console.error('Error fetching finishes:', err);
        setError(err.message || 'Failed to load finishes');
      } finally {
        setLoading(false);
      }
    };

    fetchFinishes();
  }, []);

  return { finishes, loading, error };
}

// Export all hooks as default object for easy importing
export default {
  useGraniteVariants,
  useSpecificVariants,
  useProductsBySpecificVariant,
  useProduct,
  useProductSearch,
  useBusinessCalculation,
  usePricingCalculation,
  useProductSizes,
  useGraniteCategories,
  useGraniteColors,
  useGraniteFinishes,
};