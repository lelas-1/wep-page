import type { ReactNode } from "react";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import ProductDetailsModal from "../components/product-details/ProductDetailsModal";
import { ProductModalProvider } from "../context/ProductModalContext";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <ProductModalProvider>
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
      <ProductDetailsModal />
    </ProductModalProvider>
  );
}
