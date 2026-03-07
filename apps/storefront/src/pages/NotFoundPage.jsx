import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="container section-space panel-card">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/" className="btn btn-primary">Return home</Link>
    </section>
  )
}
