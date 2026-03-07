import { Link, NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'

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
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="ar">AR</option>
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="MAD">MAD</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
          <Link to="/cart" className="cart-pill">{t.cart} ({cart.length})</Link>
        </div>
      </div>
      <nav className="main-nav container">
        <NavLink to="/">{t.navHome}</NavLink>
        <NavLink to="/products">{t.navProducts}</NavLink>
        <NavLink to="/sellers">{t.navSellers}</NavLink>
        <NavLink to="/seller/dashboard">{t.navDashboard}</NavLink>
        <NavLink to="/about">{t.navAbout}</NavLink>
        <NavLink to="/help">{t.navHelp}</NavLink>
        <NavLink to="/auth">Login</NavLink>
      </nav>
    </header>
  )
}
