import type { PracticeEntry } from './types';
import { isPracticeEntry } from './model';

const STORE_NAME = 'entries';
const VERSION = 1;

function isDemoLocation(): boolean {
  return location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
}

function databaseName(): string {
  return isDemoLocation() ? 'demo:practice-evidence-log' : 'practice-evidence-log';
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName(), VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('practicedOn', 'practicedOn');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Local storage could not open.'));
  });
}

async function transact<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void): Promise<T> {
  const db = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    action(transaction.objectStore(STORE_NAME), resolve, reject);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => reject(transaction.error ?? new Error('Local storage operation failed.'));
  });
}

export interface StoredEntries {
  entries: PracticeEntry[];
  invalidCount: number;
}

export async function getEntries(): Promise<StoredEntries> {
  const stored = await transact<unknown[]>('readonly', (store, resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const entries = stored.filter(isPracticeEntry);
  return {
    entries: entries.sort((a, b) => b.practicedOn.localeCompare(a.practicedOn) || b.createdAt.localeCompare(a.createdAt)),
    invalidCount: stored.length - entries.length
  };
}

export function putEntry(entry: PracticeEntry): Promise<void> {
  return transact<void>('readwrite', (store, resolve, reject) => {
    const request = store.put(entry);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function deleteEntry(id: string): Promise<void> {
  return transact<void>('readwrite', (store, resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function replaceEntries(entries: PracticeEntry[]): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    entries.forEach((entry) => store.put(entry));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Import could not be saved.'));
  });
  db.close();
}

export function discardDemoDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('demo:practice-evidence-log');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Demo data could not be cleared.'));
    request.onblocked = () => reject(new Error('Close other demo tabs, then try again.'));
  });
}
