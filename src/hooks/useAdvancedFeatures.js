import { useState, useEffect, useCallback } from 'react';

// ==================== CACHING HOOK ====================
export function useCache(key, fetchFunction, options = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default TTL
    staleWhileRevalidate = false,
    enabled = true
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  // Check if cached data is valid
  const isCacheValid = useCallback(() => {
    if (!lastFetched) return false;
    return Date.now() - lastFetched < ttl;
  }, [lastFetched, ttl]);

  // Fetch data with caching logic
  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    // Return cached data if valid and not forced
    if (!force && isCacheValid() && data) {
      return data;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction();
      
      setData(result);
      setLastFetched(Date.now());
      
      // Store in localStorage for persistence
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Failed to cache data in localStorage:', e);
      }
      
      return result;
    } catch (err) {
      setError(err);
      
      // If stale-while-revalidate and we have cached data, return it
      if (staleWhileRevalidate && data) {
        return data;
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [enabled, isCacheValid, data, fetchFunction, key, staleWhileRevalidate]);

  // Load from localStorage on mount
  useEffect(() => {
    if (!enabled) return;

    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        
        // Check if cached data is still valid
        if (Date.now() - timestamp < ttl) {
          setData(cachedData);
          setLastFetched(timestamp);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load cached data:', e);
    }

    // Fetch fresh data if no valid cache
    fetchData();
  }, [key, enabled, ttl, fetchData]);

  // Clear cache
  const clearCache = useCallback(() => {
    setData(null);
    setLastFetched(null);
    setError(null);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  }, [key]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    clearCache,
    isCached: !!data && isCacheValid()
  };
}

// ==================== OPTIMISTIC UPDATES HOOK ====================
export function useOptimisticUpdates(initialData = null) {
  const [data, setData] = useState(initialData);
  const [pendingUpdates, setPendingUpdates] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Apply optimistic update
  const applyOptimisticUpdate = useCallback((id, updateFn, apiCall) => {
    const updateId = `update_${Date.now()}_${Math.random()}`;
    
    // Apply optimistic update immediately
    setData(currentData => updateFn(currentData));
    
    // Track pending update
    setPendingUpdates(prev => new Map(prev).set(updateId, {
      id,
      updateFn,
      rollbackFn: null // Will be set if needed
    }));

    // Execute API call
    setLoading(true);
    setError(null);
    
    return apiCall()
      .then(result => {
        // Success - remove pending update and apply real data
        setPendingUpdates(prev => {
          const newMap = new Map(prev);
          newMap.delete(updateId);
          return newMap;
        });
        
        if (result) {
          setData(result);
        }
        
        return result;
      })
      .catch(err => {
        // Error - rollback optimistic update
        setPendingUpdates(prev => {
          const newMap = new Map(prev);
          const update = newMap.get(updateId);
          
          if (update && update.rollbackFn) {
            setData(currentData => update.rollbackFn(currentData));
          }
          
          newMap.delete(updateId);
          return newMap;
        });
        
        setError(err);
        throw err;
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Set rollback function for a pending update
  const setRollbackFn = useCallback((updateId, rollbackFn) => {
    setPendingUpdates(prev => {
      const newMap = new Map(prev);
      const update = newMap.get(updateId);
      if (update) {
        newMap.set(updateId, { ...update, rollbackFn });
      }
      return newMap;
    });
  }, []);

  return {
    data,
    loading,
    error,
    applyOptimisticUpdate,
    setRollbackFn,
    hasPendingUpdates: pendingUpdates.size > 0,
    pendingUpdatesCount: pendingUpdates.size
  };
}

// ==================== REAL-TIME UPDATES HOOK ====================
export function useRealTimeUpdates(endpoint, dependencies = []) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // For now, we'll use polling as WebSocket might not be implemented
    // This can be upgraded to WebSocket when available
    
    let intervalId;
    let isActive = true;

    const pollForUpdates = async () => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch updates');
        
        const newData = await response.json();
        
        if (isActive) {
          setData(newData);
          setConnected(true);
          setError(null);
        }
      } catch (err) {
        if (isActive) {
          setError(err);
          setConnected(false);
        }
      }
    };

    // Initial fetch
    pollForUpdates();
    
    // Set up polling interval (every 30 seconds)
    intervalId = setInterval(pollForUpdates, 30000);

    return () => {
      isActive = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [endpoint, ...dependencies]);

  return {
    data,
    connected,
    error,
    refetch: () => {
      // Trigger immediate update
      return fetch(endpoint).then(res => res.json()).then(setData);
    }
  };
}

// ==================== OFFLINE SUPPORT HOOK ====================
export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process offline queue when coming back online
      processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add action to offline queue
  const queueOfflineAction = useCallback((action) => {
    setOfflineQueue(prev => [...prev, {
      ...action,
      timestamp: Date.now(),
      id: `offline_${Date.now()}_${Math.random()}`
    }]);
  }, []);

  // Process offline queue when back online
  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;

    const queue = [...offlineQueue];
    setOfflineQueue([]);

    for (const action of queue) {
      try {
        await action.execute();
        console.log('Processed offline action:', action.type);
      } catch (error) {
        console.error('Failed to process offline action:', action.type, error);
        // Optionally re-queue failed actions
        setOfflineQueue(prev => [...prev, action]);
      }
    }
  }, [offlineQueue]);

  // Clear offline queue
  const clearOfflineQueue = useCallback(() => {
    setOfflineQueue([]);
  }, []);

  return {
    isOnline,
    offlineQueue,
    queueOfflineAction,
    processOfflineQueue,
    clearOfflineQueue,
    hasOfflineActions: offlineQueue.length > 0
  };
}

// ==================== PROGRESSIVE LOADING HOOK ====================
export function useProgressiveLoading(items = [], pageSize = 10) {
  const [visibleItems, setVisibleItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Load next page
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    
    // Simulate async loading (replace with actual async operation if needed)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const newItems = items.slice(startIndex, endIndex);
    
    setVisibleItems(prev => [...prev, ...newItems]);
    setCurrentPage(prev => prev + 1);
    setHasMore(endIndex < items.length);
    setLoading(false);
  }, [items, currentPage, pageSize, loading, hasMore]);

  // Reset when items change
  useEffect(() => {
    setVisibleItems(items.slice(0, pageSize));
    setCurrentPage(1);
    setHasMore(items.length > pageSize);
  }, [items, pageSize]);

  return {
    visibleItems,
    loading,
    hasMore,
    loadMore
  };
}

// ==================== DEBOUNCED SEARCH HOOK ====================
export function useDebouncedSearch(searchFunction, delay = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const searchResults = await searchFunction(query);
        setResults(searchResults);
      } catch (err) {
        setError(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, searchFunction, delay]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults: () => {
      setResults([]);
      setQuery('');
    }
  };
}

// ==================== INTERSECTION OBSERVER HOOK ====================
export function useIntersectionObserver(options = {}) {
  const [ref, setRef] = useState(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
        ...options
      }
    );

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return {
    ref: setRef,
    isIntersecting,
    entry
  };
}

// Export all advanced hooks
export default {
  useCache,
  useOptimisticUpdates,
  useRealTimeUpdates,
  useOfflineSupport,
  useProgressiveLoading,
  useDebouncedSearch,
  useIntersectionObserver
};