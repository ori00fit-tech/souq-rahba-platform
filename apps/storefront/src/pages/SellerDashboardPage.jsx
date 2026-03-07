export default function SellerDashboardPage() {
  const cards = [
    ['Revenue', '124,000 MAD'],
    ['Orders', '382'],
    ['Pending payout', '18,400 MAD'],
    ['Return rate', '2.3%'],
  ]

  return (
    <section className="container section-space">
      <div className="section-head">
        <h1>Seller dashboard</h1>
        <p>واجهة جاهزة كبداية لمنتجات، طلبات، مدفوعات، وفوترة.</p>
      </div>
      <div className="stat-grid">
        {cards.map(([label, value]) => (
          <div key={label} className="stat-card">
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="dual-grid">
        <div className="panel-card">
          <h3>Workflow</h3>
          <ul className="feature-list">
            <li>Product creation and moderation</li>
            <li>Inventory sync</li>
            <li>Order packing and shipping</li>
            <li>Invoice and payout generation</li>
          </ul>
        </div>
        <div className="panel-card">
          <h3>Next integrations</h3>
          <ul className="feature-list">
            <li>CMI / local payment gateway</li>
            <li>Shipping carrier adapter</li>
            <li>KYC document verification</li>
            <li>Fraud and COD risk scoring</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
