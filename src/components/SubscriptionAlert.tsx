'use client'

import { AlertTriangle, Clock, Zap, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SubscriptionAlertProps {
  planExpiresAt: string | null
  gracePeriodDays: number
  currentPlan: string
}

export default function SubscriptionAlert({ planExpiresAt, gracePeriodDays, currentPlan }: SubscriptionAlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!planExpiresAt || currentPlan === 'starter' || !isVisible) return null

  const now = new Date()
  const expiry = new Date(planExpiresAt)
  const graceLimit = new Date(expiry)
  graceLimit.setDate(expiry.getDate() + gracePeriodDays)

  const diffMs = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  const isExpired = now > expiry
  const isInGrace = now > expiry && now <= graceLimit
  const graceRemainingDays = Math.ceil((graceLimit.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // 1. Case: Expired and in Grace Period
  if (isInGrace) {
    return (
      <div className="relative group animate-in slide-in-from-top duration-700 mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-orange-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-white/80 backdrop-blur-xl border border-rose-100 p-4 md:p-6 rounded-[2rem] flex items-center justify-between shadow-xl shadow-rose-100/20">
          <div className="flex items-center gap-3 md:gap-5 flex-1">
             <div className="h-10 w-10 md:h-14 md:w-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center animate-pulse shrink-0 shadow-lg shadow-rose-200">
                <AlertTriangle className="h-5 w-5 md:h-7 md:w-7" />
             </div>
             <div>
                <h4 className="font-black text-sm md:text-xl text-slate-900 leading-tight">انتهى اشتراكك! فترة السماح مفعلة</h4>
                <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1">
                   متبقي <span className="text-rose-600">{graceRemainingDays} أيام</span> قبل تحويل المتجر للباقة المجانية ومسح البيانات الزائدة.
                </p>
             </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             <Link href="/admin/settings?tab=plan" className="hidden md:block bg-rose-600 text-white px-6 py-3 rounded-xl text-xs font-black hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 text-center">جدد الآن</Link>
             <button onClick={() => setIsVisible(false)} className="p-2 md:p-3 hover:bg-rose-50 text-slate-400 rounded-xl transition-all">
                <X className="h-4 w-4 md:h-5 md:w-5" />
             </button>
          </div>
        </div>
      </div>
    )
  }

  // 2. Case: 3 Days remaining in Subscription
  if (diffDays <= 3 && diffDays > 0) {
    return (
      <div className="relative group animate-in slide-in-from-top duration-700 mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-white/80 backdrop-blur-xl border border-amber-100 p-4 md:p-6 rounded-[2rem] flex items-center justify-between shadow-xl shadow-amber-100/20">
          <div className="flex items-center gap-3 md:gap-5 flex-1">
             <div className="h-10 w-10 md:h-14 md:w-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-200">
                <Clock className="h-5 w-5 md:h-7 md:w-7" />
             </div>
             <div>
                <h4 className="font-black text-sm md:text-xl text-slate-900 leading-tight">تنبيه: اقترب موعد انتهاء الاشتراك</h4>
                <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1">
                   متبقي <span className="text-amber-600">{diffDays} أيام</span> فقط. يرجى التجديد لضمان استمرارية الميزات الاحترافية.
                </p>
             </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             <Link href="/admin/settings?tab=plan" className="hidden md:block bg-amber-500 text-white px-6 py-3 rounded-xl text-xs font-black hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 text-center">تجديد الاشتراك</Link>
             <button onClick={() => setIsVisible(false)} className="p-2 md:p-3 hover:bg-amber-50 text-slate-400 rounded-xl transition-all">
                <X className="h-4 w-4 md:h-5 md:w-5" />
             </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
