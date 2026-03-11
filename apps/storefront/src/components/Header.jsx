import { Link, NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { SELLER_PORTAL_URL } from '../lib/config'

export default function Header() {
  const { t, cart, language, setLanguage, currency, setCurrency, query, setQuery } = useApp()

  return (
    <header className="site-header">
      <div className="top-strip" />
      <div className="container header-grid">
        <Link to="/" className="brand-mark">{t.brand}</Link>

        <input
          className="search-box"
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="header-actions">
          <Link to="/cart" className="cart-pill">{t.cart} ({cart.length})</Link>

          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="MAD">MAD</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>

          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="ar">AR</option>
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>

      <nav className="main-nav container">
        <NavLink to="/">{t.navHome}</NavLink>
        <NavLink to="/products">{t.navProducts}</NavLink>
        <NavLink to="/sellers">{t.navSellers}</NavLink>

        <a
          href={SELLER_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.navDashboard}
        </a>

        <NavLink to="/about">{t.navAbout}</NavLink>
        <NavLink to="/help">{t.navHelp}</NavLink>
        <NavLink to="/auth">{t.navAccount}</NavLink>
      </nav>
    </header>
  )
}
