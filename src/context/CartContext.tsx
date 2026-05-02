'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  image_url?: string
  original_price?: number | null
  description?: string | null
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e)
      }
    }
    setIsInitialized(true)
  }, [])

  // 2. Persist to LocalStorage (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items, isInitialized])

  // 3. Sync with DB: Remove deleted/hidden products
  useEffect(() => {
    if (!isInitialized || items.length === 0) return

    const syncCart = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      const productIds = items.map(item => item.id)
      const { data: availableProducts } = await supabase
        .from('products')
        .select('id, is_visible, stock')
        .in('id', productIds)

      if (availableProducts) {
        setItems(prev => prev.filter(item => {
          const product = availableProducts.find(p => p.id === item.id)
          // Remove if product doesn't exist, is hidden, or is out of stock
          return product && product.is_visible && (product.stock === null || product.stock > 0)
        }))
      }
    }

    syncCart()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized])

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id)
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      }
      return [...prev, newItem]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
