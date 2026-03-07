import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatMoney } from '../lib/utils'

export default function CartPage() {
  const { cart, removeFromCart, updateQty, total, currency, language } = useApp()
  const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-MA' : 'en-US'

  return (
    <section className="container section-space">
      <div className="section-head"><h1>Shopping cart</h1></div>
      <div className="cart-layout">
        <div className="panel-card">
          {cart.length === 0 ? <p>Your cart is empty.</p> : cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div>
                <strong>{item.name}</strong>
                <p>{formatMoney(item.price, currency, locale)}</p>
              </div>
              <div className="qty-row">
                <input type="number" min="1" value={item.qty} onChange={(e) => updateQty(item.id, Number(e.target.value))} />
                <button className="btn btn-secondary" onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <aside className="panel-card">
          <h3>Summary</h3>
          <p>Total: {formatMoney(total, currency, locale)}</p>
          <Link to="/checkout" className="btn btn-primary full-width">Proceed to checkout</Link>
        </aside>
      </div>
    </section>
  )
}
