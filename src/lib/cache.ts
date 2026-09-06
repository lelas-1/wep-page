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
 * always fresh. No extra library, no stale-data risk — just no more
 * needless duplicate round-trips for data nothing has changed.
 */
export function createListCache<T>(fetchAll: () => Promise<T[]>) {
  let cache: T[] | null = null;
  let inflight: Promise<T[]> | null = null;

  return {
    async get(): Promise<T[]> {
      if (cache) return cache;
      if (!inflight) {
        inflight = fetchAll()
          .then((rows) => {
            cache = rows;
            return rows;
          })
          .finally(() => {
            inflight = null;
          });
      }
      return inflight;
    },
    invalidate() {
      cache = null;
    },
  };
}
