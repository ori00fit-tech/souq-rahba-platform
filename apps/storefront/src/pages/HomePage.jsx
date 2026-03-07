import Hero from '../components/Hero'
import StatGrid from '../components/StatGrid'
import ProductCard from '../components/ProductCard'
import { useApp } from '../context/AppContext'
import { sellers, categories } from '../data/site'

export default function HomePage() {
  const { filteredProducts, t } = useApp()

  return (
    <>
      <Hero />
      <StatGrid />
      <section className="container section-space">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t.categories}</span>
            <h2>منصة شاملة لكل أنواع السلع</h2>
          </div>
        </div>
        <div className="chip-wrap">
          {categories.map((category) => <span key={category.id} className="chip">{category.name}</span>)}
        </div>
      </section>
      <section className="container section-space">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t.featured}</span>
            <h2>منتجات جاهزة للبيع الآن</h2>
          </div>
        </div>
        <div className="product-grid">
          {filteredProducts.slice(0, 12).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
      <section className="container section-space dual-grid">
        <div className="panel-card">
          <h3>لماذا سوق رحبة</h3>
          <ul className="seller-list">
            <li><span>Marketplace متعدد البائعين</span><strong>مرن</strong></li>
            <li><span>تصنيفات عامة ومتخصصة</span><strong>شامل</strong></li>
            <li><span>دفع عند التسليم وطلبات</span><strong>MAD</strong></li>
            <li><span>جاهز لـ Cloudflare + D1</span><strong>سريع</strong></li>
          </ul>
        </div>
        <div className="panel-card">
          <h3>باعة مميزون</h3>
          <ul className="seller-list">
            {sellers.map((seller) => (
              <li key={seller.id}><span>{seller.name} — {seller.city}</span><strong>⭐ {seller.rating}</strong></li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
