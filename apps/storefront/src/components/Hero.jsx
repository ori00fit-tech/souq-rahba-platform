import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Hero() {
  const { t } = useApp()

  return (
    <section className="hero-section">
      <div className="container hero-grid">
        <div>
          <span className="eyebrow">Marketplace • Morocco • Cloudflare</span>
          <h1>{t.heroTitle}</h1>
          <p>{t.heroText}</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">{t.explore}</Link>
            <Link to="/seller/dashboard" className="btn btn-secondary">{t.becomeSeller}</Link>
          </div>
          <div className="info-pill">{t.cod} • {t.freeShipping}</div>
        </div>
        <div className="hero-card">
          <div className="hero-panel">
            <strong>420+</strong>
            <span>Verified Sellers</span>
          </div>
          <div className="hero-panel">
            <strong>18k+</strong>
            <span>Products</span>
          </div>
          <div className="hero-panel">
            <strong>3</strong>
            <span>Languages</span>
          </div>
          <div className="hero-panel">
            <strong>32</strong>
            <span>Covered Cities</span>
          </div>
        </div>
      </div>
    </section>
  )
}
