import ProductCard from '../components/ProductCard'
import { useApp } from '../context/AppContext'
import { categories } from '../data/site'

export default function ProductsPage() {
  const { filteredProducts, t, query } = useApp()

  return (
    <section className="container section-space">
      <div className="section-head">
        <div>
          <span className="eyebrow">{t.navProducts}</span>
          <h1>جميع المنتجات والسلع المتاحة</h1>
          <p>
            اكتشف الأجهزة، المعدات، الأدوات، المواد الغذائية، منتجات الفلاحة،
            الصيد، البناء، الأزياء، الحرف وملحقات السيارات في منصة واحدة.
          </p>
        </div>
      </div>

      <div className="chip-wrap" style={{ marginBottom: '1rem' }}>
        {categories.map((category) => (
          <span key={category.id} className="chip">
            {category.name}
          </span>
        ))}
      </div>

      <div className="panel-card" style={{ marginBottom: '1.5rem' }}>
        <strong>{filteredProducts.length}</strong>
        <span style={{ marginInlineStart: '0.5rem' }}>
          منتج مطابق لبحثك{query ? `: "${query}"` : ''}
        </span>
      </div>

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="panel-card">
            <h3>لا توجد نتائج حالياً</h3>
            <p>جرّب كلمات بحث أخرى أو تصفح الفئات المتاحة.</p>
          </div>
        )}
      </div>
    </section>
  )
}
