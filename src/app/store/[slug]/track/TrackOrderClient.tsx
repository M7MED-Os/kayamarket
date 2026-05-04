'use client'

import { useState } from 'react'
import { CheckCircle, Clock, Package, PackageCheck, XCircle, Star, Search, ArrowRight, Loader2, Store } from 'lucide-react'
import { submitStoreReview, submitProductReview } from '@/app/actions/reviews'
import { fetchOrderForTracking } from '@/app/actions/track'
import toast from 'react-hot-toast'
import { 
  ElegantHeader, 
  ElegantFooter 
} from '@/components/store/themes/ElegantTheme'
import {
  FloralHeader,
  FloralFooter
} from '@/components/store/themes/FloralTheme'
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
  const selectedTheme = (branding as any)?.selected_theme || 'default'

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
    const promises = [submitStoreReview(store.id, order.customer_name, storeRating, storeComment)]
    Object.keys(productReviews).forEach(pid => {
      promises.push(submitProductReview(store.id, pid, order.customer_name, productReviews[pid].rating, productReviews[pid].comment))
    })
    const results = await Promise.all(promises)
    const storeRes = results[0]
    const productSuccess = Object.keys(productReviews).length === 0 || results.slice(1).every(r => r.success)
    setIsSubmitting(false)
    if (storeRes.success && productSuccess) {
      toast.success('تم إرسال التقييمات بنجاح!')
      setIsSubmitted(true)
    } else {
      toast.error('حدث خطأ أثناء إرسال التقييمات')
      if (storeRes.success || productSuccess) setIsSubmitted(true)
    }
  }

  // ─── THEME: ELEGANT ────────────────────────────────────────────────────────
  if (selectedTheme === 'elegant') {
    return (
      <div className="min-h-screen bg-white" dir="rtl" style={{ '--primary': primaryColor } as any}>
        <ElegantHeader store={store} branding={branding} slug={slug} />
        <main className="mx-auto max-w-4xl px-6 py-20">
          {!order ? (
            <div className="max-w-md mx-auto space-y-12">
               <div className="text-center space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">تتبع الطلب</span>
                  <h1 className="text-4xl font-light text-zinc-900 tracking-tighter">أين <span className="font-bold">طلبك؟</span></h1>
               </div>
               <form onSubmit={handleSearch} className="space-y-6">
                  <div className="space-y-1">
                     <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">كود الطلب</label>
                     <input value={orderId} onChange={e => setOrderId(e.target.value)} className="w-full bg-zinc-50 border-none p-5 text-sm focus:ring-1 focus:ring-zinc-900 transition-all uppercase" placeholder="مثال: ABC-123" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">رقم الهاتف</label>
                     <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-zinc-50 border-none p-5 text-sm focus:ring-1 focus:ring-zinc-900 transition-all text-right" dir="ltr" placeholder="01234567890" />
                  </div>
                  <button type="submit" disabled={isSearching} className="w-full h-16 bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors shadow-lg disabled:opacity-50">
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
                  <button onClick={() => setOrder(null)} className="text-[10px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2 hover:opacity-60 transition-opacity">
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
                         <div className={`h-[2px] w-full transition-all duration-1000 ${isCompleted ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
                         <div className="flex flex-col gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isCompleted ? 'text-zinc-900' : 'text-zinc-300'}`}>0{idx + 1}</span>
                            <span className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-zinc-900' : 'text-zinc-300'}`}>{step.label}</span>
                            {isCurrent && <div className="h-1 w-1 rounded-full bg-zinc-900 animate-pulse" />}
                         </div>
                      </div>
                    )
                  })}
               </div>

               <div className="bg-zinc-50/50 border border-zinc-100 p-12 space-y-12">
                  <div className="space-y-8">
                     <div className="flex items-center gap-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-900">محتويات الطلب</h3>
                        <div className="h-px flex-1 bg-zinc-100" />
                     </div>
                     <div className="space-y-6">
                        {(order.order_items || []).map((item: any) => (
                           <div key={item.id} className="flex justify-between items-end pb-4 border-b border-zinc-50 last:border-0">
                              <div className="space-y-1">
                                 <p className="text-sm font-bold text-zinc-900">{item.product_name}</p>
                                 <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">الكمية: {item.quantity}</p>
                              </div>
                              <span className="text-sm font-light text-zinc-900">{(item.price * item.quantity).toLocaleString()} ج.م</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between gap-12 pt-8 border-t border-zinc-100">
                     <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">الإجمالي النهائي</span>
                        <p className="text-4xl font-light tracking-tighter text-zinc-900">{order.final_price} ج.م</p>
                     </div>
                     <div className="space-y-2 md:text-left">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">تاريخ الطلب</span>
                        <p className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                     </div>
                  </div>
               </div>

               {/* Feedback in Elegant */}
               {(order.status === 'delivered' || order.status === 'paid') && (
                 <div className="pt-24 border-t border-zinc-100 space-y-16">
                    <div className="text-center space-y-4">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">نود معرفة رأيك</span>
                       <h3 className="text-4xl font-light text-zinc-900 tracking-tighter">تجربة <span className="font-bold italic">استثنائية؟</span></h3>
                    </div>

                    {isSubmitted ? (
                      <div className="text-center py-20 bg-zinc-50 border border-zinc-100 animate-in zoom-in duration-700">
                         <div className="h-12 w-12 rounded-full border border-zinc-900 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-5 w-5 text-zinc-900" />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900">شكراً لمشاركتك قصتك معنا</p>
                      </div>
                    ) : (
                      <form onSubmit={handleCombinedReview} className="max-w-xl mx-auto space-y-16">
                         <div className="space-y-10">
                            {/* Store Review */}
                            <div className="space-y-6 text-center">
                               <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">كيف كانت تجربة المتجر؟</p>
                               <div className="flex justify-center gap-2">
                                  {[1, 2, 3, 4, 5].map(s => (
                                    <button 
                                      key={s} 
                                      type="button" 
                                      onClick={() => setStoreRating(s)} 
                                      className={`h-10 w-10 flex items-center justify-center transition-all duration-500 ${s <= storeRating ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-300 hover:bg-zinc-100'}`}
                                    >
                                       <Star className={`h-4 w-4 ${s <= storeRating ? 'fill-current' : ''}`} strokeWidth={1} />
                                    </button>
                                  ))}
                               </div>
                               <textarea 
                                 value={storeComment} 
                                 onChange={e => setStoreComment(e.target.value)} 
                                 className="w-full bg-zinc-50 border-none p-6 text-xs h-32 focus:ring-1 focus:ring-zinc-900 transition-all italic" 
                                 placeholder="أخبرنا بالمزيد عن تجربتك..." 
                               />
                            </div>

                            {/* Product Reviews */}
                            {Object.keys(productReviews).map(pid => {
                               const productItem = order.order_items?.find((i: any) => i.product_id === pid) || { product_name: order.product_name }
                               return (
                                 <div key={pid} className="space-y-6 text-center pt-10 border-t border-zinc-50">
                                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">تقييمك لـ {productItem.product_name}</p>
                                    <div className="flex justify-center gap-2">
                                       {[1, 2, 3, 4, 5].map(s => (
                                          <button 
                                            key={s} 
                                            type="button" 
                                            onClick={() => setProductReviews(prev => ({ ...prev, [pid]: { ...prev[pid], rating: s } }))} 
                                            className={`h-10 w-10 flex items-center justify-center transition-all duration-500 ${s <= productReviews[pid].rating ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-300'}`}
                                          >
                                             <Star className={`h-4 w-4 ${s <= productReviews[pid].rating ? 'fill-current' : ''}`} strokeWidth={1} />
                                          </button>
                                       ))}
                                    </div>
                                    <textarea 
                                      value={productReviews[pid].comment} 
                                      onChange={e => setProductReviews(prev => ({ ...prev, [pid]: { ...prev[pid], comment: e.target.value } }))} 
                                      className="w-full bg-zinc-50 border-none p-6 text-xs h-32 focus:ring-1 focus:ring-zinc-900 transition-all italic" 
                                      placeholder={`رأيك في المنتج...`} 
                                    />
                                 </div>
                               )
                            })}
                         </div>

                         <button type="submit" disabled={isSubmitting} className="w-full h-16 bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-xl disabled:opacity-50">
                            {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييمات'}
                         </button>
                      </form>
                    )}
                 </div>
               )}
            </div>
          )}
        </main>
        <ElegantFooter store={store} branding={branding} />
      </div>
    )
  }

  // ─── THEME: FLORAL ─────────────────────────────────────────────────────────
  if (selectedTheme === 'floral') {
    return (
      <div className="min-h-screen bg-[#FAF3F0]/20" dir="rtl" style={{ '--primary': primaryColor } as any}>
        <FloralHeader store={store} branding={branding} slug={slug} />
        <main className="mx-auto max-w-4xl px-6 py-24">
          {!order ? (
            <div className="max-w-md mx-auto space-y-10 p-10 bg-white rounded-[2.5rem] border border-rose-50 shadow-sm">
               <div className="text-center space-y-4">
                  <h1 className="text-4xl font-serif italic text-[#2B2B2B]">أين باقتي؟</h1>
                  <p className="text-sm font-medium text-zinc-500">ادخل بيانات طلبك لنخبرك بمكان زهورك</p>
               </div>
               <form onSubmit={handleSearch} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-zinc-600">كود الطلب</label>
                     <input value={orderId} onChange={e => setOrderId(e.target.value)} className="w-full bg-[#FAF3F0]/40 border border-rose-50 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all uppercase placeholder:text-zinc-400" placeholder="مثال: ABC-123" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-zinc-600">رقم الهاتف</label>
                     <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[#FAF3F0]/40 border border-rose-50 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all text-right placeholder:text-zinc-400" dir="ltr" placeholder="01234567890" />
                  </div>
                  <button type="submit" disabled={isSearching} className="w-full h-14 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-[var(--primary)]/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50">
                     {isSearching ? 'جاري البحث...' : 'تتبع باقتي'}
                  </button>
               </form>
            </div>
          ) : (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 bg-white p-8 md:p-12 rounded-[2.5rem] border border-rose-50 shadow-sm">
               <div className="flex justify-between items-end border-b border-rose-50 pb-8">
                  <div className="space-y-2">
                     <h2 className="text-3xl font-serif italic text-[#2B2B2B]">حالة باقتك</h2>
                     <p className="text-sm font-bold text-zinc-400 uppercase">كود: {order.id.split('-')[0].toUpperCase()}</p>
                  </div>
                  <button onClick={() => setOrder(null)} className="text-sm font-bold text-[var(--primary)] flex items-center gap-2 hover:opacity-80 transition-opacity bg-rose-50 px-4 py-2 rounded-full">
                     <ArrowRight className="h-4 w-4" /> تتبع طلب آخر
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {STATUS_STEPS.map((step, idx) => {
                    const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === (order.status === 'paid' ? 'delivered' : order.status))
                    const isCompleted = currentStepIndex >= idx
                    const isCurrent = currentStepIndex === idx
                    return (
                      <div key={step.id} className={`p-4 rounded-2xl border ${isCompleted ? 'bg-rose-50/50 border-rose-100' : 'bg-zinc-50/50 border-zinc-100'} transition-colors duration-500`}>
                         <div className="flex flex-col gap-3">
                            <step.icon className={`h-6 w-6 ${isCompleted ? 'text-[var(--primary)]' : 'text-zinc-300'}`} />
                            <div>
                               <span className={`text-sm font-bold block ${isCompleted ? 'text-[#2B2B2B]' : 'text-zinc-400'}`}>{step.label}</span>
                               {isCurrent && <span className="text-xs text-[var(--primary)] font-bold animate-pulse">الحالة الحالية</span>}
                            </div>
                         </div>
                      </div>
                    )
                  })}
               </div>

               <div className="bg-[#FAF3F0]/20 rounded-2xl p-8 space-y-8 border border-rose-50">
                  <h3 className="text-lg font-serif text-[#2B2B2B] border-b border-rose-50 pb-4">تفاصيل الباقات</h3>
                  <div className="space-y-4">
                     {(order.order_items || []).map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-rose-50">
                           <div className="space-y-1">
                              <p className="text-sm font-bold text-[#2B2B2B]">{item.product_name}</p>
                              <p className="text-xs text-zinc-500 font-medium">الكمية: {item.quantity}</p>
                           </div>
                           <span className="text-sm font-black text-[var(--primary)]">{(item.price * item.quantity).toLocaleString()} ج.م</span>
                        </div>
                     ))}
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-6 border-t border-rose-50">
                     <div className="space-y-1">
                        <span className="text-sm font-bold text-zinc-500">الإجمالي النهائي</span>
                        <p className="text-3xl font-black text-[var(--primary)]">{order.final_price.toLocaleString()} ج.م</p>
                     </div>
                     <div className="space-y-1 text-left">
                        <span className="text-sm font-bold text-zinc-500">تاريخ الطلب</span>
                        <p className="text-sm font-bold text-[#2B2B2B]">{new Date(order.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                     </div>
                  </div>
               </div>

               {/* Feedback in Floral */}
               {(order.status === 'delivered' || order.status === 'paid') && (
                 <div className="pt-16 border-t border-rose-50 space-y-12">
                    <div className="text-center space-y-4">
                       <h3 className="text-3xl font-serif italic text-[#2B2B2B]">هل نالت زهورنا إعجابك؟</h3>
                       <p className="text-zinc-500">رأيك يساعدنا في تقديم باقات أجمل</p>
                    </div>

                    {isSubmitted ? (
                      <div className="text-center p-12 bg-[#FAF3F0]/40 rounded-[2rem] border border-rose-50">
                         <div className="h-16 w-16 rounded-full bg-[var(--primary)] text-white flex items-center justify-center mx-auto mb-6 shadow-md">
                            <CheckCircle className="h-8 w-8" />
                         </div>
                         <h4 className="text-xl font-serif text-[#2B2B2B]">شكراً لمشاركتك مشاعرك معنا!</h4>
                      </div>
                    ) : (
                      <form onSubmit={handleCombinedReview} className="max-w-xl mx-auto space-y-10">
                         <div className="space-y-8">
                            <div className="bg-[#FAF3F0]/40 p-8 rounded-[2rem] border border-rose-50 text-center space-y-6">
                               <p className="text-sm font-bold text-[#2B2B2B]">كيف كانت تجربتك مع المتجر؟</p>
                               <div className="flex justify-center gap-2">
                                  {[1, 2, 3, 4, 5].map(s => (
                                    <button 
                                      key={s} type="button" onClick={() => setStoreRating(s)} 
                                      className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 ${s <= storeRating ? 'bg-[var(--primary)] text-white shadow-md' : 'bg-white text-zinc-300 hover:bg-rose-50'}`}
                                    >
                                       <Star className={`h-5 w-5 ${s <= storeRating ? 'fill-current' : ''}`} strokeWidth={2} />
                                    </button>
                                  ))}
                               </div>
                               <textarea 
                                 value={storeComment} onChange={e => setStoreComment(e.target.value)} 
                                 className="w-full bg-white border border-rose-50 rounded-2xl p-4 text-sm h-24 focus:ring-1 focus:ring-[var(--primary)] transition-all resize-none" 
                                 placeholder="أخبرنا ما الذي أعجبك أكثر..." 
                               />
                            </div>

                            {Object.keys(productReviews).map(pid => {
                               const productItem = order.order_items?.find((i: any) => i.product_id === pid) || { product_name: order.product_name }
                               return (
                                 <div key={pid} className="bg-white p-8 rounded-[2rem] border border-rose-50 text-center space-y-6">
                                    <p className="text-sm font-bold text-[#2B2B2B]">رأيك في {productItem.product_name}</p>
                                    <div className="flex justify-center gap-2">
                                       {[1, 2, 3, 4, 5].map(s => (
                                          <button 
                                            key={s} type="button" onClick={() => setProductReviews(prev => ({ ...prev, [pid]: { ...prev[pid], rating: s } }))} 
                                            className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 ${s <= productReviews[pid].rating ? 'bg-[var(--primary)] text-white shadow-md' : 'bg-[#FAF3F0]/40 text-zinc-300 hover:bg-rose-50'}`}
                                          >
                                             <Star className={`h-5 w-5 ${s <= productReviews[pid].rating ? 'fill-current' : ''}`} strokeWidth={2} />
                                          </button>
                                       ))}
                                    </div>
                                    <textarea 
                                      value={productReviews[pid].comment} onChange={e => setProductReviews(prev => ({ ...prev, [pid]: { ...prev[pid], comment: e.target.value } }))} 
                                      className="w-full bg-[#FAF3F0]/40 border border-rose-50 rounded-2xl p-4 text-sm h-24 focus:ring-1 focus:ring-[var(--primary)] transition-all resize-none" 
                                      placeholder="رأيك في الباقة وتنسيقها..." 
                                    />
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
        <FloralFooter store={store} branding={branding} />
      </div>
    )
  }

  // ─── THEME: DEFAULT ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-inter" dir="rtl" style={{ '--primary': primaryColor } as any}>
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
                            className={`h-12 w-12 sm:h-16 sm:w-16 rounded-2xl flex items-center justify-center border-[3px] transition-all duration-500 bg-white ${isCompleted
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
                                      onClick={() => setProductReviews(prev => ({ ...prev, [item.product_id]: { ...prev[item.product_id], rating: star } }))}
                                      className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                      <Star className={`h-8 w-8 ${star <= r ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                    </button>
                                  )
                                })}
                              </div>
                              <textarea
                                value={productReviews[item.product_id]?.comment || ''}
                                onChange={(e) => setProductReviews(prev => ({ ...prev, [item.product_id]: { ...prev[item.product_id], comment: e.target.value } }))}
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
                                    onClick={() => setProductReviews(prev => ({ ...prev, [order.product_id]: { ...prev[order.product_id], rating: star } }))}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                  >
                                    <Star className={`h-8 w-8 ${star <= r ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                  </button>
                                )
                              })}
                            </div>
                            <textarea
                              value={productReviews[order.product_id]?.comment || ''}
                              onChange={(e) => setProductReviews(prev => ({ ...prev, [order.product_id]: { ...prev[order.product_id], comment: e.target.value } }))}
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
