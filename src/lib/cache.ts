/**
 * A tiny cache for "fetch the whole table" reads. Several independent
 * places in this app (storefront sections, the admin dashboard, product
 * forms, the product-details modal) each called `productService.list()` /
 * `categoryService.list()` on their own mount — meaning navigating between
 * admin pages, or just opening a product's details, re-fetched the entire
 * products/categories tables from Supabase every time, even when nothing
 * had changed since the last fetch a moment earlier.
 *
 * This factory gives each service one shared, module-level cache: the
 * first caller triggers the real fetch, every other concurrent or
 * subsequent caller gets the same in-flight promise or the cached result,
 * and any write (create/update/remove) invalidates it so the next read is
 * always fresh. No extra library, no stale-data risk within a session —
 * just no more needless duplicate round-trips for data nothing has changed.
 *
 * Optionally, pass a `storageKey` to also persist the last good snapshot
 * to localStorage. On a fresh page load (a real browser reload, not just
 * SPA navigation — where the in-memory cache above doesn't survive), the
 * very first call returns that persisted snapshot instantly instead of
 * showing a loading state, while a real fetch runs quietly in the
 * background to refresh both the in-memory cache and localStorage for
 * next time. No consumer code needs to change — `get()` still just
 * returns a Promise<T[]> either way.
 */
export function createListCache<T>(fetchAll: () => Promise<T[]>, storageKey?: string) {
  let cache: T[] | null = null;
  let inflight: Promise<T[]> | null = null;
  let hydratedFromStorage = false;

  function readStorage(): T[] | null {
    if (!storageKey || typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T[]) : null;
    } catch {
      return null; // corrupt/unavailable storage — just skip it
    }
  }

  function writeStorage(rows: T[]) {
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(rows));
    } catch {
      // storage full or unavailable — the in-memory cache still works fine
    }
  }

  function refresh(): Promise<T[]> {
    if (!inflight) {
      inflight = fetchAll()
        .then((rows) => {
          cache = rows;
          hydratedFromStorage = false;
          writeStorage(rows);
          return rows;
        })
        .finally(() => {
          inflight = null;
        });
    }
    return inflight;
  }

  return {
    async get(): Promise<T[]> {
      if (cache) {
        // If this in-memory value only ever came from localStorage (i.e.
        // we haven't confirmed it against Supabase yet this session),
        // kick off a real fetch in the background to catch up — but still
        // answer this call immediately with the cached snapshot.
        if (hydratedFromStorage) refresh();
        return cache;
      }

      const stored = readStorage();
      if (stored) {
        cache = stored;
        hydratedFromStorage = true;
        refresh(); // silently revalidate for next time
        return stored;
      }

      return refresh();
    },
    invalidate() {
      cache = null;
      hydratedFromStorage = false;
      if (storageKey && typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(storageKey);
        } catch {
          // non-fatal
        }
      }
    },
  };
}
