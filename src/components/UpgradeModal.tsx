'use client'

import { Rocket, X, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  limitName?: string
  limitValue?: number | string
}

export default function UpgradeModal({
  isOpen,
  onClose,
  title = 'وصلت للحد الأقصى لخطتك',
  description = 'استمتع بمميزات غير محدودة وتوسع في تجارتك عبر الترقية للباقات الاحترافية.',
  limitName = 'المنتجات',
  limitValue = ''
}: UpgradeModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
      {/* Subtle Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Simple & Compact Modal Card */}
      <div className="relative w-full max-w-[400px] bg-white rounded-[2rem] shadow-xl p-1 animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-100">
        
        <div className="relative bg-white rounded-[1.9rem] p-6 sm:p-8 flex flex-col items-center text-center">
          {/* Subtle Close Button */}
          <button 
            onClick={onClose}
            className="absolute left-4 top-4 p-1.5 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all z-20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Minimalist Icon */}
          <div className="mt-2 mb-6">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-500 border border-slate-100">
              <Rocket className="h-8 w-8" />
            </div>
          </div>

          <h2 className="text-xl font-black text-slate-900 mb-2">
            {title}
          </h2>
          
          <div className="inline-flex items-center gap-2 bg-rose-50/50 px-3 py-1 rounded-lg border border-rose-100 mb-6">
             <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
             <span className="text-[11px] font-black text-rose-600 uppercase tracking-wide">
                حد {limitName}: {limitValue}
             </span>
          </div>

          <p className="text-sm text-slate-500 font-bold leading-relaxed mb-8 px-2">
            {description}
          </p>

          <div className="flex flex-col gap-2 w-full">
            <Link
              href="/pricing"
              className="w-full bg-slate-900 text-white h-12 rounded-xl font-black transition-all hover:bg-indigo-600 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>اشترك الآن</span>
              <ArrowRight className="h-4 w-4 rotate-180 group-hover:translate-x-[-2px] transition-transform" />
            </Link>
            <button
              onClick={onClose}
              className="w-full h-10 rounded-xl font-black text-slate-400 hover:text-slate-500 text-xs transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
