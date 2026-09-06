import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import Settings from "./pages/admin/Settings";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SettingsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="products/new" element={<AddProduct />} />
                <Route path="products/:id/edit" element={<EditProduct />} />
                <Route path="categories" element={<Categories />} />
                <Route path="orders" element={<Orders />} />
                <Route path="customers" element={<Customers />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
          </SettingsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
