import { sellers } from '../data/site'

export default function SellersPage() {
  return (
    <section className="container section-space">
      <div className="section-head">
        <h1>Trusted sellers</h1>
        <p>Seller verification, ratings, city coverage and onboarding-ready layout.</p>
      </div>
      <div className="seller-grid">
        {sellers.map((seller) => (
          <article key={seller.id} className="panel-card">
            <h3>{seller.name}</h3>
            <p>{seller.city}</p>
            <p>{seller.products} products</p>
            <strong>⭐ {seller.rating}</strong>
            <span className="chip">{seller.verified ? 'Verified' : 'Pending'}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
