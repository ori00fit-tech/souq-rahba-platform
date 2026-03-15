import { useEffect, useState } from "react";
import PromoHero from "../components/marketplace/PromoHero";
import CategoryGrid from "../components/marketplace/CategoryGrid";
import FeaturedProductsSection from "../components/marketplace/FeaturedProductsSection";
import SellerSpotlightSection from "../components/marketplace/SellerSpotlightSection";
import TrustSection from "../components/marketplace/TrustSection";
import SellCTA from "../components/marketplace/SellCTA";

const API_BASE_URL = "https://api.rahba.site";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [homeData, setHomeData] = useState({
    categories: [],
    featured_products: [],
    featured_sellers: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function loadHome() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE_URL}/catalog/home`);
        const json = await res.json();

        if (!res.ok || !json?.ok) {
          throw new Error(json?.message || "Failed to load homepage data");
        }

        if (!cancelled) {
          setHomeData({
            categories: json.data?.categories || [],
            featured_products: json.data?.featured_products || [],
            featured_sellers: json.data?.featured_sellers || [],
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "حدث خطأ أثناء تحميل الصفحة الرئيسية");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHome();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="container section-space">
      <div style={{ display: "grid", gap: "28px" }}>
        <PromoHero />

        {loading ? (
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #ddd5c2",
              borderRadius: "18px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            جاري تحميل الصفحة الرئيسية...
          </div>
        ) : error ? (
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #f5c2c7",
              color: "#842029",
              borderRadius: "18px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        ) : (
          <>
            <CategoryGrid categories={homeData.categories} />
            <FeaturedProductsSection products={homeData.featured_products} />
            <SellerSpotlightSection sellers={homeData.featured_sellers} />
          </>
        )}

        <TrustSection />
        <SellCTA />
      </div>
    </section>
  );
}
