export default function CheckoutPage() {
  return (
    <section className="container section-space checkout-grid">
      <div className="panel-card">
        <h1>Checkout</h1>
        <div className="form-grid">
          <input placeholder="Full name" />
          <input placeholder="Phone" />
          <input placeholder="City" />
          <input placeholder="Address" />
          <select>
            <option>Cash on delivery</option>
            <option>Card payment</option>
            <option>Bank transfer</option>
          </select>
          <select>
            <option>Standard shipping</option>
            <option>Express shipping</option>
          </select>
          <textarea placeholder="Notes for delivery" rows="4" />
        </div>
      </div>
      <div className="panel-card">
        <h3>Compliance reminders</h3>
        <ul className="feature-list">
          <li>Right of withdrawal policy</li>
          <li>Invoice generation workflow</li>
          <li>Seller responsibility and return rules</li>
          <li>Privacy notice and cookie consent</li>
        </ul>
        <button className="btn btn-primary full-width">Place order</button>
      </div>
    </section>
  )
}
