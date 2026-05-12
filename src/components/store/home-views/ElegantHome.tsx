'use client'

import React from 'react'
import {
  ElegantHeader,
  ElegantHero,
  ElegantCategories,
  ElegantBestsellers,
  ElegantFeatures,
  ElegantTestimonials,
  ElegantFooter,
  ElegantFAQ
} from '@/components/store/themes/ElegantTheme'
import { KayaBadge } from '@/components/store/KayaBadge'

// ─── Announcement Bar (Shared logic but fits theme) ──────────────────────────
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

export default function ElegantHome({
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
      <ElegantHeader store={store} branding={branding} slug={slug} />
      <ElegantHero branding={branding} store={store} slug={slug} showWatermark={showWatermark} />
      <ElegantCategories categories={dbCategories || []} slug={slug} />
      <ElegantBestsellers products={productsWithRatings} slug={slug} branding={branding} />
      {sections.features && <ElegantFeatures branding={branding} />}

      {sections.testimonials && (
        <ElegantTestimonials reviews={storeReviews || []} />
      )}

      {sections.faq && <ElegantFAQ branding={branding} />}
      {sections.footer && <ElegantFooter store={store} branding={branding} showWatermark={showWatermark} />}
      
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
