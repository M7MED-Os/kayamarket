'use client'

import React from 'react'
import { CheckCircle, Clock, Package, PackageCheck, Star, ArrowRight } from 'lucide-react'
import { ElegantHeader, ElegantFooter } from '@/components/store/themes/ElegantTheme'
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

export default function ElegantTrack({
  slug, store, branding, order, orderId, setOrderId, phone, setPhone, isSearching, handleSearch, setOrder, STATUS_STEPS,
  storeRating, setStoreRating, storeComment, setStoreComment, productReviews, setProductReviews, isSubmitting, isSubmitted, handleCombinedReview,
  showWatermark, commonStyles
}: TrackViewProps) {
  return (
    <div className="min-h-screen bg-white" dir="rtl" style={commonStyles}>
      <ElegantHeader store={store} branding={branding} slug={slug} />
      <main className="mx-auto max-w-4xl px-6 py-20 relative">
        {!order ? (
          <div className="max-w-md mx-auto space-y-12">
            <div className="text-center space-y-4">
              <div className="h-px w-12 bg-[var(--primary)]/30 mx-auto mb-2" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)]">تتبع الطلب</span>
              <h1 className="text-4xl md:text-5xl font-light text-zinc-900 tracking-tighter uppercase">أين <span className="font-bold italic text-[var(--primary)]">طلبك؟</span></h1>
            </div>
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">كود الطلب</label>
                <input value={orderId} onChange={e => setOrderId(e.target.value)} className="w-full bg-zinc-50 border-none p-5 text-sm focus:ring-1 focus:ring-[var(--primary)] transition-all uppercase rounded-none" placeholder="مثال: ABC-123" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">رقم الهاتف</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-zinc-50 border-none p-5 text-sm focus:ring-1 focus:ring-[var(--primary)] transition-all text-right rounded-none" dir="ltr" placeholder="01234567890" />
              </div>
              <button type="submit" disabled={isSearching} className="w-full h-16 bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-125 transition-all shadow-lg disabled:brightness-75 rounded-none">
                {isSearching ? 'جاري البحث...' : 'تتبع الآن'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex justify-between items-end border-b border-zinc-100 pb-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-light text-zinc-900 tracking-tighter">حالة <span className="font-bold">الطلب</span></h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">كود: {order.id.split('-')[0].toUpperCase()}</p>
              </div>
              <button onClick={() => setOrder(null)} className="text-[10px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2 hover:text-[var(--primary)] transition-all">
                <ArrowRight className="h-3 w-3" /> بحث جديد
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {STATUS_STEPS.map((step, idx) => {
                const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === (order.status === 'paid' ? 'delivered' : order.status))
                const isCompleted = currentStepIndex >= idx
                const isCurrent = currentStepIndex === idx
                return (
                  <div key={step.id} className="space-y-6">
                    <div className={`h-[2px] w-full transition-all duration-1000 ${isCompleted ? 'bg-[var(--primary)]' : 'bg-zinc-100'}`} />
                    <div className="flex flex-col gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isCompleted ? 'text-[var(--primary)]' : 'text-zinc-300'}`}>0{idx + 1}</span>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-zinc-900' : 'text-zinc-300'}`}>{step.label}</span>
                      {isCurrent && <div className="h-1.5 w-1.5 rounded-none bg-[var(--primary)] animate-pulse" />}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-zinc-50/50 border border-zinc-100 p-12 space-y-12 rounded-none">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-900">محتويات الطلب</h3>
                  <div className="h-px flex-1 bg-zinc-100" />
                </div>
                <div className="space-y-6">
                  {(order.order_items || []).map((item: any) => (
                    <div key={item.id} className="flex justify-between items-end pb-4 border-b border-zinc-50 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-zinc-900 hover:text-[var(--primary)] transition-colors">{item.product_name}</p>
                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">الكمية: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-light text-zinc-900">{(Number(item.product_price || item.price || 0) * Number(item.quantity || 1)).toLocaleString()} ج.م</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-12 pt-8 border-t border-zinc-100">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span className="text-[9px] font-black uppercase tracking-widest">مصاريف الشحن</span>
                    <span className="text-sm font-bold">{Number(order.shipping_cost || 0).toLocaleString()} ج.م</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">الإجمالي النهائي</span>
                    <p className="text-4xl font-light tracking-tighter text-[var(--primary)]">{Number(order.final_price || order.total_price || 0).toLocaleString()} ج.م</p>
                  </div>
                </div>
                <div className="space-y-2 md:text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">تاريخ الطلب</span>
                  <p className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {(order.status === 'delivered' || order.status === 'paid') && (
              <div className="pt-24 border-t border-zinc-100 space-y-16">
                <div className="text-center space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">نود معرفة رأيك</span>
                  <h3 className="text-4xl font-light text-zinc-900 tracking-tighter">تجربة <span className="font-bold italic text-[var(--primary)]">استثنائية؟</span></h3>
                </div>

                {isSubmitted ? (
                  <div className="text-center py-20 bg-zinc-50 border border-zinc-100 animate-in zoom-in duration-700 rounded-none">
                    <div className="h-12 w-12 rounded-none border border-[var(--primary)] flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-5 w-5 text-[var(--primary)]" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)]">شكراً لمشاركتك قصتك معنا</p>
                  </div>
                ) : (
                  <form onSubmit={handleCombinedReview} className="max-w-xl mx-auto space-y-16">
                    <div className="space-y-10">
                      <div className="space-y-6 text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">كيف كانت تجربة المتجر؟</p>
                        <div className="flex justify-center gap-2">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button
                              key={s} type="button" onClick={() => setStoreRating(s)}
                              className={`h-10 w-10 flex items-center justify-center transition-all duration-500 rounded-none ${s <= storeRating ? 'bg-[var(--primary)] text-white' : 'bg-zinc-50 text-zinc-300 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]'}`}
                            >
                              <Star className={`h-4 w-4 ${s <= storeRating ? 'fill-current' : ''}`} strokeWidth={1} />
                            </button>
                          ))}
                        </div>
                        <textarea value={storeComment} onChange={e => setStoreComment(e.target.value)} className="w-full bg-zinc-50 border-none p-6 text-xs h-32 focus:ring-1 focus:ring-[var(--primary)] transition-all italic rounded-none" placeholder="أخبرنا بالمزيد عن تجربتك..." />
                      </div>

                      {Object.keys(productReviews).map(pid => {
                        const productItem = order.order_items?.find((i: any) => i.product_id === pid) || { product_name: order.product_name }
                        return (
                          <div key={pid} className="space-y-6 text-center pt-10 border-t border-zinc-50">
                            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">تقييمك لـ {productItem.product_name}</p>
                            <div className="flex justify-center gap-2">
                              {[1, 2, 3, 4, 5].map(s => (
                                <button
                                  key={s} type="button" onClick={() => setProductReviews((prev: any) => ({ ...prev, [pid]: { ...prev[pid], rating: s } }))}
                                  className={`h-10 w-10 flex items-center justify-center transition-all duration-500 rounded-none ${s <= productReviews[pid].rating ? 'bg-[var(--primary)] text-white' : 'bg-zinc-50 text-zinc-300 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]'}`}
                                >
                                  <Star className={`h-4 w-4 ${s <= productReviews[pid].rating ? 'fill-current' : ''}`} strokeWidth={1} />
                                </button>
                              ))}
                            </div>
                            <textarea value={productReviews[pid].comment} onChange={e => setProductReviews((prev: any) => ({ ...prev, [pid]: { ...prev[pid], comment: e.target.value } }))} className="w-full bg-zinc-50 border-none p-6 text-xs h-32 focus:ring-1 focus:ring-[var(--primary)] transition-all italic rounded-none" placeholder={`رأيك في المنتج...`} />
                          </div>
                        )
                      })}
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full h-16 bg-[var(--primary)] text-white flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] hover:brightness-125 transition-all shadow-xl disabled:brightness-75 rounded-none">
                      {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييمات'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <ElegantFooter store={store} branding={branding} slug={slug} showWatermark={showWatermark} />
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
