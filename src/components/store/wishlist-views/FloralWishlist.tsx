'use client'

import React from 'react'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { FloralHeader, FloralFooter, FloralProductCard, FloralSectionTitle, PetalDeco } from '@/components/store/themes/FloralTheme'
import { KayaBadge } from '@/components/store/KayaBadge'

interface WishlistViewProps {
  slug: string
  store: any
  branding: any
  items: any[]
  showWatermark: boolean
  commonStyles: any
}

export default function FloralWishlist({
  slug,
  store,
  branding,
  items,
  showWatermark,
  commonStyles
}: WishlistViewProps) {
  return (
    <div className="min-h-screen bg-[#FAF3F0]/20" dir="rtl" style={commonStyles}>
      <FloralHeader store={store} branding={branding} slug={slug} />
      <main className="mx-auto max-w-7xl px-6 py-24 relative">
        <FloralSectionTitle title="المفضلات" subtitle="اخترتها بعناية" />

        {items.length === 0 ? (
          <div className="relative text-center py-24 bg-white rounded-[2.5rem] border border-[var(--primary)]/5 shadow-sm mt-12 overflow-hidden">
            {/* Decorative petals */}
            <PetalDeco className="absolute -top-10 -right-10 h-40 w-40 text-[var(--primary)] opacity-10 rotate-12" />
            <PetalDeco className="absolute -bottom-10 -left-10 h-32 w-32 text-[var(--primary)] opacity-5 -rotate-12" />
            <div className="relative z-10">
              <div className="h-20 w-20 bg-[var(--primary)]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-[var(--primary)] fill-[var(--primary)]/20" />
              </div>
              <p className="text-xl font-sans font-bold text-[#2B2B2B] mb-3">لم تقم بإضافة أي منتجات للمفضلة بعد</p>
              <p className="text-sm font-medium text-zinc-400 mb-8">اضغط على قلب أي منتج لحفظه هنا</p>
              <Link href={`/store/${slug}`} className="inline-flex items-center gap-2 text-sm font-bold bg-[var(--primary)] text-white px-10 py-4 rounded-full hover:bg-[var(--primary)]/90 transition-all duration-300 shadow-lg shadow-[var(--primary)]/20">
                تصفح المنتجات
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mt-12">
            {items.map((item) => (
              <FloralProductCard key={item.id} product={item} slug={slug} />
            ))}
          </div>
        )}
      </main>
      <FloralFooter store={store} branding={branding} showWatermark={showWatermark} />
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
