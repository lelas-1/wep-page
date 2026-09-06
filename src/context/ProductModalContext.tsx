import { createContext, useContext, useState, type ReactNode } from "react";
import type { Product } from "../types/admin";

interface ProductModalContextValue {
  product: Product | null;
  open: (product: Product) => void;
  close: () => void;
}

const ProductModalContext = createContext<ProductModalContextValue | undefined>(undefined);

export function ProductModalProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  return (
    <ProductModalContext.Provider value={{ product, open: setProduct, close: () => setProduct(null) }}>
      {children}
    </ProductModalContext.Provider>
  );
}

export function useProductModal() {
  const ctx = useContext(ProductModalContext);
  if (!ctx) throw new Error("useProductModal must be used within ProductModalProvider");
  return ctx;
}
