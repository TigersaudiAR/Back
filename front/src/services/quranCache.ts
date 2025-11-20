/**
 * Quran Data Caching Service
 * Uses IndexedDB with localStorage fallback
 */

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'QuranCache';
const DB_VERSION = 1;
const STORE_NAME = 'quran-data';
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface CachedItem<T> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
}

let db: IDBPDatabase | null = null;

/**
 * Initialize IndexedDB
 */
async function initDB(): Promise<IDBPDatabase | null> {
  if (db) return db;
  
  try {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      },
    });
    return db;
  } catch (error) {
    console.warn('Failed to initialize IndexedDB:', error);
    return null;
  }
}

/**
 * Get cached data from IndexedDB or localStorage
 */
export async function getCached<T>(key: string): Promise<T | null> {
  // Try IndexedDB first
  try {
    const database = await initDB();
    if (database) {
      const item = await database.get(STORE_NAME, key) as CachedItem<T> | undefined;
      
      if (item) {
        const now = Date.now();
        if (now - item.timestamp < item.ttl) {
          return item.data;
        } else {
          // Expired, delete it
          await database.delete(STORE_NAME, key);
        }
      }
    }
  } catch (error) {
    console.warn('IndexedDB get failed:', error);
  }
  
  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(`quran_cache_${key}`);
    if (stored) {
      const item: CachedItem<T> = JSON.parse(stored);
      const now = Date.now();
      
      if (now - item.timestamp < item.ttl) {
        return item.data;
      } else {
        localStorage.removeItem(`quran_cache_${key}`);
      }
    }
  } catch (error) {
    console.warn('localStorage get failed:', error);
  }
  
  return null;
}

/**
 * Set cached data in IndexedDB and localStorage
 */
export async function setCached<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  const item: CachedItem<T> = {
    key,
    data,
    timestamp: Date.now(),
    ttl,
  };
  
  // Try IndexedDB first
  try {
    const database = await initDB();
    if (database) {
      await database.put(STORE_NAME, item);
    }
  } catch (error) {
    console.warn('IndexedDB set failed:', error);
  }
  
  // Also save to localStorage as backup
  try {
    localStorage.setItem(`quran_cache_${key}`, JSON.stringify(item));
  } catch (error) {
    console.warn('localStorage set failed:', error);
  }
}

/**
 * Clear all cached data
 */
export async function clearCache(): Promise<void> {
  // Clear IndexedDB
  try {
    const database = await initDB();
    if (database) {
      await database.clear(STORE_NAME);
    }
  } catch (error) {
    console.warn('IndexedDB clear failed:', error);
  }
  
  // Clear localStorage
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('quran_cache_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('localStorage clear failed:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  idbCount: number;
  localStorageCount: number;
}> {
  let idbCount = 0;
  let localStorageCount = 0;
  
  try {
    const database = await initDB();
    if (database) {
      idbCount = await database.count(STORE_NAME);
    }
  } catch (error) {
    console.warn('Failed to get IDB count:', error);
  }
  
  try {
    const keys = Object.keys(localStorage);
    localStorageCount = keys.filter(k => k.startsWith('quran_cache_')).length;
  } catch (error) {
    console.warn('Failed to get localStorage count:', error);
  }
  
  return { idbCount, localStorageCount };
}
