'use client'

import { useState } from 'react'
import { CheckCircle, Clock, Package, PackageCheck, CreditCard, XCircle, Star, StarHalf } from 'lucide-react'
import { submitStoreReview, submitProductReview } from '@/app/actions/reviews'
import toast from 'react-hot-toast'
import StoreHeader from '@/components/StoreHeader'
import Link from 'next/link'

const STATUS_STEPS = [
  { id: 'pending', label: 'قيد المراجعة', icon: Clock },
  { id: 'confirmed', label: 'تم التأكيد', icon: CheckCircle },
  { id: 'processing', label: 'تم التجهيز', icon: Package },
  { id: 'delivered', label: 'تم التوصيل', icon: PackageCheck },
]

export default function TrackOrderClient({ order, store, branding, slug }: any) {
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

  return (
    <div className="min-h-screen bg-slate-50 font-inter" dir="rtl" style={{ '--primary': primaryColor } as any}>
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
                        className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                          isCompleted 
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
    </div>
  )
}
