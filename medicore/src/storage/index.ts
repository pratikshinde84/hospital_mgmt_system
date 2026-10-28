import { STORAGE_KEYS } from '../types';

// ============================================================
// Generic Storage Utilities
// ============================================================

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[Storage] Failed to read key "${key}". Returning default.`);
    return defaultValue;
  }
}

export function setStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      console.error('[Storage] localStorage quota exceeded.');
    } else {
      console.error('[Storage] Failed to write:', err);
    }
    return false;
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn(`[Storage] Failed to remove key "${key}".`);
  }
}

export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeStorage(key);
  });
}

// ============================================================
// CRUD Helpers
// ============================================================

export function getAll<T extends { id: string }>(key: string): T[] {
  return getStorage<T[]>(key, []);
}

export function getById<T extends { id: string }>(key: string, id: string): T | undefined {
  const items = getAll<T>(key);
  return items.find((item) => item.id === id);
}

export function create<T extends { id: string }>(key: string, item: T): T {
  const items = getAll<T>(key);
  items.push(item);
  setStorage(key, items);
  return item;
}

export function update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
  const items = getAll<T>(key);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() } as T;
  setStorage(key, items);
  return items[index];
}

export function remove<T extends { id: string }>(key: string, id: string): boolean {
  const items = getAll<T>(key);
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  setStorage(key, filtered);
  return true;
}

export function findWhere<T extends { id: string }>(
  key: string,
  predicate: (item: T) => boolean
): T[] {
  return getAll<T>(key).filter(predicate);
}

// ============================================================
// ID Generation
// ============================================================

export function generateId(prefix = 'id'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
}

// ============================================================
// Storage Event Dispatcher (cross-tab sync)
// ============================================================

export function dispatchStorageEvent(key: string): void {
  try {
    const event = new StorageEvent('storage', {
      key,
      newValue: localStorage.getItem(key),
      storageArea: localStorage,
    });
    window.dispatchEvent(event);
  } catch {
    // ignore
  }
}
