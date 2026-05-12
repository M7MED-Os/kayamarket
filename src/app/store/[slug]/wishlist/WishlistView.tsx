'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { useWishlist } from '@/context/WishlistContext'
import Loading from '@/app/loading'

// Dynamic Imports for Wishlist Views
const WishlistViews = {
  elegant: dynamic(() => import('@/components/store/wishlist-views/ElegantWishlist'), { loading: () => <Loading /> }),
  floral: dynamic(() => import('@/components/store/wishlist-views/FloralWishlist'), { loading: () => <Loading /> }),
  organic: dynamic(() => import('@/components/store/wishlist-views/OrganicWishlist'), { loading: () => <Loading /> }),
  default: dynamic(() => import('@/components/store/wishlist-views/DefaultWishlist'), { loading: () => <Loading /> }),
}

export default function WishlistView({ params, storeData, showWatermark }: { params: { slug: string }, storeData: any, showWatermark?: boolean }) {
  const { slug } = params
  const { items, isInitialized } = useWishlist()
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => { setMounted(true) }, [])

  if (!storeData?.store) return <div className="min-h-screen flex items-center justify-center font-black text-2xl">المتجر غير موجود</div>
  if (!mounted || !isInitialized) return null

  const { store, branding } = storeData
  const selectedTheme = (branding as any)?.selected_theme || 'default'
  const commonStyles = {
    '--primary': branding?.primary_color || '#e11d48',
    '--secondary': branding?.secondary_color || '#f8fafc',
    'fontFamily': branding?.font_family || 'Cairo'
  }

  // Pre-calculate sections
  const sections = {
    footer: true
  }

  // Select the appropriate view component
  const CurrentWishlistView = (WishlistViews as any)[selectedTheme] || WishlistViews.default

  return (
    <CurrentWishlistView
      slug={slug}
      store={store}
      branding={branding}
      items={items}
      showWatermark={!!showWatermark}
      commonStyles={commonStyles}
      sections={sections}
    />
  )
}
