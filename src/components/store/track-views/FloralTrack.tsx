'use client'

import React from 'react'
import { CheckCircle, Clock, Package, PackageCheck, Star, ArrowRight } from 'lucide-react'
import { FloralHeader, FloralFooter } from '@/components/store/themes/FloralTheme'
import { KayaBadge } from '@/components/store/KayaBadge'

interface TrackViewProps {
  slug: string
  store: any
  branding: any
  order: any
  orderId: string
  setOrderId: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  isSearching: boolean
  handleSearch: (e: React.FormEvent) => void
  setOrder: (v: any) => void
  STATUS_STEPS: any[]
  storeRating: number
  setStoreRating: (v: number) => void
  storeComment: string
  setStoreComment: (v: string) => void
  productReviews: any
  setProductReviews: any
  isSubmitting: boolean
  isSubmitted: boolean
  handleCombinedReview: (e: React.FormEvent) => void
  showWatermark: boolean
  commonStyles: any
}

export default function FloralTrack({
  slug, store, branding, order, orderId, setOrderId, phone, setPhone, isSearching, handleSearch, setOrder, STATUS_STEPS,
  storeRating, setStoreRating, storeComment, setStoreComment, productReviews, setProductReviews, isSubmitting, isSubmitted, handleCombinedReview,
  showWatermark, commonStyles
}: TrackViewProps) {
  return (
    <div className="min-h-screen bg-[#FAF3F0]/20" dir="rtl" style={commonStyles}>
      <FloralHeader store={store} branding={branding} slug={slug} />
      <main className="mx-auto max-w-4xl px-6 py-24 relative">
        {!order ? (
          <div className="max-w-md mx-auto space-y-10 p-10 bg-white rounded-[2.5rem] border border-[var(--primary)]/10 shadow-sm">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-sans font-black text-[#2B2B2B]">أين طلبي؟</h1>
              <p className="text-sm font-medium text-zinc-500">ادخل بيانات طلبك لنخبرك بحالة طلبك</p>
            </div>
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-600">كود الطلب</label>
                <input value={orderId} onChange={e => setOrderId(e.target.value)} className="w-full bg-[#FAF3F0]/40 border border-[var(--primary)]/10 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all uppercase placeholder:text-zinc-400" placeholder="مثال: ABC-123" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-600">رقم الهاتف</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[#FAF3F0]/40 border border-[var(--primary)]/10 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all text-right placeholder:text-zinc-400" dir="ltr" placeholder="01234567890" />
              </div>
              <button type="submit" disabled={isSearching} className="w-full h-14 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-[var(--primary)]/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50">
                {isSearching ? 'جاري البحث...' : 'تتبع طلبي'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 bg-white p-8 md:p-12 rounded-[2.5rem] border border-[var(--primary)]/10 shadow-sm">
            <div className="flex flex-col items-center md:flex-row justify-between md:items-end gap-6 border-b border-[var(--primary)]/10 pb-8 text-center md:text-right">
              <div className="space-y-2">
                <h2 className="text-3xl font-sans font-black text-[#2B2B2B]">حالة طلبك</h2>
                <p className="text-sm font-bold text-zinc-400 uppercase">كود: {order.id.split('-')[0].toUpperCase()}</p>
              </div>
              <button onClick={() => setOrder(null)} className="text-sm font-bold text-[var(--primary)] flex items-center justify-center gap-2 hover:opacity-80 transition-opacity bg-[var(--primary)]/5 px-6 py-3 rounded-full w-full md:w-auto">
                <ArrowRight className="h-4 w-4" /> تتبع طلب آخر
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {STATUS_STEPS.map((step, idx) => {
                const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === (order.status === 'paid' ? 'delivered' : order.status))
                const isCompleted = currentStepIndex >= idx
                const isCurrent = currentStepIndex === idx
                return (
                  <div key={step.id} className={`p-4 rounded-2xl border ${isCompleted ? 'bg-[var(--primary)]/5 border-[var(--primary)]/10' : 'bg-zinc-50/50 border-zinc-100'} transition-colors duration-500`}>
                    <div className="flex flex-col items-center text-center gap-3">
                      <step.icon className={`h-6 w-6 ${isCompleted ? 'text-[var(--primary)]' : 'text-zinc-300'}`} />
                      <div>
                        <span className={`text-sm font-bold block ${isCompleted ? 'text-[#2B2B2B]' : 'text-zinc-400'}`}>{step.label}</span>
                        {isCurrent && <span className="text-xs text-[var(--primary)] font-bold animate-pulse mt-1 block">الحالة الحالية</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-[#FAF3F0]/20 rounded-2xl p-8 space-y-8 border border-[var(--primary)]/10">
              <h3 className="text-lg font-sans font-bold text-[#2B2B2B] border-b border-[var(--primary)]/10 pb-4">تفاصيل الطلب</h3>
              <div className="space-y-4">
                {(order.order_items || []).map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-[var(--primary)]/10">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#2B2B2B]">{item.product_name}</p>
                      <p className="text-xs text-zinc-500 font-medium">الكمية: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-black text-[var(--primary)] shrink-0">{(Number(item.product_price || item.unit_price || item.price || 0) * Number(item.quantity || 1)).toLocaleString()} ج.م</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center text-center md:flex-row md:text-right justify-between gap-6 pt-6 border-t border-[var(--primary)]/10">
                <div className="space-y-3">
                  {Number(order.shipping_cost || 0) > 0 && (
                    <div className="flex justify-between items-center text-zinc-400 text-xs font-bold">
                      <span>تكلفة التوصيل:</span>
                      <span>{Number(order.shipping_cost).toLocaleString()} ج.م</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-zinc-500">الإجمالي النهائي</span>
                    <p className="text-4xl font-black text-[var(--primary)]">{Number(order.final_price || order.total_price || 0).toLocaleString()} ج.م</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-bold text-zinc-500">تاريخ الطلب</span>
                  <p className="text-sm font-bold text-[#2B2B2B]">{new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {(order.status === 'delivered' || order.status === 'paid') && (
              <div className="pt-16 border-t border-[var(--primary)]/10 space-y-12">
                <div className="text-center space-y-4">
                  <h3 className="text-3xl font-sans font-black text-[#2B2B2B]">هل نالت منتجاتنا إعجابك؟</h3>
                  <p className="text-zinc-500">رأيك يساعدنا في تقديم الأفضل دائماً</p>
                </div>

                {isSubmitted ? (
                  <div className="text-center p-12 bg-[#FAF3F0]/40 rounded-[2rem] border border-[var(--primary)]/10">
                    <div className="h-16 w-16 rounded-full bg-[var(--primary)] text-white flex items-center justify-center mx-auto mb-6 shadow-md">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl font-sans font-bold text-[#2B2B2B]">شكراً لمشاركتك رأيك معنا!</h4>
                  </div>
                ) : (
                  <form onSubmit={handleCombinedReview} className="max-w-xl mx-auto space-y-10">
                    <div className="space-y-8">
                      <div className="bg-[#FAF3F0]/40 p-8 rounded-[2rem] border border-[var(--primary)]/10 text-center space-y-6">
                        <p className="text-sm font-bold text-[#2B2B2B]">كيف كانت تجربتك مع المتجر؟</p>
                        <div className="flex justify-center gap-1.5 md:gap-2">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button
                              key={s} type="button" onClick={() => setStoreRating(s)}
                              className={`h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${s <= storeRating ? 'bg-[var(--primary)] text-white shadow-md' : 'bg-white text-zinc-300 hover:bg-[var(--primary)]/5'}`}
                            >
                              <Star className={`h-4 w-4 md:h-5 md:w-5 ${s <= storeRating ? 'fill-current' : ''}`} strokeWidth={2} />
                            </button>
                          ))}
                        </div>
                        <textarea value={storeComment} onChange={e => setStoreComment(e.target.value)} className="w-full bg-white border border-[var(--primary)]/10 rounded-2xl p-4 text-sm h-24 focus:ring-1 focus:ring-[var(--primary)] transition-all resize-none" placeholder="أخبرنا ما الذي أعجبك أكثر..." />
                      </div>

                      {Object.keys(productReviews).map(pid => {
                        const productItem = order.order_items?.find((i: any) => i.product_id === pid) || { product_name: order.product_name }
                        return (
                          <div key={pid} className="bg-white p-8 rounded-[2rem] border border-[var(--primary)]/10 text-center space-y-6">
                            <p className="text-sm font-bold text-[#2B2B2B]">رأيك في {productItem.product_name}</p>
                            <div className="flex justify-center gap-1.5 md:gap-2">
                              {[1, 2, 3, 4, 5].map(s => (
                                <button
                                  key={s} type="button" onClick={() => setProductReviews((prev: any) => ({ ...prev, [pid]: { ...prev[pid], rating: s } }))}
                                  className={`h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${s <= productReviews[pid].rating ? 'bg-[var(--primary)] text-white shadow-md' : 'bg-[#FAF3F0]/40 text-zinc-300 hover:bg-[var(--primary)]/5'}`}
                                >
                                  <Star className={`h-4 w-4 md:h-5 md:w-5 ${s <= productReviews[pid].rating ? 'fill-current' : ''}`} strokeWidth={2} />
                                </button>
                              ))}
                            </div>
                            <textarea value={productReviews[pid].comment} onChange={e => setProductReviews((prev: any) => ({ ...prev, [pid]: { ...prev[pid], comment: e.target.value } }))} className="w-full bg-[#FAF3F0]/40 border border-[var(--primary)]/10 rounded-2xl p-4 text-sm h-24 focus:ring-1 focus:ring-[var(--primary)] transition-all resize-none" placeholder="أخبرنا عن رأيك بالمنتج..." />
                          </div>
                        )
                      })}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full h-14 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-[var(--primary)]/90 transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none">
                      {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييمات'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <FloralFooter store={store} branding={branding} showWatermark={showWatermark} />
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
