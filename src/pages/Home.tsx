import Navbar from "../components/navbar/Navbar";
import Hero from "../components/hero/Hero";
import Categories from "../components/categories/Categories";
import FeaturedProducts from "../components/products/FeaturedProducts";
import About from "../components/about/About";
import Occasions from "../components/occasions/Occasions";
import Testimonials from "../components/testimonials/Testimonials";
import Contact from "../components/contact/Contact";
import Footer from "../components/footer/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <FeaturedProducts />
        <About />
        <Occasions />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
