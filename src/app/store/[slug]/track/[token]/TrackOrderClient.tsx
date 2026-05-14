'use client'

import { useState } from 'react'
import { CheckCircle, Clock, Package, PackageCheck, CreditCard, XCircle, Star, StarHalf } from 'lucide-react'
import { submitStoreReview, submitProductReview } from '@/app/actions/reviews'
import toast from 'react-hot-toast'
import StoreHeader from '@/components/StoreHeader'
import StoreFooter from '@/components/StoreFooter'
import Link from 'next/link'

const STATUS_STEPS = [
  { id: 'pending', label: 'قيد المراجعة', icon: Clock },
  { id: 'confirmed', label: 'تم التأكيد', icon: CheckCircle },
  { id: 'processing', label: 'تم التجهيز', icon: Package },
  { id: 'delivered', label: 'تم التوصيل', icon: PackageCheck },
]

import {
  ElegantHeader,
  ElegantFooter
} from '@/components/store/themes/ElegantTheme'
import { trackPurchase } from '@/components/store/PixelManager'
import { useEffect } from 'react'

export default function TrackOrderClient({ order, store, branding, slug }: any) {
  useEffect(() => {
    if (order) {
      trackPurchase(order)
    }
  }, [])

  const [storeRating, setStoreRating] = useState(5)
  const [storeComment, setStoreComment] = useState('')
  const [productRating, setProductRating] = useState(5)
  const [productComment, setProductComment] = useState('')
  const [isSubmittingStore, setIsSubmittingStore] = useState(false)
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false)

  const [storeSubmitted, setStoreSubmitted] = useState(false)
  const [productSubmitted, setProductSubmitted] = useState(false)

  const isDelivered = order.status === 'delivered' || order.status === 'paid'
  const isCancelled = order.status === 'cancelled'

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === (order.status === 'paid' ? 'delivered' : order.status))

  const primaryColor = branding?.primary_color || '#0ea5e9'
  const selectedTheme = (branding as any)?.selected_theme || 'default'

  const commonStyles = { '--primary': primaryColor } as any

  const handleStoreReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingStore(true)
    const res = await submitStoreReview(store.id, order.customer_name, storeRating, storeComment)
    setIsSubmittingStore(false)
    if (res.success) {
      toast.success('تم إرسال تقييم المتجر بنجاح! بانتظار المراجعة.')
      setStoreSubmitted(true)
    } else {
      toast.error(res.error || 'حدث خطأ')
    }
  }

  const handleProductReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingProduct(true)
    const productId = order.product_id || null // Fallback if schema doesn't have it directly
    const res = await submitProductReview(store.id, productId, order.customer_name, productRating, productComment)
    setIsSubmittingProduct(false)
    if (res.success) {
      toast.success('تم إرسال تقييم المنتج بنجاح! بانتظار المراجعة.')
      setProductSubmitted(true)
    } else {
      toast.error(res.error || 'حدث خطأ')
    }
  }

  const renderStars = (rating: number, setRating: (r: number) => void) => {
    return (
      <div className="flex items-center gap-2 mb-4 justify-center" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
            />
          </button>
        ))}
      </div>
    )
  }

  // ─── THEME: ELEGANT ────────────────────────────────────────────────────────
  if (selectedTheme === 'elegant') {
    return (
      <div className="min-h-screen bg-white" dir="rtl" style={commonStyles}>
        <ElegantHeader store={store} branding={branding} slug={slug} />
        <main className="mx-auto max-w-4xl px-6 py-20">
          <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <div className="h-px w-12 bg-[var(--primary)]/30 mb-2" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">تتبع الطلب</span>
            <h1 className="text-4xl md:text-5xl font-light text-zinc-900 tracking-tighter uppercase">تفاصيل <span className="font-bold italic text-[var(--primary)]">الفاتورة</span></h1>
            <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em] pt-2">رقم الطلب: #{order.id.split('-')[0]}</p>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {/* Status */}
            <div className="border border-zinc-100 p-10 rounded-[3rem] bg-zinc-50/30 space-y-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                حالة الطلب
              </h3>
              {isCancelled ? (
                <div className="text-rose-500 font-bold uppercase tracking-widest bg-rose-50 p-4 rounded-2xl text-center border border-rose-100">تم إلغاء الطلب</div>
              ) : (
                <div className="flex flex-wrap gap-8 md:gap-12 justify-center md:justify-start">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = currentStepIndex >= idx
                    return (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full transition-all duration-700 ${isCompleted ? 'bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]' : 'bg-zinc-200'}`} />
                        <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isCompleted ? 'text-zinc-900' : 'text-zinc-300'}`}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 border border-zinc-100 rounded-[3rem] overflow-hidden divide-y md:divide-y-0 md:divide-x divide-x-reverse divide-zinc-100 shadow-sm">
              <div className="p-10 space-y-2 bg-white">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">المنتج</span>
                <p className="text-xl font-bold text-zinc-900 uppercase tracking-tight">{order.product_name}</p>
              </div>
              <div className="p-10 space-y-2 bg-zinc-50/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">الإجمالي</span>
                <p className="text-xl font-bold text-[var(--primary)]">{Number(order.final_price).toLocaleString()} ج.م</p>
              </div>
              <div className="p-10 space-y-2 bg-white">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">تاريخ الطلب</span>
                <p className="text-xl font-bold text-zinc-900">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
              </div>
            </div>

            {/* Reviews */}
            {isDelivered && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="border border-zinc-100 p-10 rounded-[3rem] bg-white space-y-8 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 text-center">تقييم المتجر</h3>
                  {storeSubmitted ? (
                    <div className="text-center py-6">
                      <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-4" />
                      <p className="text-sm font-bold text-zinc-400 italic">شكراً لتقييمك للمتجر</p>
                    </div>
                  ) : (
                    <form onSubmit={handleStoreReview} className="space-y-6">
                      {renderStars(storeRating, setStoreRating)}
                      <textarea value={storeComment} onChange={(e) => setStoreComment(e.target.value)} className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl text-sm p-6 h-32 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all outline-none resize-none" placeholder="كيف كانت تجربتك مع المتجر؟" />
                      <button type="submit" className="w-full bg-[var(--primary)] text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[var(--primary)]/20 active:scale-95">إرسال التقييم</button>
                    </form>
                  )}
                </div>
                <div className="border border-zinc-100 p-10 rounded-[3rem] bg-white space-y-8 shadow-sm">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 text-center">تقييم المنتج</h3>
                  {productSubmitted ? (
                    <div className="text-center py-6">
                      <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-4" />
                      <p className="text-sm font-bold text-zinc-400 italic">شكراً لتقييمك للمنتج</p>
                    </div>
                  ) : (
                    <form onSubmit={handleProductReview} className="space-y-6">
                      {renderStars(productRating, setProductRating)}
                      <textarea value={productComment} onChange={(e) => setProductComment(e.target.value)} className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl text-sm p-6 h-32 focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all outline-none resize-none" placeholder="ما رأيك في جودة المنتج؟" />
                      <button type="submit" className="w-full bg-zinc-900 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95">إرسال التقييم</button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
        <ElegantFooter store={store} branding={branding} />
      </div>
    )
  }

  // ─── THEME: DEFAULT ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-inter" dir="rtl" style={commonStyles}>
      <StoreHeader store={store} branding={branding} slug={slug} />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-2">تتبع الطلب</h1>
          <p className="text-slate-500 font-medium">
            طلب رقم: <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded" dir="ltr">#{order.id.split('-')[0].toUpperCase()}</span>
          </p>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8">
          {isCancelled ? (
            <div className="text-center text-rose-500 py-6">
              <XCircle className="h-16 w-16 mx-auto mb-4 opacity-80" />
              <h2 className="text-2xl font-black mb-2">تم إلغاء الطلب</h2>
              <p className="text-slate-500 font-medium">نعتذر، لقد تم إلغاء هذا الطلب.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 hidden sm:block rounded-full" />
              <div
                className="absolute top-1/2 right-0 h-1 hidden sm:block rounded-full transition-all duration-1000"
                style={{ background: 'var(--primary)', width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
              />

              <div className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon
                  const isCompleted = currentStepIndex >= idx
                  const isCurrent = currentStepIndex === idx

                  return (
                    <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-2 relative z-10">
                      <div
                        className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted
                            ? 'bg-white text-white border-transparent shadow-lg'
                            : 'bg-white text-slate-300 border-slate-100'
                          }`}
                        style={isCompleted ? { background: 'var(--primary)', boxShadow: '0 4px 20px color-mix(in srgb, var(--primary) 30%, transparent)' } : {}}
                      >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={isCurrent ? 3 : 2} />
                      </div>
                      <div className="text-right sm:text-center">
                        <p className={`font-bold text-sm sm:text-base ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>
                            الحالة الحالية
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8 flex flex-col md:flex-row gap-8 justify-between">
          <div>
            <h3 className="font-bold text-slate-400 text-sm mb-1">المنتج</h3>
            <p className="font-black text-slate-800 text-lg">{order.product_name}</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-400 text-sm mb-1">الإجمالي</h3>
            <p className="font-black text-slate-800 text-lg">{order.final_price} ج.م</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-400 text-sm mb-1">تاريخ الطلب</h3>
            <p className="font-black text-slate-800 text-lg" dir="ltr">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
          </div>
        </div>

        {/* Reviews Section */}
        {isDelivered && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Store Review */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-black text-slate-900 mb-2 text-center">قيم تجربتك مع المتجر</h2>
              <p className="text-slate-500 text-sm font-medium text-center mb-6">رأيك يهمنا ويساعدنا على تقديم خدمة أفضل!</p>

              {storeSubmitted ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">شكراً لك!</h3>
                  <p className="text-slate-500 text-sm mt-1">تم استلام تقييمك للمتجر وسيتم مراجعته.</p>
                </div>
              ) : (
                <form onSubmit={handleStoreReview}>
                  {renderStars(storeRating, setStoreRating)}
                  <textarea
                    value={storeComment}
                    onChange={(e) => setStoreComment(e.target.value)}
                    placeholder="اكتب تعليقك حول تجربة الشراء من المتجر بشكل عام..."
                    className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:border-transparent resize-none h-28 mb-4 transition-all"
                    style={{ '--tw-ring-color': 'var(--primary)' } as any}
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingStore}
                    className="w-full py-4 rounded-2xl text-white font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    style={{ background: 'var(--primary)' }}
                  >
                    {isSubmittingStore ? 'جاري الإرسال...' : 'إرسال التقييم'}
                  </button>
                </form>
              )}
            </div>

            {/* Product Review */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-black text-slate-900 mb-2 text-center">قيم المنتج الذي استلمته</h2>
              <p className="text-slate-500 text-sm font-medium text-center mb-6">هل أعجبك المنتج؟ شاركنا رأيك.</p>

              {productSubmitted ? (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">شكراً لك!</h3>
                  <p className="text-slate-500 text-sm mt-1">تم استلام تقييمك للمنتج بنجاح.</p>
                </div>
              ) : (
                <form onSubmit={handleProductReview}>
                  {renderStars(productRating, setProductRating)}
                  <textarea
                    value={productComment}
                    onChange={(e) => setProductComment(e.target.value)}
                    placeholder="اكتب تعليقك حول جودة المنتج، مطابقته للوصف..."
                    className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:border-transparent resize-none h-28 mb-4 transition-all"
                    style={{ '--tw-ring-color': 'var(--primary)' } as any}
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingProduct}
                    className="w-full py-4 rounded-2xl text-white font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    style={{ background: 'var(--primary)' }}
                  >
                    {isSubmittingProduct ? 'جاري الإرسال...' : 'إرسال التقييم'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href={`/store/${slug}`} className="inline-block px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:shadow-sm transition-all">
            العودة للمتجر
          </Link>
        </div>
      </main>
      <StoreFooter store={store} branding={branding} slug={slug} />
    </div>
  )
}
