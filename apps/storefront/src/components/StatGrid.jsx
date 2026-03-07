import { metrics } from '../data/site'

export default function StatGrid() {
  return (
    <section className="container section-space">
      <div className="stat-grid">
        {metrics.map((item) => (
          <div key={item.label} className="stat-card">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
