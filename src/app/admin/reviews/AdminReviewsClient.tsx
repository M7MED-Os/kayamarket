'use client'

import { useState } from 'react'
import { Star, MessageSquareQuote, Store, Package, CheckCircle, X, Quote, Calendar, User, Clock, Check, ThumbsUp, Trash2 } from 'lucide-react'
import ReviewActionButtons from '@/components/admin/ReviewActionButtons'
import { bulkUpdateReviewStatus } from '@/app/actions/reviews'
import toast from 'react-hot-toast'
import ConfirmModal from '@/components/admin/ConfirmModal'

export default function AdminReviewsClient({ initialReviews }: { initialReviews: any[] }) {
  const [activeTab, setActiveTab] = useState<'pending' | 'store' | 'product'>('pending')
  const [isUpdating, setIsUpdating] = useState(false)

  const [modal, setModal] = useState<{
    isOpen: boolean
    status: 'approved' | 'rejected'
  }>({ isOpen: false, status: 'approved' })

  const pendingReviews = initialReviews.filter(r => r.status === 'pending')
  const storeReviews = initialReviews.filter(r => r.status === 'approved' && !r.product_id)
  const productReviews = initialReviews.filter(r => r.status === 'approved' && r.product_id)

  const handleBulkUpdate = async () => {
    const ids = pendingReviews.map(r => r.id)
    if (ids.length === 0) return

    const status = modal.status
    setIsUpdating(true)
    const res = await bulkUpdateReviewStatus(ids, status)
    setIsUpdating(false)
    setModal({ ...modal, isOpen: false })

    if (res.success) {
      toast.success(status === 'approved' ? 'تم القبول بنجاح' : 'تم الرفض بنجاح')
    } else {
      toast.error(res.error || 'حدث خطأ')
    }
  }

  const activeReviews = activeTab === 'pending' ? pendingReviews : (activeTab === 'store' ? storeReviews : productReviews)

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20" dir="rtl">
      
      {/* ── Filter Bar & Actions (FIXED CENTERING) ───────────────────── */}
      <div className="flex flex-wrap items-center justify-center lg:justify-between gap-6">
        
        {/* Modern Tabs - Centered on Mobile */}
        <div className="flex justify-center w-full lg:w-auto">
          <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto overflow-y-hidden w-fit max-w-full shrink-0" 
               style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
             <style jsx>{`
               div::-webkit-scrollbar { display: none; }
             `}</style>
             {[
               { id: 'pending', label: 'المعلقة', count: pendingReviews.length },
               { id: 'store', label: 'المتجر', count: storeReviews.length },
               { id: 'product', label: 'المنتجات', count: productReviews.length }
             ].map((tab: any) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
                   activeTab === tab.id
                     ? 'bg-white text-slate-900 shadow-sm'
                     : 'text-slate-400 hover:text-slate-600'
                 }`}
               >
                 {tab.label}
                 {tab.count > 0 && (
                   <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeTab === tab.id ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {tab.count}
                   </span>
                 )}
               </button>
             ))}
          </div>
        </div>

        {/* Global Action Buttons - Centered on Mobile */}
        {activeTab === 'pending' && pendingReviews.length > 0 && (
          <div className="flex items-center justify-center lg:justify-end gap-2 w-full lg:w-auto">
            <button
              onClick={() => setModal({ isOpen: true, status: 'approved' })}
              disabled={isUpdating}
              className="h-10 px-6 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-50 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              قبول الجميع
            </button>
            <button
              onClick={() => setModal({ isOpen: true, status: 'rejected' })}
              disabled={isUpdating}
              className="h-10 px-5 bg-white border border-rose-100 text-rose-500 rounded-xl text-xs font-black hover:bg-rose-50 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <X className="h-3.5 w-3.5" />
              رفض الكل
            </button>
          </div>
        )}
      </div>

      {/* ── Review Grid (430px System) ───────────────────────────────── */}
      {activeReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-slate-100">
          <Star className="h-12 w-12 text-slate-100 mb-4" />
          <p className="text-slate-400 font-bold">لا توجد تقييمات حالياً في هذا القسم</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,430px),1fr))] gap-6">
          {activeReviews.map((review: any) => (
            <div key={review.id} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all flex flex-col group overflow-hidden">
                
                {/* Card Header: Context & Actions */}
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between gap-4">
                  {review.product_id ? (
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                        {review.products?.image_url ? (
                          <img src={review.products.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-4 w-4 text-slate-200 m-auto" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] font-black text-sky-500 uppercase tracking-widest block mb-0.5 text-right">تقييم منتج</span>
                        <h4 className="text-[11px] font-black text-slate-700 truncate text-right">{review.products?.name}</h4>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block mb-0.5 text-right">المتجر</span>
                        <h4 className="text-[11px] font-black text-slate-700 text-right">تجربة المتجر</h4>
                      </div>
                    </div>
                  )}

                  <div className="shrink-0">
                    <ReviewActionButtons reviewId={review.id} status={review.status} />
                  </div>
                </div>

                {/* Card Body: Stars & Content */}
                <div className="p-8 flex-1 space-y-6">
                  <div className="flex gap-1 text-amber-400 justify-end">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`h-4.5 w-4.5 ${star <= review.rating ? 'fill-current' : 'text-slate-100'}`} strokeWidth={3} />
                    ))}
                  </div>
                  <div className="relative">
                    {review.comment ? (
                      <p className="text-base font-bold text-slate-600 leading-relaxed text-right">{review.comment}</p>
                    ) : (
                      <p className="text-sm text-slate-300 italic font-medium text-right">ترك العميل تقييماً بالنجوم فقط...</p>
                    )}
                  </div>
                </div>

                {/* Card Footer: User & Date */}
                <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 leading-none truncate text-right">{review.customer_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300 text-[10px] font-black font-inter shrink-0">
                    <Calendar className="h-3 w-3" />
                    <span className="whitespace-nowrap">
                      {new Date(review.created_at).toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={handleBulkUpdate}
        isLoading={isUpdating}
        title={modal.status === 'approved' ? 'قبول جميع التقييمات' : 'رفض وحذف التقييمات'}
        description={
          modal.status === 'approved'
            ? `هل أنت متأكد من قبول جميع التقييمات المعلقة؟`
            : `سيتم حذف جميع التقييمات المعلقة نهائياً.`
        }
        variant={modal.status === 'approved' ? 'primary' : 'danger'}
        confirmText={modal.status === 'approved' ? 'نعم، قبول الكل' : 'نعم، حذف الكل'}
      />
    </div>
  )
}
