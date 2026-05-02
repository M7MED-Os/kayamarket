'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface WishlistItem {
  id: string
  name: string
  price: number
  image_url?: string
  sales_count?: number
}

interface WishlistContextType {
  items: WishlistItem[]
  toggleItem: (item: WishlistItem) => void
  isInWishlist: (id: string) => boolean
  totalItems: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist')
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist))
      } catch (e) {
        console.error('Failed to parse wishlist from localStorage', e)
      }
    }
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('wishlist', JSON.stringify(items))
    }
  }, [items, isInitialized])

  const toggleItem = (item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id)
      if (exists) {
        return prev.filter((i) => i.id !== item.id)
      }
      return [...prev, item]
    })
  }

  const isInWishlist = (id: string) => items.some((item) => item.id === id)

  const totalItems = items.length

  return (
    <WishlistContext.Provider value={{ items, toggleItem, isInWishlist, totalItems }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
