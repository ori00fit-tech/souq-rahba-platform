import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import { useApp } from '../context/AppContext'

export default function Layout({ children }) {
  const { dir } = useApp()

  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = dir === 'rtl' ? 'ar' : 'en'
  }, [dir])

  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  )
}
