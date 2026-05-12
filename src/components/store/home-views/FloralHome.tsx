'use client'

import React from 'react'
import {
  FloralHeader,
  FloralHero,
  FloralCategories,
  FloralFeatures,
  FloralBestsellers,
  FloralTestimonials,
  FloralFAQ,
  FloralFooter
} from '@/components/store/themes/FloralTheme'
import { KayaBadge } from '@/components/store/KayaBadge'

// ─── Announcement Bar ──────────────────────────────────────────────────────────
function AnnouncementBar({ text, branding }: { text: string; branding: any }) {
  return (
    <div className="relative group overflow-hidden border-b border-white/10" style={{ backgroundColor: branding?.primary_color || '#18181b' }}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      <div className="mx-auto max-w-7xl px-4 py-2.5 md:py-3 flex items-center justify-center gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </div>
        </div>
        <p className="text-white text-[10px] md:text-[13px] font-black tracking-wide text-center drop-shadow-sm">
          {text}
        </p>
      </div>
    </div>
  )
}

interface HomeViewProps {
  store: any
  branding: any
  slug: string
  dbCategories: any[]
  productsWithRatings: any[]
  storeReviews: any[]
  showWatermark: boolean
  commonStyles: any
  sections: any
}

export default function FloralHome({
  store,
  branding,
  slug,
  dbCategories,
  productsWithRatings,
  storeReviews,
  showWatermark,
  commonStyles,
  sections
}: HomeViewProps) {
  return (
    <div className="min-h-screen bg-white" dir="rtl" style={commonStyles}>
      {sections.announcement && (branding?.announcement_enabled === true || branding?.announcement_enabled === 'true') && (
        <AnnouncementBar text={branding?.announcement_text || ''} branding={branding} />
      )}
      <FloralHeader store={store} branding={branding} slug={slug} />
      <FloralHero branding={branding} store={store} slug={slug} showWatermark={showWatermark} />
      {sections.categories && <FloralCategories categories={dbCategories || []} slug={slug} />}

      {sections.bestsellers && <FloralBestsellers products={productsWithRatings} slug={slug} />}

      {sections.features && <FloralFeatures branding={branding} />}
      {sections.testimonials && <FloralTestimonials reviews={storeReviews || []} />}
      {sections.faq && <FloralFAQ branding={branding} />}
      {sections.footer && <FloralFooter store={store} branding={branding} showWatermark={showWatermark} />}
      
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
