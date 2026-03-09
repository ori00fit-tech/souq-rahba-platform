import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from '../data/site'
import { apiGet } from '../lib/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [language, setLanguage] = useState('ar')
  const [currency, setCurrency] = useState('MAD')
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const t = translations[language]
  const dir = language === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    async function loadCurrentUser() {
      const token = localStorage.getItem("auth_token")

      if (!token) {
        setAuthLoading(false)
        return
      }

      try {
        const res = await apiGet("/auth/me")
        if (res.ok) {
          setCurrentUser(res.data)
        }
      } catch (err) {
        console.error(err)
        localStorage.removeItem("auth_token")
        setCurrentUser(null)
      } finally {
        setAuthLoading(false)
      }
    }

    loadCurrentUser()
  }, [])

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [
        ...current,
        {
          ...product,
          qty: 1
        }
      ]
    })
  }

  const removeFromCart = (productId) =>
    setCart((current) => current.filter((item) => item.id !== productId))

  const updateQty = (productId, qty) =>
    setCart((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, qty: Math.max(1, qty) } : item
      )
    )

  const clearCart = () => setCart([])

  const loginUser = async (token) => {
    localStorage.setItem("auth_token", token)
    const res = await apiGet("/auth/me")
    if (res.ok) {
      setCurrentUser(res.data)
    }
  }

  const logoutUser = () => {
    localStorage.removeItem("auth_token")
    setCurrentUser(null)
  }

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0),
    [cart]
  )

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
    clearCart,
    total,
    query,
    setQuery,
    currentUser,
    authLoading,
    loginUser,
    logoutUser
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
