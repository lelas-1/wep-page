import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AdminSearchContextValue {
  query: string;
  setQuery: (q: string) => void;
  placeholder: string;
  setPlaceholder: (p: string) => void;
}

const AdminSearchContext = createContext<AdminSearchContextValue | undefined>(undefined);

export function AdminSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState("");

  return (
    <AdminSearchContext.Provider value={{ query, setQuery, placeholder, setPlaceholder }}>
      {children}
    </AdminSearchContext.Provider>
  );
}

export function useAdminSearch() {
  const ctx = useContext(AdminSearchContext);
  if (!ctx) throw new Error("useAdminSearch must be used within AdminSearchProvider");
  return ctx;
}

/**
 * Convenience hook for a page: shows the Topbar search box with the given
 * placeholder while mounted, and returns the live query string. The
 * placeholder updates freely (e.g. on language change) without touching
 * the query itself; the query only resets when the page actually unmounts
 * (navigating away), not on every re-render.
 */
export function usePageSearch(placeholder: string): [string, (q: string) => void] {
  const { query, setQuery, setPlaceholder } = useAdminSearch();

  useEffect(() => {
    setPlaceholder(placeholder);
  }, [placeholder, setPlaceholder]);

  useEffect(() => {
    return () => {
      setPlaceholder("");
      setQuery("");
    };
    // Intentionally empty deps: this cleanup should only fire once, when
    // the page truly unmounts — not on every placeholder/query change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [query, setQuery];
}
