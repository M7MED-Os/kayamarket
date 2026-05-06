'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

const KayaLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} shrink-0`}>
    <path d="M15 50 C15 30.67 30.67 15 50 15 C69.33 15 85 30.67 85 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M85 50 C85 69.33 69.33 85 50 85 C30.67 85 15 69.33 15 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M30 35 L30 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M50 50 L50 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M35 30 L50 50 L65 30" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M70 35 L70 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
  </svg>
)

export default function RootLoading() {
  const pathname = usePathname()
  
  // If we are in a store route, don't show the KayaMarket loader at all
  // Let the store-specific loading handle it to avoid double UI
  if (pathname?.includes('/store/')) {
    return <div className="fixed inset-0 z-[9999] bg-white" />
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="relative flex flex-col items-center w-full max-w-sm space-y-12">
        
        {/* Brand Identity */}
        <div className="flex flex-col items-center space-y-5 animate-in fade-in zoom-in duration-700">
          <div className="flex items-center gap-4" dir="ltr">
            <div className="text-[#00a6f4] bg-white p-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,166,244,0.15)] border border-blue-50 ring-4 ring-blue-50/30">
              <KayaLogo className="h-10 w-10" />
            </div>
            <span className="text-3xl md:text-5xl font-black text-[#00a6f4] tracking-tighter whitespace-nowrap">
              Kaya<span className="font-semibold text-slate-400">Market</span>
            </span>
          </div>
          <div className="h-1 w-16 bg-[#00a6f4]/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#00a6f4] w-1/2 animate-[loading_1.5s_infinite_ease-in-out]" />
          </div>
        </div>

        {/* Messaging */}
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">جاري تحميل المنصة</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[#00a6f4] rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-[#00a6f4] rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-[#00a6f4] rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/30 rounded-full blur-[120px]" />
      </div>
    </div>
  )
}
