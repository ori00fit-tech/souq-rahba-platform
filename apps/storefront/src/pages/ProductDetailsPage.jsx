import { useParams } from 'react-router-dom'
import { products } from '../data/site'
import { useApp } from '../context/AppContext'

export default function ProductDetailsPage() {
  const { productId } = useParams()
  const { addToCart, t } = useApp()

  const product = products.find((p) => p.id === productId)

  if (!product) {
    return (
      <section className="container section-space">
        <h2>المنتج غير موجود</h2>
      </section>
    )
  }

  return (
    <section className="container section-space">
      <div className="dual-grid">

        <div className="panel-card">
          <div style={{height:"260px",background:"#eee",borderRadius:"12px"}} />
        </div>

        <div className="panel-card">

          <h1>{product.name}</h1>

          <p style={{opacity:0.7}}>
            {product.seller} — {product.city}
          </p>

          <div style={{margin:"1rem 0"}}>
            <strong style={{fontSize:"1.4rem"}}>
              {product.price} MAD
            </strong>

            {product.oldPrice && (
              <span style={{marginLeft:"10px",textDecoration:"line-through",opacity:0.6}}>
                {product.oldPrice}
              </span>
            )}
          </div>

          <p>{product.description}</p>

          <div style={{marginTop:"1.5rem",display:"flex",gap:"10px"}}>

            <button
              className="btn-primary"
              onClick={() => addToCart(product)}
            >
              {t.addToCart}
            </button>

            <button className="btn-outline">
              {t.buyNow}
            </button>

          </div>

          <div style={{marginTop:"1.5rem",fontSize:"0.9rem",opacity:0.7}}>
            ⭐ {product.rating} ({product.reviews} مراجعة)
          </div>

        </div>

      </div>
    </section>
  )
}
