import { useState, useEffect } from 'react';
import { productService } from '../services/index.js';

// Hook for fetching all granite variants (main categories)
export function useGraniteVariants() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getVariants();
        // API returns { data: [...], pagination: {...} }
        setVariants(response.data || []);
      } catch (err) {
        console.error('Error fetching variants:', err);
        setError(err.message || 'Failed to load product categories');
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, []);

  return { variants, loading, error, refetch: () => fetchVariants() };
}

// Hook for fetching specific variants by variant ID
export function useSpecificVariants(variantId) {
  const [specificVariants, setSpecificVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!variantId) {
      setSpecificVariants([]);
      setLoading(false);
      return;
    }

    const fetchSpecificVariants = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getSpecificVariantsByVariant(variantId);
        // API returns { data: [...], count: ... }
        setSpecificVariants(response.data || []);
      } catch (err) {
        console.error('Error fetching specific variants:', err);
        setError(err.message || 'Failed to load product varieties');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecificVariants();
  }, [variantId]);

  return { specificVariants, loading, error };
}

// Hook for fetching products by specific variant ID
export function useProductsBySpecificVariant(specificVariantId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!specificVariantId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getProductsBySpecificVariant(specificVariantId);
        // API returns { data: [...], pagination: {...} }
        setProducts(response.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [specificVariantId]);

  return { products, loading, error };
}

// Hook for fetching single product details
export function useProduct(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getProduct(productId);
        // API returns single product object
        setProduct(response.data || null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
}

// Hook for fetching all products with optional filters
export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getProducts(filters);
        // API returns { data: [...], pagination: {...} }
        setProducts(response.data || []);
        setPagination(response.pagination || null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(filters)]);

  return { products, loading, error, pagination };
}

// Hook for product search
export function useProductSearch(query, filters = {}) {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    const searchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.searchProducts(query.trim(), filters);
        // API returns search results
        setSearchResults(response.data || []);
      } catch (err) {
        console.error('Error searching products:', err);
        setError(err.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, JSON.stringify(filters)]);

  return { searchResults, loading, error };
}

// Hook for utility data (categories, colors, etc.)
export function useProductUtilities() {
  const [utilities, setUtilities] = useState({
    categories: [],
    colors: [],
    finishes: [],
    thicknesses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUtilities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [categoriesRes, colorsRes, finishesRes, thicknessesRes] = await Promise.all([
          productService.getCategories(),
          productService.getColors(),
          productService.getFinishes(),
          productService.getThicknesses()
        ]);

        setUtilities({
          categories: categoriesRes.data || [],
          colors: colorsRes.data || [],
          finishes: finishesRes.data || [],
          thicknesses: thicknessesRes.data || []
        });
      } catch (err) {
        console.error('Error fetching utilities:', err);
        setError(err.message || 'Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    fetchUtilities();
  }, []);

  return { utilities, loading, error };
}