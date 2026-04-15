import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const HomePage = lazy(() => import("./pages/HomePage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const SellersPage = lazy(() => import("./pages/SellersPage"));
const SellerStorePage = lazy(() => import("./pages/SellerStorePage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const BuyerOrdersPage = lazy(() => import("./pages/BuyerOrdersPage"));
const BuyerOrderDetailsPage = lazy(() => import("./pages/BuyerOrderDetailsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ShowcasePage = lazy(() => import("./pages/ShowcasePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const GuestTrackPage = lazy(() => import("./pages/GuestTrackPage"));

function PageLoader() {
  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="loading-state">جاري تحميل الصفحة...</div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailsPage />} />
          <Route path="/sellers" element={<SellersPage />} />
          <Route path="/sellers/:slug" element={<SellerStorePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          <Route
            path="/my-orders"
            element={
              <ProtectedRoute allowRoles={["buyer", "admin"]}>
                <BuyerOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders/:id"
            element={
              <ProtectedRoute allowRoles={["buyer", "admin"]}>
                <BuyerOrderDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/track/:orderNumber" element={<GuestTrackPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
