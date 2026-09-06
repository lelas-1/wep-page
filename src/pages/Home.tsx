import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import StorefrontLayout from "../layouts/StorefrontLayout";
import Hero from "../components/hero/Hero";
import Categories from "../components/categories/Categories";
import FeaturedProducts from "../components/products/FeaturedProducts";
import About from "../components/about/About";
import Occasions from "../components/occasions/Occasions";
import Testimonials from "../components/testimonials/Testimonials";
import Contact from "../components/contact/Contact";

export default function Home() {
  const { hash } = useLocation();

  // React Router doesn't auto-scroll to an in-page hash when arriving from
  // a different route (e.g. the Product Details page's "Back to shop"
  // link) — only same-page anchor clicks get native scroll behavior.
  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <StorefrontLayout>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <About />
      <Occasions />
      <Testimonials />
      <Contact />
    </StorefrontLayout>
  );
}
