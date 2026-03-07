import { useApp } from '../context/AppContext'

export default function Footer() {
  const { t } = useApp()

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>Souq Rahba</h3>
          <p>{t.footer}</p>
        </div>
        <div>
          <h4>Marketplace</h4>
          <ul>
            <li>Multi-vendor</li>
            <li>COD ready</li>
            <li>Cloudflare Pages</li>
          </ul>
        </div>
        <div>
          <h4>Compliance</h4>
          <ul>
            <li>Privacy & cookies</li>
            <li>Invoice workflow</li>
            <li>Seller onboarding</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
