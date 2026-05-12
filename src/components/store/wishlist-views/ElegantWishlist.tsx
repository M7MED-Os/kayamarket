'use client'

import React from 'react'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { ElegantHeader, ElegantFooter, ElegantProductCard } from '@/components/store/themes/ElegantTheme'
import { KayaBadge } from '@/components/store/KayaBadge'

interface WishlistViewProps {
  slug: string
  store: any
  branding: any
  items: any[]
  showWatermark: boolean
  commonStyles: any
}

export default function ElegantWishlist({
  slug,
  store,
  branding,
  items,
  showWatermark,
  commonStyles
}: WishlistViewProps) {
  return (
    <div className="min-h-screen bg-white" dir="rtl" style={commonStyles}>
      <ElegantHeader store={store} branding={branding} slug={slug} />
      <main className="mx-auto max-w-7xl px-6 py-20 relative">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="h-px w-12 bg-[var(--primary)]/30 mb-2" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">قائمتك</span>
          <h1 className="text-4xl md:text-5xl font-light text-zinc-900 tracking-tighter uppercase">المنتجات <span className="font-bold italic text-[var(--primary)]">المفضلة</span></h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-32 border border-zinc-100 bg-zinc-50/50 rounded-[3rem]">
            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
              <Heart className="h-10 w-10 text-zinc-200" />
            </div>
            <p className="text-lg font-light italic text-zinc-400 mb-8">قائمة المفضلات فارغة حالياً</p>
            <Link href={`/store/${slug}/products`} className="inline-flex bg-[var(--primary)] text-white px-12 py-5 text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-[var(--primary)]/20 rounded-2xl">
              استكشف المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
            {items.map((item) => (
              <ElegantProductCard key={item.id} product={item} slug={slug} />
            ))}
          </div>
        )}
      </main>
      <ElegantFooter store={store} branding={branding} showWatermark={showWatermark} />
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
