import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiGet } from '../lib/api'
import { useApp } from '../context/AppContext'

export default function ProductDetailsPage() {
  const { productId } = useParams()
  const { addToCart, t } = useApp()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProduct() {
      try {
        setLoading(true)
        setError('')
        const result = await apiGet(`/catalog/products/${productId}`)
        if (!active) return
        setProduct(result?.data || null)
      } catch (err) {
        if (!active) return
        setError('تعذر تحميل المنتج')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProduct()
    return () => {
      active = false
    }
  }, [productId])

  if (loading) {
    return (
      <section className="container section-space">
        <div className="panel-card">
          <p>جارٍ تحميل المنتج...</p>
        </div>
      </section>
    )
  }

  if (error || !product) {
    return (
      <section className="container section-space">
        <div className="panel-card">
          <h2>المنتج غير موجود</h2>
          <p>{error || 'لم يتم العثور على المنتج المطلوب.'}</p>
        </div>
      </section>
    )
  }

  const productForCart = {
    id: product.id,
    name: product.title_ar,
    price: product.price_mad,
    seller: product.seller_id || 'Souq Rahba',
    city: '',
    rating: 0,
    reviews: 0,
    cod: true,
    stock: product.stock,
    badge: product.status,
    description: product.description_ar || '',
    slug: product.slug,
  }

  return (
    <section className="container section-space">
      <div className="dual-grid">
        <div className="panel-card">
          <div style={{ height: '260px', background: '#eee', borderRadius: '12px' }} />
        </div>

        <div className="panel-card">
          <h1>{product.title_ar}</h1>

          <p style={{ opacity: 0.7 }}>
            الفئة: {product.category_id || 'غير محددة'}
          </p>

          <div style={{ margin: '1rem 0' }}>
            <strong style={{ fontSize: '1.4rem' }}>
              {product.price_mad} MAD
            </strong>
          </div>

          <p>{product.description_ar || 'لا يوجد وصف متاح حاليًا.'}</p>

          <div style={{ marginTop: '1rem', opacity: 0.8 }}>
            <p>المخزون: {product.stock}</p>
            <p>الحالة: {product.status}</p>
            <p>الرابط: {product.slug}</p>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => addToCart(productForCart)}
            >
              {t.addToCart}
            </button>

            <button className="btn-outline">
              {t.buyNow}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
