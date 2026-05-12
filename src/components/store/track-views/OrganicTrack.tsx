'use client'

import React from 'react'
import { CheckCircle, Clock, Package, PackageCheck, Star, ArrowRight, ArrowLeft, Search, Leaf } from 'lucide-react'
import { OrganicHeader, OrganicFooter } from '../themes/OrganicTheme'

interface TrackViewProps {
  slug: string; store: any; branding: any; order: any; orderId: string; setOrderId: (v: string) => void
  phone: string; setPhone: (v: string) => void; isSearching: boolean; handleSearch: (e: React.FormEvent) => void
  setOrder: (v: any) => void; STATUS_STEPS: any[]; storeRating: number; setStoreRating: (v: number) => void
  storeComment: string; setStoreComment: (v: string) => void; productReviews: any; setProductReviews: any
  isSubmitting: boolean; isSubmitted: boolean; handleCombinedReview: (e: React.FormEvent) => void
  showWatermark: boolean; commonStyles: any
}

export default function OrganicTrack({
  slug, store, branding, order, orderId, setOrderId, phone, setPhone, isSearching, handleSearch, setOrder, STATUS_STEPS,
  storeRating, setStoreRating, storeComment, setStoreComment, productReviews, setProductReviews,
  isSubmitting, isSubmitted, handleCombinedReview, showWatermark, commonStyles
}: TrackViewProps) {
  const primaryColor = branding?.primary_color || '#4A6741'
  const finalStyles = { ...commonStyles, '--primary': primaryColor, fontFamily: branding?.font_family || 'Outfit, Cairo, sans-serif' }

  return (
    <div className="min-h-screen bg-[#F9F7F2]" dir="rtl" style={finalStyles}>
      <OrganicHeader store={store} branding={branding} slug={slug} />

      <main className="pt-28 pb-24">
        <div className="max-w-3xl mx-auto px-6">

          {!order ? (
            /* ── Search Form ── */
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="h-16 w-16 bg-[var(--primary)]/10 rounded-[1.75rem] rotate-6 flex items-center justify-center text-[var(--primary)] mx-auto shadow-sm">
                  <Search className="h-8 w-8" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight">
                  أين <span className="italic text-[var(--primary)] font-serif">طلبك؟</span>
                </h1>
                <p className="text-zinc-500 font-medium">أدخل بيانات الطلب لمتابعة حالته بكل سهولة.</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSearch} className="bg-white rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-200/30 overflow-hidden">
                <div className="p-8 lg:p-12 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-[0.25em] mb-2">كود الطلب</label>
                    <input
                      value={orderId} onChange={e => setOrderId(e.target.value)}
                      className="w-full bg-[#F9F7F2] border border-zinc-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:bg-white focus:border-[var(--primary)]/40 focus:shadow-sm transition-all placeholder:text-zinc-400 uppercase tracking-wider"
                      placeholder="مثال: ABC-123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-[0.25em] mb-2">رقم الهاتف</label>
                    <input
                      value={phone} onChange={e => setPhone(e.target.value)} dir="ltr"
                      className="w-full bg-[#F9F7F2] border border-zinc-100 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:bg-white focus:border-[var(--primary)]/40 focus:shadow-sm transition-all placeholder:text-zinc-400 text-right"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </div>
                <div className="px-8 pb-8 lg:px-12 lg:pb-12">
                  <button type="submit" disabled={isSearching}
                    className="w-full h-16 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[var(--primary)] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">
                    {isSearching ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري البحث...
                      </>
                    ) : (
                      <><ArrowLeft className="h-5 w-5" /> تتبع طلبي الآن</>
                    )}
                  </button>
                </div>
              </form>
            </div>

          ) : (
            /* ── Order Found ── */
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Order header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.3em] mb-1 flex items-center gap-1">
                    <Leaf className="h-3 w-3" /> حالة الطلب
                  </p>
                  <h2 className="text-3xl font-black text-zinc-900">
                    #{order.id?.split('-')[0]?.toUpperCase()}
                  </h2>
                </div>
                <button onClick={() => setOrder(null)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-xs font-black uppercase tracking-wide hover:bg-zinc-50 transition-all shadow-sm">
                  <ArrowRight className="h-3.5 w-3.5" /> بحث جديد
                </button>
              </div>

              {/* Progress Timeline */}
              <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 lg:p-10">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.25em] mb-8">مراحل الطلب</p>

                {/* Desktop: Horizontal timeline */}
                <div className="hidden md:block relative">
                  {/* Progress line */}
                  <div className="absolute top-6 right-[10%] left-[10%] h-0.5 bg-zinc-100" />
                  {(() => {
                    const currentIdx = STATUS_STEPS.findIndex(s => s.id === (order.status === 'paid' ? 'delivered' : order.status))
                    const pct = currentIdx >= 0 ? (currentIdx / (STATUS_STEPS.length - 1)) * 100 : 0
                    return (
                      <div className="absolute top-6 right-[10%] h-0.5 bg-[var(--primary)] transition-all duration-1000"
                        style={{ width: `${pct * 0.8}%` }} />
                    )
                  })()}

                  <div className="grid grid-cols-4 gap-4 relative z-10">
                    {STATUS_STEPS.map((step, idx) => {
                      const currentIdx = STATUS_STEPS.findIndex(s => s.id === (order.status === 'paid' ? 'delivered' : order.status))
                      const isCompleted = currentIdx >= idx
                      const isCurrent = currentIdx === idx
                      const Icon = step.icon
                      return (
                        <div key={step.id} className="flex flex-col items-center text-center gap-3">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm
                            ${isCompleted ? 'bg-[var(--primary)] text-white shadow-[var(--primary)]/25' : 'bg-zinc-100 text-zinc-300'}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className={`text-xs font-black ${isCompleted ? 'text-zinc-900' : 'text-zinc-400'}`}>{step.label}</p>
                            {isCurrent && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full animate-pulse">الآن</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile: Vertical timeline */}
                <div className="md:hidden space-y-0">
                  {STATUS_STEPS.map((step, idx) => {
                    const currentIdx = STATUS_STEPS.findIndex(s => s.id === (order.status === 'paid' ? 'delivered' : order.status))
                    const isCompleted = currentIdx >= idx
                    const isCurrent = currentIdx === idx
                    const Icon = step.icon
                    return (
                      <div key={step.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                            ${isCompleted ? 'bg-[var(--primary)] text-white' : 'bg-zinc-100 text-zinc-300'}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          {idx < STATUS_STEPS.length - 1 && (
                            <div className={`w-0.5 h-8 mt-1 ${isCompleted ? 'bg-[var(--primary)]/30' : 'bg-zinc-100'}`} />
                          )}
                        </div>
                        <div className="pb-6 pt-1.5">
                          <p className={`text-sm font-black ${isCompleted ? 'text-zinc-900' : 'text-zinc-400'}`}>{step.label}</p>
                          {isCurrent && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full animate-pulse">الحالة الحالية</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-zinc-50">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-[var(--primary)]" />
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.25em]">محتويات طلبك</h3>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  {(order.order_items || []).map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center py-3 border-b border-zinc-50 last:border-0">
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-zinc-900">{item.product_name}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">الكمية: {item.quantity}</p>
                      </div>
                      <span className="font-black text-[var(--primary)]">
                        {(Number(item.product_price || item.price || 0) * Number(item.quantity || 1)).toLocaleString()} ج.م
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-8 pb-8">
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">الإجمالي النهائي</span>
                    <span className="text-3xl font-black text-zinc-900">
                      {Number(order.final_price || order.total_price || 0).toLocaleString()}
                      <span className="text-sm text-zinc-400 mr-1 font-medium">ج.م</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              {(order.status === 'delivered' || order.status === 'paid') && (
                <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 lg:p-10 space-y-10">
                  {isSubmitted ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="h-20 w-20 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-500 mx-auto">
                        <CheckCircle className="h-10 w-10" />
                      </div>
                      <h3 className="text-2xl font-black text-zinc-900">شكراً لمشاركتك!</h3>
                      <p className="text-zinc-500 font-medium">تم استلام تقييمك بنجاح.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleCombinedReview} className="space-y-8">
                      <div className="text-center">
                        <h3 className="text-2xl font-black text-zinc-900 mb-2">كيف كانت تجربتك؟</h3>
                        <p className="text-zinc-500 text-sm font-medium">رأيك يساعدنا على التحسين.</p>
                      </div>

                      {/* Store rating */}
                      <div className="space-y-4">
                        <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.25em]">تقييم تجربة المتجر</p>
                        <div className="flex gap-3 justify-center">
                          {[1,2,3,4,5].map(s => (
                            <button key={s} type="button" onClick={() => setStoreRating(s)}
                              className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-200
                                ${s <= storeRating ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/25 scale-110' : 'bg-zinc-50 text-zinc-300 hover:bg-zinc-100'}`}>
                              <Star className={`h-6 w-6 ${s <= storeRating ? 'fill-current' : ''}`} />
                            </button>
                          ))}
                        </div>
                        <textarea value={storeComment} onChange={e => setStoreComment(e.target.value)}
                          placeholder="أخبرنا عن تجربتك مع المتجر..."
                          className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-5 text-sm font-medium outline-none focus:bg-white focus:border-[var(--primary)]/30 transition-all h-28 resize-none"
                        />
                      </div>

                      {/* Product reviews */}
                      {Object.keys(productReviews).map(pid => {
                        const productItem = order.order_items?.find((i: any) => i.product_id === pid) || { product_name: order.product_name }
                        return (
                          <div key={pid} className="space-y-4 pt-6 border-t border-zinc-50">
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.25em]">تقييم: {productItem.product_name}</p>
                            <div className="flex gap-3 justify-center">
                              {[1,2,3,4,5].map(s => (
                                <button key={s} type="button"
                                  onClick={() => setProductReviews((prev: any) => ({ ...prev, [pid]: { ...prev[pid], rating: s } }))}
                                  className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-200
                                    ${s <= productReviews[pid].rating ? 'bg-amber-400 text-white shadow-lg shadow-amber-400/25 scale-110' : 'bg-zinc-50 text-zinc-300 hover:bg-zinc-100'}`}>
                                  <Star className={`h-6 w-6 ${s <= productReviews[pid].rating ? 'fill-current' : ''}`} />
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={productReviews[pid].comment}
                              onChange={e => setProductReviews((prev: any) => ({ ...prev, [pid]: { ...prev[pid], comment: e.target.value } }))}
                              placeholder="رأيك في هذا المنتج..."
                              className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-5 text-sm font-medium outline-none focus:bg-white focus:border-[var(--primary)]/30 transition-all h-24 resize-none"
                            />
                          </div>
                        )
                      })}

                      <button type="submit" disabled={isSubmitting}
                        className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[var(--primary)] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري الإرسال...</>
                        ) : 'إرسال التقييمات'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <OrganicFooter store={store} branding={branding} slug={slug} showWatermark={showWatermark} />
    </div>
  )
}
