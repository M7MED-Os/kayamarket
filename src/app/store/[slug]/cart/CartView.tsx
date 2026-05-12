'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { useCart } from '@/context/CartContext'
import Loading from '@/app/loading'

// Dynamic Imports for Cart Views
const CartViews = {
  elegant: dynamic(() => import('@/components/store/cart-views/ElegantCart'), { loading: () => <Loading /> }),
  floral: dynamic(() => import('@/components/store/cart-views/FloralCart'), { loading: () => <Loading /> }),
  organic: dynamic(() => import('@/components/store/cart-views/OrganicCart'), { loading: () => <Loading /> }),
  default: dynamic(() => import('@/components/store/cart-views/DefaultCart'), { loading: () => <Loading /> }),
}

export default function CartView({ params, storeData, showWatermark }: { params: { slug: string }, storeData: any, showWatermark: boolean }) {
  const { slug } = params
  const { items, updateQuantity, removeItem, totalPrice, totalItems, isInitialized } = useCart()
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
    footer: true // Cart usually always shows footer unless disabled in DB
  }

  // Select the appropriate view component
  const CurrentCartView = (CartViews as any)[selectedTheme] || CartViews.default

  return (
    <CurrentCartView
      slug={slug}
      store={store}
      branding={branding}
      items={items}
      updateQuantity={updateQuantity}
      removeItem={removeItem}
      totalPrice={totalPrice}
      totalItems={totalItems}
      showWatermark={showWatermark}
      commonStyles={commonStyles}
      sections={sections}
    />
  )
}
