'use client'

import React from 'react'
import { Search, ArrowRight, Loader2, XCircle, CheckCircle, Star } from 'lucide-react'
import StoreHeader from '@/components/StoreHeader'
import StoreFooter from '@/components/StoreFooter'
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

export default function DefaultTrack({
  slug, store, branding, order, orderId, setOrderId, phone, setPhone, isSearching, handleSearch, setOrder, STATUS_STEPS,
  storeRating, setStoreRating, storeComment, setStoreComment, productReviews, setProductReviews, isSubmitting, isSubmitted, handleCombinedReview,
  showWatermark, commonStyles
}: TrackViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-inter" dir="rtl" style={commonStyles}>
      <StoreHeader store={store} branding={branding} slug={slug} />

      <main className="max-w-4xl mx-auto px-6 py-12 relative">
        {!order ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-slate-900 mb-2">تتبع طلبك</h1>
              <p className="text-slate-500 font-medium">أدخل بيانات طلبك لمعرفة حالته وتقييم تجربتك</p>
            </div>

            <form onSubmit={handleSearch} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">كود الطلب</label>
                <input
                  type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="مثال: A1B2C3D"
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-black outline-none focus:bg-white focus:border-[var(--primary)] transition-all uppercase" dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رقم التليفون</label>
                <input
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الموبايل المسجل في الطلب"
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-black outline-none focus:bg-white focus:border-[var(--primary)] transition-all text-right" dir="ltr"
                />
              </div>
              <button
                type="submit" disabled={isSearching || !orderId.trim() || !phone.trim()}
                className="w-full h-14 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                style={{ background: 'var(--primary)' }}
              >
                {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                بحث عن الطلب
              </button>
            </form>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <div className="text-center sm:text-right">
                <h1 className="text-3xl font-black text-slate-900 mb-1">تفاصيل الطلب</h1>
                <p className="text-slate-500 font-medium">
                  طلب رقم: <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded" dir="ltr">#{order.id.split('-')[0].toUpperCase()}</span>
                </p>
              </div>
              <button
                onClick={() => setOrder(null)}
                className="text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 hover:bg-slate-50 active:scale-95"
              >
                <ArrowRight className="h-4 w-4" /> تتبع طلب آخر
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8">
              {order.status === 'cancelled' ? (
                <div className="text-center text-rose-500 py-6">
                  <XCircle className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <h2 className="text-2xl font-black mb-2">تم إلغاء الطلب</h2>
                  <p className="text-slate-500 font-medium">نعتذر، لقد تم إلغاء هذا الطلب.</p>
                </div>
              ) : (
                <div className="relative pt-2 sm:pt-4">
                  <div className="absolute top-[46px] left-[9%] right-[9%] h-1.5 bg-slate-100 hidden sm:block rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 right-0 h-full transition-all duration-1000"
                      style={{ background: 'var(--primary)', width: `${(Math.max(0, STATUS_STEPS.findIndex(s => s.id === (order.status === 'paid' ? 'delivered' : order.status))) / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />
                  </div>

                  <div className="relative flex flex-col sm:flex-row justify-between gap-8 sm:gap-0">
                    {STATUS_STEPS.map((step, idx) => {
                      const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === (order.status === 'paid' ? 'delivered' : order.status))
                      const Icon = step.icon
                      const isCompleted = currentStepIndex >= idx
                      const isCurrent = currentStepIndex === idx
                      return (
                        <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-4 relative z-10 w-full sm:w-auto">
                          <div
                            className={`h-12 w-12 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center border-[3px] transition-all duration-500 bg-white ${isCompleted ? 'text-white border-transparent shadow-lg' : 'text-slate-300 border-slate-200'}`}
                            style={isCompleted ? { background: 'var(--primary)', boxShadow: '0 8px 25px color-mix(in srgb, var(--primary) 30%, transparent)' } : {}}
                          >
                            <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={isCurrent ? 2.5 : 2} />
                          </div>
                          <div className="text-right sm:text-center flex-1 sm:flex-none">
                            <p className={`font-black text-sm sm:text-base ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                            {isCurrent && (
                              <span className="text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg mt-2 inline-block" style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>الحالة الحالية</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="w-full sm:w-auto flex-1">
                <h3 className="font-bold text-slate-400 text-sm mb-4">المنتجات المطلوبة</h3>
                <div className="flex flex-wrap gap-3">
                  {(order.order_items?.length > 0 ? order.order_items : [{product_name: order.product_name, quantity: 1}]).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200 text-sm">
                      <span className="font-black text-slate-800">{item.product_name}</span>
                      <span className="text-slate-400 font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-100">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full sm:w-auto flex gap-8 sm:gap-12 justify-between sm:justify-end border-t sm:border-t-0 sm:border-r border-slate-100 pt-6 sm:pt-0 sm:pr-8">
                <div className="text-right sm:text-center space-y-3">
                  {Number(order.shipping_cost || 0) > 0 && (
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-b border-slate-100 pb-1">
                      <span>الشحن:</span>
                      <span>{Number(order.shipping_cost).toLocaleString()} ج.م</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-400 text-sm mb-2">الإجمالي</h3>
                    <p className="font-black text-slate-900 text-xl" dir="ltr">{Number(order.final_price || 0).toLocaleString()} <span className="text-sm text-slate-500">ج.م</span></p>
                  </div>
                </div>
                <div className="text-right sm:text-center">
                  <h3 className="font-bold text-slate-400 text-sm mb-2">تاريخ الطلب</h3>
                  <p className="font-black text-slate-900 text-xl" dir="ltr">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>
            </div>

            {(order.status === 'delivered' || order.status === 'paid') && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 mb-2">كيف كانت تجربتك؟</h2>
                  <p className="text-slate-500 text-sm font-medium">تقييمك يساعدنا على تطوير خدمتنا ومنتجاتنا</p>
                </div>
                {isSubmitted ? (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-center max-w-2xl mx-auto">
                    <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">شكراً لك!</h3>
                    <p className="text-slate-500 text-sm font-medium">لقد استلمنا تقييمك بنجاح، نتمنى رؤيتك قريباً.</p>
                  </div>
                ) : (
                  <form onSubmit={handleCombinedReview} className="max-w-2xl mx-auto space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
                      <div>
                        <h3 className="text-base font-bold text-slate-800 mb-3 text-center">رأيك في تجربة الشراء من المتجر</h3>
                        <div className="flex items-center gap-2 mb-3 justify-center" dir="rtl">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={`store-${star}`} type="button" onClick={() => setStoreRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                              <Star className={`h-8 w-8 ${star <= storeRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                            </button>
                          ))}
                        </div>
                        <textarea value={storeComment} onChange={(e) => setStoreComment(e.target.value)} placeholder="اكتب تعليقك بصراحة هنا..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[var(--primary)] resize-none h-20 transition-all" />
                      </div>
                      <div className="h-px bg-slate-100 w-full my-8" />
                      <div className="space-y-8">
                        {(order.order_items?.length > 0 ? order.order_items : (order.product_id ? [{product_id: order.product_id, product_name: order.product_name}] : [])).map((item: any) => (
                          <div key={item.id || item.product_id}>
                            <h3 className="text-base font-bold text-slate-800 mb-3 text-center">رأيك في ({item.product_name})</h3>
                            <div className="flex items-center gap-2 mb-3 justify-center" dir="rtl">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const r = productReviews[item.product_id]?.rating || 5;
                                return (
                                  <button key={`prod-${item.id || item.product_id}-${star}`} type="button" onClick={() => setProductReviews((prev: any) => ({ ...prev, [item.product_id]: { ...prev[item.product_id], rating: star } }))} className="focus:outline-none transition-transform hover:scale-110">
                                    <Star className={`h-8 w-8 ${star <= r ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                  </button>
                                )
                              })}
                            </div>
                            <textarea value={productReviews[item.product_id]?.comment || ''} onChange={(e) => setProductReviews((prev: any) => ({ ...prev, [item.product_id]: { ...prev[item.product_id], comment: e.target.value } }))} placeholder="أخبرنا برأيك في هذا المنتج..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[var(--primary)] resize-none h-20 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50" style={{ background: 'var(--primary)' }}>
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                        إرسال التقييمات
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <StoreFooter store={store} branding={branding} slug={slug} showWatermark={showWatermark} />
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
