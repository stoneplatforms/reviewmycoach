/**
 * Hook for cached coaches fetching
 * Uses IndexedDB cache + fetch with stale-while-revalidate pattern
 */

import { useState, useEffect, useCallback } from 'react';
import { getCachedCoaches, setCachedCoaches, generateCacheKey } from '../cache/coaches-cache';

interface UseCoachesCacheOptions {
  params: Record<string, any>;
  enabled?: boolean;
}

export function useCoachesCache({ params, enabled = true }: UseCoachesCacheOptions) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCoaches = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    const cacheKey = generateCacheKey(params);

    try {
      // Try to get from cache first
      const cachedData = await getCachedCoaches(cacheKey);
      
      if (cachedData) {
        // Show cached data immediately
        setData(cachedData);
        setLoading(false);
        
        // Then fetch fresh data in background (stale-while-revalidate)
        fetch(`/api/search/coaches?${new URLSearchParams(params).toString()}`)
          .then(res => res.json())
          .then(freshData => {
            if (freshData.coaches) {
              setCachedCoaches(cacheKey, freshData.coaches);
              setData(freshData.coaches);
            }
          })
          .catch(err => {
            console.error('Background fetch failed:', err);
            // Keep using cached data
          });
      } else {
        // No cache, fetch from API
        const response = await fetch(`/api/search/coaches?${new URLSearchParams(params).toString()}`);
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch coaches');
        }

        if (result.coaches) {
          setData(result.coaches);
          // Cache for next time
          await setCachedCoaches(cacheKey, result.coaches);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [params, enabled]);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  return { data, loading, error, refetch: fetchCoaches };
}

