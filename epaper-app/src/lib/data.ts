export interface NewspaperPage {
  pageNumber: number;
  imageUrl: string;
}

export interface Newspaper {
  id?: string;
  date: string; // YYYY-MM-DD
  pages: NewspaperPage[];
}

export const initialPapers: Newspaper[] = [
  {
    id: "1",
    date: "2026-07-21",
    pages: [
      { pageNumber: 1, imageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop" },
      { pageNumber: 2, imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop" },
      { pageNumber: 3, imageUrl: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=1200&auto=format&fit=crop" }
    ]
  }
];

// --- INDEXEDDB UNLIMITED STORAGE FUNCTIONS --- //

const DB_NAME = 'EpaperDB';
const STORE_NAME = 'newspapers';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'date' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Save Heavy Newspaper Images
export const savePaperToDB = async (paperData: { date: string; pages: { pageNumber: number; imageUrl: string }[] }) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(paperData);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// Fetch Paper By Date
export const getPaperFromDB = async (date: string): Promise<any> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(date);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get All Uploaded Papers List
export const getAllPapersFromDB = async (): Promise<Newspaper[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

// Delete Paper By Date
export const deletePaperFromDB = async (date: string): Promise<boolean> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(date);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(false);
  });
};