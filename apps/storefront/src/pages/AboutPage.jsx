export default function AboutPage() {
  return (
    <section className="container section-space dual-grid">
      <div className="panel-card">
        <h1>About the project</h1>
        <p>This version follows your uploaded brief: Moroccan market focus, multilingual UX, seller workflows, COD-first operations and Cloudflare/GitHub deployment readiness.</p>
      </div>
      <div className="panel-card">
        <h3>Architecture targets</h3>
        <ul className="feature-list">
          <li>Frontend on Cloudflare Pages</li>
          <li>Pages Functions for lightweight endpoints</li>
          <li>GitHub for source control and CI</li>
          <li>Scalable path toward D1, R2, KV and Queues</li>
        </ul>
      </div>
    </section>
  )
}
