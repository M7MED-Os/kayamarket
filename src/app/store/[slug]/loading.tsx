'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function StoreLoading() {
  const pathname = usePathname()
  const pathParts = pathname.split('/').filter(Boolean)
  const slug = pathParts[1]
  const isStoreHome = pathParts.length === 2 // /store/[slug]
  
  const [branding, setBranding] = useState<{ logo_url?: string; primary_color?: string; name?: string } | null>(null)

  useEffect(() => {
    if (!slug) return

    // Try to get from localStorage first for immediate results
    const cachedBranding = localStorage.getItem(`store_branding_${slug}`)
    if (cachedBranding) {
      try {
        setBranding(JSON.parse(cachedBranding))
      } catch (e) {}
    }

    // Fetch fresh data
    fetch(`/api/store/${slug}/branding`)
      .then(res => res.json())
      .then(data => {
        const newBranding = {
          logo_url: data.branding?.logo_url,
          primary_color: data.branding?.primary_color || '#3b82f6',
          name: data.store?.name
        }
        setBranding(newBranding)
        // Save to localStorage for next time
        localStorage.setItem(`store_branding_${slug}`, JSON.stringify(newBranding))
      })
      .catch(() => {})
  }, [slug])

  const primaryColor = branding?.primary_color || '#3b82f6'

  // --- 1. Dynamic Merchant-Branded Loader for Store Home ---
  if (isStoreHome) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6" dir="rtl">
        <div className="relative flex flex-col items-center space-y-1 animate-in fade-in zoom-in duration-1000">
          
          {/* Store Name as Logo (Typography Logo) */}
          <h1 
            className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-center" 
            style={{ color: primaryColor }}
          >
            {branding?.name || slug}
          </h1>

          {/* Welcome Message */}
          <p 
            className="text-sm md:text-base font-bold opacity-80 mb-8" 
            style={{ color: primaryColor }}
          >
            مرحباً بك في متجرنا
          </p>
          
          {/* Minimal Loading Animation */}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ backgroundColor: primaryColor }} />
            <div className="w-2.5 h-2.5 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ backgroundColor: primaryColor }} />
            <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: primaryColor }} />
          </div>

        </div>

        {/* Soft background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.03] rounded-full blur-[120px]" style={{ backgroundColor: primaryColor }} />
        </div>
      </div>
    )
  }

  // --- 2. Dynamic Skeleton for Internal Pages (Product, Cart, etc.) ---
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header Skeleton */}
      <div className="h-20 border-b border-slate-50 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
        <div className="flex gap-6">
          <div className="h-4 w-20 bg-slate-50 rounded-full animate-pulse" />
          <div className="h-4 w-20 bg-slate-50 rounded-full animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-slate-50 rounded-xl animate-pulse" />
        <div className="flex gap-4">
          <div className="h-10 w-10 bg-slate-50 rounded-full animate-pulse" />
          <div className="h-10 w-10 bg-slate-50 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
        <div className="space-y-6">
          <div className="h-8 w-1/3 bg-slate-50 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="aspect-square bg-slate-50 rounded-[2.5rem] animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundColor: primaryColor }} />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[internal_shimmer_2s_infinite]" />
             </div>
             <div className="space-y-6 py-4">
                <div className="h-10 w-3/4 bg-slate-50 rounded-xl animate-pulse" />
                <div className="h-6 w-1/4 bg-slate-50 rounded-lg animate-pulse" />
                <div className="space-y-3 pt-8">
                   <div className="h-4 w-full bg-slate-50 rounded-md animate-pulse" />
                   <div className="h-4 w-full bg-slate-50 rounded-md animate-pulse" />
                </div>
                <div className="pt-12 flex gap-4">
                   <div className="h-14 flex-1 bg-slate-50 rounded-2xl animate-pulse" />
                   <div className="h-14 w-14 bg-slate-50 rounded-2xl animate-pulse" />
                </div>
             </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes internal_shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
