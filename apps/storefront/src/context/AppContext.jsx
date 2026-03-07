import { createContext, useContext, useMemo, useState } from 'react'
import { products as initialProducts, translations } from '../data/site'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [language, setLanguage] = useState('ar')
  const [currency, setCurrency] = useState('MAD')
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')

  const t = translations[language]
  const dir = language === 'ar' ? 'rtl' : 'ltr'

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...current, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (productId) => setCart((current) => current.filter((item) => item.id !== productId))
  const updateQty = (productId, qty) => setCart((current) => current.map((item) => item.id === productId ? { ...item, qty: Math.max(1, qty) } : item))

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart])

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return initialProducts
    return initialProducts.filter((product) =>
      [product.name, product.enName, product.seller, product.city, product.category].join(' ').toLowerCase().includes(q)
    )
  }, [query])

  const value = {
    t,
    dir,
    language,
    setLanguage,
    currency,
    setCurrency,
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    total,
    query,
    setQuery,
    filteredProducts,
    products: initialProducts,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
