'use client'

import { useState } from 'react'
import { CheckCircle, Clock, Package, PackageCheck, XCircle, Star, Search, ArrowRight, Loader2, Store } from 'lucide-react'
import { submitStoreReview, submitProductReview } from '@/app/actions/reviews'
import { fetchOrderForTracking } from '@/app/actions/track'
import toast from 'react-hot-toast'
import StoreHeader from '@/components/StoreHeader'
import StoreFooter from '@/components/StoreFooter'

const STATUS_STEPS = [
  { id: 'pending', label: 'قيد المراجعة', icon: Clock },
  { id: 'confirmed', label: 'تم التأكيد', icon: CheckCircle },
  { id: 'processing', label: 'تم التجهيز', icon: Package },
  { id: 'delivered', label: 'تم التوصيل', icon: PackageCheck },
]

export default function TrackOrderClient({ store, branding, slug }: any) {
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [order, setOrder] = useState<any>(null)

  const [storeRating, setStoreRating] = useState(5)
  const [storeComment, setStoreComment] = useState('')
  
  // Multiple products review state
  const [productReviews, setProductReviews] = useState<Record<string, { rating: number; comment: string }>>({})
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const primaryColor = branding?.primary_color || '#0ea5e9'

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim() || !phone.trim()) {
      toast.error('برجاء إدخال كود الطلب ورقم التليفون')
      return
    }
    setIsSearching(true)
    const res = await fetchOrderForTracking(store.id, orderId, phone)
    setIsSearching(false)

    if (res.success && res.order) {
      setOrder(res.order)
      setIsSubmitted(false)
      
      // Initialize product reviews state
      const pReviews: any = {}
      if (res.order.order_items?.length > 0) {
        res.order.order_items.forEach((item: any) => {
          if (item.product_id) pReviews[item.product_id] = { rating: 5, comment: '' }
        })
      } else if (res.order.product_id) {
        pReviews[res.order.product_id] = { rating: 5, comment: '' }
      }
      setProductReviews(pReviews)
    } else {
      toast.error(res.error || 'حدث خطأ')
    }
  }

  const handleCombinedReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const promises = [
      submitStoreReview(store.id, order.customer_name, storeRating, storeComment)
    ]

    Object.keys(productReviews).forEach(pid => {
      promises.push(
        submitProductReview(store.id, pid, order.customer_name, productReviews[pid].rating, productReviews[pid].comment)
      )
    })

    const results = await Promise.all(promises)
    const storeRes = results[0]
    const productSuccess = Object.keys(productReviews).length === 0 || results.slice(1).every(r => r.success)

    setIsSubmitting(false)

    if (storeRes.success && productSuccess) {
      toast.success('تم إرسال التقييمات بنجاح! بانتظار المراجعة.')
      setIsSubmitted(true)
    } else {
      toast.error(storeRes.error || 'حدث خطأ أثناء إرسال بعض التقييمات')
      if (storeRes.success || productSuccess) {
        setIsSubmitted(true)
      }
    }
  }

  const renderStars = (rating: number, setRating: (r: number) => void) => {
    return (
      <div className="flex items-center gap-2 mb-4 justify-center" dir="rtl">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-10 w-10 ${star <= rating ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' : 'text-slate-200'}`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter pb-20" dir="rtl" style={{ '--primary': primaryColor } as any}>
      <StoreHeader store={store} branding={branding} slug={slug} />

      <main className="max-w-4xl mx-auto px-6 py-12">
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
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="مثال: A1B2C3D"
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-black outline-none focus:bg-white focus:border-[var(--primary)] transition-all uppercase"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رقم التليفون</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الموبايل المسجل في الطلب"
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-black outline-none focus:bg-white focus:border-[var(--primary)] transition-all text-right"
                  dir="ltr"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSearching || !orderId.trim() || !phone.trim()}
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

            {/* Status Timeline */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8">
              {order.status === 'cancelled' ? (
                <div className="text-center text-rose-500 py-6">
                  <XCircle className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <h2 className="text-2xl font-black mb-2">تم إلغاء الطلب</h2>
                  <p className="text-slate-500 font-medium">نعتذر، لقد تم إلغاء هذا الطلب.</p>
                </div>
              ) : (
                <div className="relative pt-2 sm:pt-4">
                  {/* Timeline Line - Fixed centering */}
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
                            className={`h-12 w-12 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center border-[3px] transition-all duration-500 bg-white ${
                              isCompleted 
                                ? 'text-white border-transparent shadow-lg' 
                                : 'text-slate-300 border-slate-200'
                            }`}
                            style={isCompleted ? { background: 'var(--primary)', boxShadow: '0 8px 25px color-mix(in srgb, var(--primary) 30%, transparent)' } : {}}
                          >
                            <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={isCurrent ? 2.5 : 2} />
                          </div>
                          <div className="text-right sm:text-center flex-1 sm:flex-none">
                            <p className={`font-black text-sm sm:text-base ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <span className="text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg mt-2 inline-block" style={{ background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)' }}>
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
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="w-full sm:w-auto flex-1">
                <h3 className="font-bold text-slate-400 text-sm mb-4">المنتجات المطلوبة</h3>
                {order.order_items?.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200 text-sm">
                        <span className="font-black text-slate-800">{item.product_name}</span>
                        <span className="text-slate-400 font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-100">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 w-fit border border-slate-200 text-sm">
                    <span className="font-black text-slate-800">{order.product_name}</span>
                    <span className="text-slate-400 font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-100">x1</span>
                  </div>
                )}
              </div>
              
              <div className="w-full sm:w-auto flex gap-8 sm:gap-12 justify-between sm:justify-end border-t sm:border-t-0 sm:border-r border-slate-100 pt-6 sm:pt-0 sm:pr-8">
                <div className="text-right sm:text-center">
                  <h3 className="font-bold text-slate-400 text-sm mb-2">الإجمالي</h3>
                  <p className="font-black text-slate-900 text-xl" dir="ltr">{order.final_price} <span className="text-sm text-slate-500">ج.م</span></p>
                </div>
                <div className="text-right sm:text-center">
                  <h3 className="font-bold text-slate-400 text-sm mb-2">تاريخ الطلب</h3>
                  <p className="font-black text-slate-900 text-xl" dir="ltr">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
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
                      {/* Store Review */}
                      <div>
                        <h3 className="text-base font-bold text-slate-800 mb-3 text-center">رأيك في تجربة الشراء من المتجر</h3>
                        <div className="flex items-center gap-2 mb-3 justify-center" dir="rtl">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={`store-${star}`}
                              type="button"
                              onClick={() => setStoreRating(star)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star className={`h-8 w-8 ${star <= storeRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={storeComment}
                          onChange={(e) => setStoreComment(e.target.value)}
                          placeholder="اكتب تعليقك بصراحة هنا..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[var(--primary)] resize-none h-20 transition-all"
                        />
                      </div>

                      <div className="h-px bg-slate-100 w-full my-8" />

                      {/* Product Reviews */}
                      <div className="space-y-8">
                        {order.order_items?.length > 0 ? (
                          order.order_items.map((item: any) => (
                            <div key={item.id}>
                              <h3 className="text-base font-bold text-slate-800 mb-3 text-center">رأيك في ({item.product_name})</h3>
                              <div className="flex items-center gap-2 mb-3 justify-center" dir="rtl">
                                {[1, 2, 3, 4, 5].map((star) => {
                                  const r = productReviews[item.product_id]?.rating || 5;
                                  return (
                                    <button
                                      key={`prod-${item.id}-${star}`}
                                      type="button"
                                      onClick={() => setProductReviews(prev => ({...prev, [item.product_id]: { ...prev[item.product_id], rating: star }}))}
                                      className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                      <Star className={`h-8 w-8 ${star <= r ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                    </button>
                                  )
                                })}
                              </div>
                              <textarea
                                value={productReviews[item.product_id]?.comment || ''}
                                onChange={(e) => setProductReviews(prev => ({...prev, [item.product_id]: { ...prev[item.product_id], comment: e.target.value }}))}
                                placeholder="أخبرنا برأيك في هذا المنتج..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[var(--primary)] resize-none h-20 transition-all"
                              />
                            </div>
                          ))
                        ) : order.product_id ? (
                          <div>
                            <h3 className="text-base font-bold text-slate-800 mb-3 text-center">رأيك في ({order.product_name})</h3>
                            <div className="flex items-center gap-2 mb-3 justify-center" dir="rtl">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const r = productReviews[order.product_id]?.rating || 5;
                                return (
                                  <button
                                    key={`prod-${order.product_id}-${star}`}
                                    type="button"
                                    onClick={() => setProductReviews(prev => ({...prev, [order.product_id]: { ...prev[order.product_id], rating: star }}))}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                  >
                                    <Star className={`h-8 w-8 ${star <= r ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                  </button>
                                )
                              })}
                            </div>
                            <textarea
                              value={productReviews[order.product_id]?.comment || ''}
                              onChange={(e) => setProductReviews(prev => ({...prev, [order.product_id]: { ...prev[order.product_id], comment: e.target.value }}))}
                              placeholder="أخبرنا برأيك في هذا المنتج..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-[var(--primary)] resize-none h-20 transition-all"
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 rounded-2xl text-white font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-base flex items-center justify-center gap-2"
                        style={{ background: 'var(--primary)' }}
                      >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                        إرسال التقييمات
                      </button>
                      <p className="text-center text-slate-400 text-xs mt-3 font-medium">
                        جميع التقييمات تخضع للمراجعة قبل نشرها في المتجر
                      </p>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <StoreFooter store={store} branding={branding} slug={slug} />
    </div>
  )
}
