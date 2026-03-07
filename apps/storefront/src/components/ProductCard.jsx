import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatMoney } from '../lib/utils'

export default function ProductCard({ product }) {
  const { addToCart, t, currency, language } = useApp()
  const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-US'

  return (
    <article className="product-card">
      <div className="product-badge">{product.badge}</div>
      <div className="product-thumb">{product.name.charAt(0)}</div>
      <div className="product-content">
        <p className="meta">{product.seller} • {product.city}</p>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="price-row">
          <strong>{formatMoney(product.price, currency, locale)}</strong>
          <span>{formatMoney(product.oldPrice, currency, locale)}</span>
        </div>
        <div className="rating-row">⭐ {product.rating} • {product.reviews} reviews</div>
        <div className="card-actions">
          <button className="btn btn-primary" onClick={() => addToCart(product)}>{t.addToCart}</button>
          <Link className="btn btn-secondary" to={`/products/${product.id}`}>{t.buyNow}</Link>
        </div>
      </div>
    </article>
  )
}
