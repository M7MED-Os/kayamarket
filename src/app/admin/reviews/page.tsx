import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Star } from 'lucide-react'
import { getAllStoreReviews } from '@/app/actions/reviews'
import AdminReviewsClient from './AdminReviewsClient'

export const metadata = {
  title: 'إدارة التقييمات | KayaMarket',
}

export default async function AdminReviewsPage() {
  const supabase = await createClient()
  let storeId: string

  try {
    const authData = await assertMerchant(supabase)
    storeId = authData.storeId
  } catch {
    redirect('/login')
  }

  const allReviews = await getAllStoreReviews(storeId)
  const pendingCount = allReviews.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── Header Section ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="h-8 w-1 bg-amber-500 rounded-full shrink-0" />
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">إدارة التقييمات</h1>
          
          <div className="flex items-center gap-1.5 shrink-0">
             <span className="bg-amber-500 text-white text-[9px] md:text-[10px] font-black px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                {pendingCount} معلقة
             </span>
             <span className="bg-slate-100 text-slate-500 text-[9px] md:text-[10px] font-black px-2 py-1 rounded-md border border-slate-200 whitespace-nowrap">
                {allReviews.length} إجمالي
             </span>
          </div>
        </div>
        <p className="text-slate-400 font-bold text-xs md:text-sm">تحكم في مراجعات العملاء المعروضة بمتجرك</p>
      </div>

      <AdminReviewsClient initialReviews={allReviews} />
    </div>
  )
}
