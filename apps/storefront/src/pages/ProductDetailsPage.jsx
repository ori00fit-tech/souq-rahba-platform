import { useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatMoney } from '../lib/utils'

export default function ProductDetailsPage() {
  const { productId } = useParams()
  const { products, addToCart, currency, language } = useApp()
  const product = products.find((item) => item.id === productId)
  const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-US'

  if (!product) return <section className="container section-space"><h1>Product not found</h1></section>

  return (
    <section className="container section-space details-grid">
      <div className="details-media">{product.name.charAt(0)}</div>
      <div className="panel-card">
        <span className="chip">{product.badge}</span>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <div className="price-row">
          <strong>{formatMoney(product.price, currency, locale)}</strong>
          <span>{formatMoney(product.oldPrice, currency, locale)}</span>
        </div>
        <ul className="feature-list">
          <li>Seller: {product.seller}</li>
          <li>City: {product.city}</li>
          <li>Stock: {product.stock}</li>
          <li>COD: {product.cod ? 'Available' : 'Unavailable'}</li>
        </ul>
        <button className="btn btn-primary" onClick={() => addToCart(product)}>Add to cart</button>
      </div>
    </section>
  )
}
