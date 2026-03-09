import { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import StatGrid from '../components/StatGrid'
import ProductCard from '../components/ProductCard'
import { useApp } from '../context/AppContext'
import { sellers, categories } from '../data/site'
import { apiGet } from '../lib/api'

export default function HomePage() {
  const { t, query } = useApp()
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await apiGet('/catalog/products')
        if (res.ok) {
          setProducts(res.data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingProducts(false)
      }
    }

    loadProducts()
  }, [])

  const q = query.toLowerCase().trim()
  const filteredProducts = !q
    ? products
    : products.filter((product) =>
        [
          product.title_ar || '',
          product.description_ar || '',
          product.slug || '',
          product.category_id || '',
          product.seller_id || ''
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)
      )

  return (
    <>
      <Hero />
      <StatGrid />

      <section className="container section-space">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t.categories}</span>
            <h2>منصة شاملة لكل أنواع السلع</h2>
            <p>
              سوق رحبة تجمع بين السلع اليومية والمعدات المهنية في منصة واحدة
              تخدم الأفراد، التجار، الحرفيين والمهنيين.
            </p>
          </div>
        </div>

        <div className="chip-wrap">
          {categories.map((category) => (
            <span key={category.id} className="chip">
              {category.name}
            </span>
          ))}
        </div>
      </section>

      <section className="container section-space">
        <div className="section-head">
          <div>
            <span className="eyebrow">{t.featured}</span>
            <h2>منتجات جاهزة للبيع الآن</h2>
            <p>عروض مختارة من مختلف الفئات داخل المنصة.</p>
          </div>
        </div>

        {loadingProducts ? (
          <p>جاري تحميل المنتجات...</p>
        ) : (
          <div className="product-grid">
            {filteredProducts.slice(0, 12).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="container section-space dual-grid">
        <div className="panel-card">
          <h3>لماذا سوق رحبة</h3>
          <ul className="seller-list">
            <li><span>منصة متعددة البائعين</span><strong>Marketplace</strong></li>
            <li><span>فئات متنوعة للأفراد والمهنيين</span><strong>شامل</strong></li>
            <li><span>منتجات استهلاكية ومهنية</span><strong>مرن</strong></li>
            <li><span>جاهز للتطوير مع Cloudflare و D1</span><strong>قابل للنمو</strong></li>
          </ul>
        </div>

        <div className="panel-card">
          <h3>باعة مميزون</h3>
          <ul className="seller-list">
            {sellers.map((seller) => (
              <li key={seller.id}>
                <span>{seller.name} — {seller.city}</span>
                <strong>⭐ {seller.rating}</strong>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
