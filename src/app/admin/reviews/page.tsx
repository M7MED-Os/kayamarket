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
  const totalReviews = allReviews.length

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <div className="h-8 md:h-10 w-1.5 bg-sky-500 rounded-full shrink-0" />
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">إدارة التقييمات</h2>
            <div className="flex items-center gap-1.5 shrink-0">
               <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                 {pendingCount} معلقة
               </span>
               <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 whitespace-nowrap">
                 {totalReviews} إجمالي
               </span>
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl leading-relaxed">
            تحكم في مراجعات العملاء المعروضة بمتجرك.
          </p>
        </div>

      <AdminReviewsClient initialReviews={allReviews} />
    </div>
  )
}
