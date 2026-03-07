export default function AuthPage() {
  return (
    <section className="container section-space auth-grid">
      <div className="panel-card">
        <h1>Buyer login</h1>
        <div className="form-grid">
          <input placeholder="Email" />
          <input placeholder="Password" type="password" />
          <button className="btn btn-primary">Login</button>
        </div>
      </div>
      <div className="panel-card">
        <h1>Seller registration</h1>
        <div className="form-grid">
          <input placeholder="Business name" />
          <input placeholder="ICE / RC / IF" />
          <input placeholder="Phone" />
          <button className="btn btn-secondary">Start onboarding</button>
        </div>
      </div>
    </section>
  )
}
