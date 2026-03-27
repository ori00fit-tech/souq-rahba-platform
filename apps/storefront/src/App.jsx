import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import SellersPage from "./pages/SellersPage";
import SellerStorePage from "./pages/SellerStorePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import BuyerOrdersPage from "./pages/BuyerOrdersPage";
import BuyerOrderDetailsPage from "./pages/BuyerOrderDetailsPage";
import AboutPage from "./pages/AboutPage";
import HelpPage from "./pages/HelpPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import AuthPage from "./pages/AuthPage";
import ShowcasePage from "./pages/ShowcasePage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailsPage />} />
        <Route path="/sellers" element={<SellersPage />} />
        <Route path="/sellers/:slug" element={<SellerStorePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/my-orders" element={<BuyerOrdersPage />} />
        <Route path="/my-orders/:id" element={<BuyerOrderDetailsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/showcase" element={<ShowcasePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
