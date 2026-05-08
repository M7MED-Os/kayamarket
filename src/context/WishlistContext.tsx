'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface WishlistItem {
  id: string
  name: string
  price: number
  image_url?: string
  original_price?: number | null
  description?: string | null
  sale_end_date?: string | null
  sales_count?: number
  store_id?: string
  variants?: any[]
}

interface WishlistContextType {
  items: WishlistItem[]
  toggleItem: (item: WishlistItem) => void
  isInWishlist: (id: string) => boolean
  totalItems: number
  isInitialized: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const params = useParams()
  const slug = params?.slug as string | undefined
  const wishlistKey = slug ? `wishlist_${slug}` : 'wishlist'

  useEffect(() => {
    const savedWishlist = localStorage.getItem(wishlistKey)
    if (savedWishlist) {
      try {
        setItems(JSON.parse(savedWishlist))
      } catch (e) {
        console.error('Failed to parse wishlist from localStorage', e)
      }
    } else {
      setItems([]) // Clear items if switching to a store with no saved wishlist
    }
    setIsInitialized(true)
  }, [wishlistKey])

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(wishlistKey, JSON.stringify(items))
    }
  }, [items, isInitialized, wishlistKey])

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
    <WishlistContext.Provider value={{ items, toggleItem, isInWishlist, totalItems, isInitialized }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
