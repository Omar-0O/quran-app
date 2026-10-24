import { SurahData } from './constants';

const memoryCache = new Map<number, SurahData>();
const pendingFetches = new Map<number, Promise<SurahData>>();
const prefetchQueue = new Set<number>();
const lastPageCache = new Map<number, number>();

const CACHE_KEY_PREFIX = 'qr_surah_cache_v2_';
const LAST_PAGE_KEY = 'qr_last_page_by_surah';

/**
 * Retrieve cached surah data synchronously from memory or browser storage.
 * Returns null if not cached yet.
 */
export function getCachedSurah(id: number): SurahData | null {
  if (!id || id < 1 || id > 114) return null;

  // 1. In-memory check (fastest, 0ms)
  const inMemory = memoryCache.get(id);
  if (inMemory) return inMemory;

  // 2. Browser storage check (localStorage / sessionStorage)
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`${CACHE_KEY_PREFIX}${id}`) || localStorage.getItem(`${CACHE_KEY_PREFIX}${id}`);
    if (raw) {
      const parsed = JSON.parse(raw) as SurahData;
      if (parsed && parsed.number === id && Array.isArray(parsed.ayahs)) {
        memoryCache.set(id, parsed);
        return parsed;
      }
    }
  } catch {
    /* ignore storage read errors */
  }

  return null;
}

/**
 * Save surah data to in-memory map and browser storage.
 */
export function storeSurah(id: number, data: SurahData): void {
  if (!data || data.number !== id) return;
  memoryCache.set(id, data);

  if (typeof window === 'undefined') return;
  try {
    const json = JSON.stringify(data);
    try {
      localStorage.setItem(`${CACHE_KEY_PREFIX}${id}`, json);
    } catch {
      // LocalStorage quota might be exceeded in private mode or full storage; fallback to sessionStorage
      try {
        sessionStorage.setItem(`${CACHE_KEY_PREFIX}${id}`, json);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore stringify error */
  }
}

/**
 * Fetch surah data with caching and request deduplication.
 * If data is already cached, returns immediately without network request.
 */
export async function loadSurah(id: number): Promise<SurahData> {
  const cached = getCachedSurah(id);
  if (cached) return cached;

  const existing = pendingFetches.get(id);
  if (existing) return existing;

  const promise = (async () => {
    const baseUrl = process.env.NEXT_PUBLIC_QURAN_CLOUD_API_URL || 'https://api.alquran.cloud/v1';
    const res = await fetch(`${baseUrl}/surah/${id}`);
    if (!res.ok) throw new Error(`تعذر الاتصال بالخادم (${res.status})`);
    const json = await res.json();
    if (json.code === 200 && json.data) {
      storeSurah(id, json.data);
      return json.data as SurahData;
    }
    throw new Error('فشل تحميل بيانات السورة.');
  })();

  pendingFetches.set(id, promise);
  try {
    return await promise;
  } finally {
    pendingFetches.delete(id);
  }
}

/**
 * Prefetch surah in the background without blocking rendering or user interaction.
 */
export function prefetchSurah(id: number): void {
  if (!id || id < 1 || id > 114) return;
  if (memoryCache.has(id) || prefetchQueue.has(id)) return;
  if (typeof window !== 'undefined' && getCachedSurah(id)) return;

  prefetchQueue.add(id);

  const runner = () => {
    loadSurah(id)
      .catch(() => {})
      .finally(() => prefetchQueue.delete(id));
  };

  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runner, { timeout: 2500 });
  } else {
    setTimeout(runner, 150);
  }
}

/**
 * Get the last read page of a specific surah in this session.
 */
export function getLastVisitedPage(surahId: number): number | null {
  if (lastPageCache.has(surahId)) {
    return lastPageCache.get(surahId)!;
  }
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(LAST_PAGE_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      if (typeof map[surahId] === 'number') {
        lastPageCache.set(surahId, map[surahId]);
        return map[surahId];
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Save the last read page of a specific surah in this session.
 */
export function saveLastVisitedPage(surahId: number, pageIndex: number): void {
  lastPageCache.set(surahId, pageIndex);
  if (typeof window === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(LAST_PAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[surahId] = pageIndex;
    sessionStorage.setItem(LAST_PAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}
