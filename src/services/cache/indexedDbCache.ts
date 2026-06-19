import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'lens-c';
const DB_VERSION = 1;
const METADATA_STORE = 'metadata-cache';
const IMPORT_STORE = 'imports';

let dbPromise: Promise<IDBPDatabase> | undefined;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE);
        }
        if (!db.objectStoreNames.contains(IMPORT_STORE)) {
          db.createObjectStore(IMPORT_STORE);
        }
      },
    });
  }
  return dbPromise;
}

interface CacheEntry<T> {
  value: T;
  cachedAt: number;
}

export async function getCached<T>(key: string, maxAgeMs: number): Promise<T | undefined> {
  const db = await getDb();
  const entry: CacheEntry<T> | undefined = await db.get(METADATA_STORE, key);
  if (!entry) return undefined;
  if (Date.now() - entry.cachedAt > maxAgeMs) return undefined;
  return entry.value;
}

export async function setCached<T>(key: string, value: T): Promise<void> {
  const db = await getDb();
  await db.put(METADATA_STORE, { value, cachedAt: Date.now() } satisfies CacheEntry<T>, key);
}

export async function saveImportData(source: string, data: unknown): Promise<void> {
  const db = await getDb();
  await db.put(IMPORT_STORE, data, source);
}

export async function loadImportData<T>(source: string): Promise<T | undefined> {
  const db = await getDb();
  return db.get(IMPORT_STORE, source);
}

export async function clearAllCaches(): Promise<void> {
  const db = await getDb();
  await db.clear(METADATA_STORE);
  await db.clear(IMPORT_STORE);
}
