import ProductCard from '../components/ProductCard'
import { useApp } from '../context/AppContext'

export default function ProductsPage() {
  const { filteredProducts, t } = useApp()

  return (
    <section className="container section-space">
      <div className="section-head">
        <h1>{t.navProducts}</h1>
        <p>{t.filters}: search, category-ready, price-ready, COD-ready.</p>
      </div>
      <div className="product-grid">
        {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  )
}
