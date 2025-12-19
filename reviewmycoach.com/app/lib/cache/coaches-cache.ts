/**
 * IndexedDB Cache for Coaches
 * Stores coaches data locally for faster access
 */

const DB_NAME = 'reviewmycoach-cache';
const DB_VERSION = 1;
const STORE_NAME = 'coaches';
const CACHE_VERSION = 'v1';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  version: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });

  return dbPromise;
}

/**
 * Get cached coaches data
 */
export async function getCachedCoaches(cacheKey: string): Promise<any[] | null> {
  try {
    const db = await getDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(cacheKey);
      request.onsuccess = () => {
        const entry: CacheEntry | undefined = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if cache is expired or version mismatch
        const age = Date.now() - entry.timestamp;
        if (age > CACHE_TTL || entry.version !== CACHE_VERSION) {
          resolve(null);
          return;
        }

        resolve(entry.data);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

/**
 * Cache coaches data
 */
export async function setCachedCoaches(cacheKey: string, data: any[]): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const entry: CacheEntry = {
      key: cacheKey,
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
}

/**
 * Generate cache key from search params
 */
export function generateCacheKey(params: Record<string, any>): string {
  const sorted = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `coaches-${sorted}`;
}

/**
 * Clear all cached coaches
 */
export async function clearCoachesCache(): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get cache size estimate
 */
export async function getCacheSize(): Promise<number> {
  try {
    const db = await getDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const entries = request.result as CacheEntry[];
        const totalSize = entries.reduce((sum, entry) => {
          return sum + JSON.stringify(entry).length;
        }, 0);
        resolve(totalSize);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error calculating cache size:', error);
    return 0;
  }
}

