import PromoHero from "../components/marketplace/PromoHero";
import CategoryGrid from "../components/marketplace/CategoryGrid";
import TrustSection from "../components/marketplace/TrustSection";
import SellCTA from "../components/marketplace/SellCTA";

export default function HomePage() {
  return (
    <section className="container section-space">
      <div style={{ display: "grid", gap: "28px" }}>
        <PromoHero />
        <CategoryGrid />
        <TrustSection />
        <SellCTA />
      </div>
    </section>
  );
}
