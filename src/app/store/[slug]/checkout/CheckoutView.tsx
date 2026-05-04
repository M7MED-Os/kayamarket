'use client'

import { useCart } from '@/context/CartContext'
import { CreditCard, Banknote, CheckCircle2, Loader2, Ticket, Phone, User, MapPin } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { createOrderMulti } from '@/app/actions/order'
import { validateCoupon } from '@/app/actions/coupons'
import StoreHeader from '@/components/StoreHeader'
import StoreFooter from '@/components/StoreFooter'
import { 
  ElegantHeader, 
  ElegantFooter 
} from '@/components/store/themes/ElegantTheme'
import {
  FloralHeader,
  FloralFooter
} from '@/components/store/themes/FloralTheme'

export default function CheckoutView({ params, storeData }: { params: { slug: string }, storeData: any }) {
  const { slug } = params
  const { items, totalPrice, clearCart } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [isOrderCompleted, setIsOrderCompleted] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('الدفع عند الاستلام')
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [errors, setErrors] = useState<{name?: string, phone?: string, address?: string}>({})
  const [idempotencyKey] = useState(() => crypto.randomUUID())
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchSettings() {
      if (storeData?.store) {
        const { data } = await supabase.from('store_settings').select('*').eq('store_id', storeData.store.id).single()
        setSettings(data)
      }
    }
    fetchSettings()
  }, [storeData])

  useEffect(() => {
    if (items.length === 0 && !isOrderCompleted) {
      router.push(`/store/${slug}/cart`)
    }
  }, [items.length, isOrderCompleted, router, slug])

  if (!storeData?.store) return <div className="min-h-screen flex items-center justify-center font-black text-2xl">المتجر غير موجود</div>
  if (items.length === 0 && !isOrderCompleted) return null

  const { store, branding } = storeData
  const primaryColor = branding?.primary_color || '#e11d48'
  const selectedTheme = (branding as any)?.selected_theme || 'default'
  const finalPrice = totalPrice - (totalPrice * discount / 100)

  const commonStyles = { '--primary': primaryColor } as any

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setIsValidatingCoupon(true)
    try {
      const res = await validateCoupon(couponInput, store.id)
      if (res.success) {
        setDiscount(res.discount || 0)
        setAppliedCoupon(couponInput.toUpperCase())
        toast.success(`تم تطبيق خصم ${res.discount}%`)
      } else {
        toast.error(res.error || 'كود غير صالح')
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء فحص الكوبون')
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const handleCheckout = async () => {
    const newErrors: {name?: string, phone?: string, address?: string} = {}
    const phoneRegex = /^01[0125][0-9]{8}$/
    
    if (customerName.trim().length < 3) {
      newErrors.name = 'برجاء إدخال الاسم بالكامل (3 أحروف على الأقل)'
    }
    if (!phoneRegex.test(customerPhone.trim())) {
      newErrors.phone = 'برجاء إدخال رقم هاتف مصري صحيح (01234567890)'
    }
    if (customerAddress.trim().length < 10) {
      newErrors.address = 'برجاء إدخال العنوان بالتفصيل (10 أحرف على الأقل)'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      const res = await createOrderMulti(
        items,
        appliedCoupon,
        customerName,
        customerAddress,
        customerPhone,
        paymentMethod,
        store.id,
        idempotencyKey
      )

      if (res.success) {
        toast.success('تم إنشاء الطلب بنجاح!')
        setIsOrderCompleted(true)
        clearCart()
        const invoicePath = res.publicToken
          ? `/invoice/${res.orderId}?token=${res.publicToken}`
          : `/invoice/${res.orderId}`
        router.push(invoicePath)
      } else {
        toast.error(res.error || 'حدث خطأ أثناء إتمام الطلب')
      }
    } catch (e) {
      toast.error('حدث خطأ غير متوقع')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── THEME: ELEGANT ────────────────────────────────────────────────────────
  if (selectedTheme === 'elegant') {
    return (
      <div className="min-h-screen bg-white" dir="rtl" style={commonStyles}>
        <ElegantHeader store={store} branding={branding} slug={slug} />
        <main className="mx-auto max-w-5xl px-6 py-20">
          <div className="text-center mb-16 space-y-4">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">الدفع</span>
             <h1 className="text-4xl font-light text-zinc-900 tracking-tighter">إكمال <span className="font-bold underline decoration-zinc-200 underline-offset-8">الطلب</span></h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
             {/* Form */}
             <div className="space-y-12">
                <div className="space-y-8">
                   <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">بيانات التوصيل</h3>
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">الاسم بالكامل</label>
                         <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-zinc-50 border-none p-5 text-sm focus:ring-1 focus:ring-zinc-900 transition-all" placeholder="الاسم هنا..." />
                         {errors.name && <p className="text-[10px] font-bold text-rose-500 pt-1">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">رقم الهاتف</label>
                         <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-zinc-50 border-none p-5 text-sm focus:ring-1 focus:ring-zinc-900 transition-all text-right" dir="ltr" placeholder="01234567890" />
                         {errors.phone && <p className="text-[10px] font-bold text-rose-500 pt-1">{errors.phone}</p>}
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">العنوان بالتفصيل</label>
                         <textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-zinc-50 border-none p-5 text-sm h-32 focus:ring-1 focus:ring-zinc-900 transition-all resize-none" placeholder="المدينة، الشارع، رقم المنزل..." />
                         {errors.address && <p className="text-[10px] font-bold text-rose-500 pt-1">{errors.address}</p>}
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">طريقة الدفع</h3>
                   <div className="grid grid-cols-1 gap-4">
                      {['الدفع عند الاستلام', 'تحويل بنكي / محافظ إلكترونية'].map(method => {
                        const isCOD = method === 'الدفع عند الاستلام';
                        const showDeposit = isCOD && settings?.cod_deposit_required;
                        return (
                          <button key={method} onClick={() => setPaymentMethod(method)} className={`p-6 text-right border transition-all duration-500 ${paymentMethod === method ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-100 text-zinc-400 hover:border-zinc-300'}`}>
                             <div className="flex flex-col gap-1">
                                <span className="text-xs font-black uppercase tracking-widest">{method}</span>
                                {showDeposit && (
                                   <span className={`text-[9px] font-bold uppercase ${paymentMethod === method ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                      مطلوب مقدم {settings.deposit_percentage}% ({(finalPrice * settings.deposit_percentage / 100).toLocaleString()} ج.م)
                                   </span>
                                )}
                             </div>
                          </button>
                        );
                      })}
                   </div>
                </div>
             </div>

             {/* Summary */}
             <div className="space-y-12">
                <div className="bg-zinc-50 p-6 sm:p-10 space-y-10">
                   <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">ملخص الطلب</h3>
                   <div className="space-y-6">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between items-center group">
                           <div className="flex items-center gap-4">
                              <span className="text-[10px] font-bold text-zinc-400 italic">{item.quantity}x</span>
                              <span className="text-sm font-bold text-zinc-900 uppercase tracking-wide truncate max-w-[120px] sm:max-w-[150px]">{item.name}</span>
                           </div>
                           <span className="text-sm font-light text-zinc-400">{(item.price * item.quantity).toLocaleString()} ج.م</span>
                        </div>
                      ))}
                   </div>

                   <div className="pt-10 border-t border-zinc-200 space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">المجموع الفرعي</span>
                         <span className="text-sm font-bold text-zinc-900">{totalPrice.toLocaleString()} ج.م</span>
                      </div>
                      {discount > 0 && (
                         <div className="flex justify-between items-center text-emerald-600">
                            <span className="text-[10px] font-black uppercase tracking-widest">خصم ({discount}%)</span>
                            <span className="text-sm font-bold">-{(totalPrice * discount / 100).toLocaleString()} ج.م</span>
                         </div>
                      )}
                      <div className="flex justify-between items-end pt-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">الإجمالي الكلي</span>
                          <span className="text-3xl font-light text-zinc-900 tracking-tighter">{finalPrice.toLocaleString()} ج.م</span>
                       </div>
                    </div>

                    {/* Coupon Section */}
                    <div className="space-y-4 pt-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">كوبون الخصم</label>
                       <div className="flex flex-col sm:flex-row gap-3">
                          <input 
                            value={couponInput} 
                            onChange={e => setCouponInput(e.target.value)} 
                            className="flex-1 bg-zinc-50 border border-zinc-100 sm:border-none p-4 sm:p-5 text-sm focus:ring-1 focus:ring-zinc-900 transition-all uppercase tracking-widest outline-none" 
                            placeholder="أدخل الكود..." 
                          />
                          <button 
                            onClick={handleApplyCoupon} 
                            disabled={isValidatingCoupon || !!appliedCoupon || !couponInput.trim()}
                            className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-0 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50 whitespace-nowrap"
                          >
                            {isValidatingCoupon ? '...' : appliedCoupon ? 'مطبق' : 'تطبيق'}
                          </button>
                       </div>
                    </div>

                    <button onClick={handleCheckout} disabled={submitting} className="w-full h-20 bg-zinc-900 text-white flex items-center justify-center text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors shadow-lg disabled:opacity-50">
                       {submitting ? 'جاري التنفيذ...' : 'تأكيد الطلب الآن'}
                    </button>
                </div>
             </div>
          </div>
        </main>
        <ElegantFooter store={store} branding={branding} />
      </div>
    )
  }

  // ─── THEME: FLORAL ─────────────────────────────────────────────────────────
  if (selectedTheme === 'floral') {
    return (
      <div className="min-h-screen bg-[#FAF3F0]/20" dir="rtl" style={commonStyles}>
        <FloralHeader store={store} branding={branding} slug={slug} />
        <main className="mx-auto max-w-5xl px-6 py-24">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif italic text-[#2B2B2B]">تأكيد الطلب</h1>
            <p className="text-zinc-500 font-medium">خطوة أخيرة لتأكيد باقتك المميزة</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
             {/* Form */}
             <div className="space-y-12">
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-rose-50 shadow-sm space-y-8">
                   <div className="flex items-center gap-3 border-b border-rose-50 pb-4">
                      <div className="h-10 w-10 bg-rose-50 rounded-full flex items-center justify-center">
                         <User className="h-5 w-5 text-[var(--primary)]" />
                      </div>
                      <h3 className="text-lg font-serif text-[#2B2B2B]">بيانات المستلم</h3>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-sm font-bold text-zinc-600">الاسم بالكامل</label>
                         <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-[#FAF3F0]/40 border border-rose-50 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all placeholder:text-zinc-400" placeholder="الاسم هنا..." />
                         {errors.name && <p className="text-xs font-bold text-rose-500 pt-1">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-bold text-zinc-600">رقم الهاتف</label>
                         <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-[#FAF3F0]/40 border border-rose-50 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all text-right placeholder:text-zinc-400" dir="ltr" placeholder="01234567890" />
                         {errors.phone && <p className="text-xs font-bold text-rose-500 pt-1">{errors.phone}</p>}
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-bold text-zinc-600">العنوان بالتفصيل</label>
                         <textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-[#FAF3F0]/40 border border-rose-50 rounded-2xl p-4 text-sm h-32 focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all resize-none placeholder:text-zinc-400" placeholder="المدينة، الشارع، رقم المنزل..." />
                         {errors.address && <p className="text-xs font-bold text-rose-500 pt-1">{errors.address}</p>}
                      </div>
                   </div>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-rose-50 shadow-sm space-y-8">
                   <div className="flex items-center gap-3 border-b border-rose-50 pb-4">
                      <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center">
                         <CreditCard className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-serif text-[#2B2B2B]">طريقة الدفع</h3>
                   </div>
                   <div className="grid grid-cols-1 gap-4">
                      {['الدفع عند الاستلام', 'تحويل بنكي / محافظ إلكترونية'].map(method => {
                        const isCOD = method === 'الدفع عند الاستلام';
                        const showDeposit = isCOD && settings?.cod_deposit_required;
                        return (
                          <button key={method} onClick={() => setPaymentMethod(method)} className={`p-6 text-right rounded-2xl border transition-all duration-300 ${paymentMethod === method ? 'border-[var(--primary)] bg-rose-50/50' : 'border-zinc-100 hover:border-rose-100 bg-zinc-50/50'}`}>
                             <div className="flex flex-col gap-1">
                                <span className={`text-sm font-bold ${paymentMethod === method ? 'text-[var(--primary)]' : 'text-zinc-600'}`}>{method}</span>
                                {showDeposit && (
                                   <span className={`text-xs font-medium ${paymentMethod === method ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                      مطلوب مقدم {settings.deposit_percentage}% ({(finalPrice * settings.deposit_percentage / 100).toLocaleString()} ج.م)
                                   </span>
                                )}
                             </div>
                          </button>
                        );
                      })}
                   </div>
                </div>
             </div>

             {/* Summary */}
             <div className="space-y-8 lg:sticky lg:top-32">
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-rose-50 shadow-sm space-y-8">
                   <h3 className="text-lg font-serif text-[#2B2B2B] border-b border-rose-50 pb-4">ملخص الطلب</h3>
                   <div className="space-y-4">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between items-center group bg-[#FAF3F0]/20 p-4 rounded-2xl border border-rose-50/50">
                           <div className="flex items-center gap-3">
                              <span className="h-6 w-6 rounded-full bg-white border border-rose-100 flex items-center justify-center text-xs font-bold text-[var(--primary)]">{item.quantity}</span>
                              <span className="text-sm font-bold text-[#2B2B2B] truncate max-w-[120px] sm:max-w-[150px]">{item.name}</span>
                           </div>
                           <span className="text-sm font-black text-[var(--primary)]">{(item.price * item.quantity).toLocaleString()} ج.م</span>
                        </div>
                      ))}
                   </div>

                   <div className="pt-6 border-t border-rose-50 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                         <span className="font-bold text-zinc-500">المجموع الفرعي</span>
                         <span className="font-bold text-[#2B2B2B]">{totalPrice.toLocaleString()} ج.م</span>
                      </div>
                      {discount > 0 && (
                         <div className="flex justify-between items-center text-sm text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                            <span className="font-bold">خصم ({discount}%)</span>
                            <span className="font-bold">-{(totalPrice * discount / 100).toLocaleString()} ج.م</span>
                         </div>
                      )}
                      <div className="flex justify-between items-end pt-4">
                          <span className="text-base font-bold text-zinc-600">الإجمالي الكلي</span>
                          <span className="text-3xl font-black text-[var(--primary)]">{finalPrice.toLocaleString()} ج.م</span>
                       </div>
                    </div>

                    {/* Coupon Section */}
                    <div className="space-y-3 pt-6 border-t border-rose-50">
                       <label className="text-sm font-bold text-zinc-600">كوبون الخصم</label>
                       <div className="flex gap-2">
                          <input 
                            value={couponInput} 
                            onChange={e => setCouponInput(e.target.value)} 
                            className="flex-1 bg-[#FAF3F0]/40 border border-rose-50 rounded-xl p-4 text-sm focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-all uppercase placeholder:text-zinc-400" 
                            placeholder="أدخل الكود..." 
                          />
                          <button 
                            onClick={handleApplyCoupon} 
                            disabled={isValidatingCoupon || !!appliedCoupon || !couponInput.trim()}
                            className="px-6 py-4 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 whitespace-nowrap"
                          >
                            {isValidatingCoupon ? '...' : appliedCoupon ? 'مطبق' : 'تطبيق'}
                          </button>
                       </div>
                    </div>

                    <button onClick={handleCheckout} disabled={submitting} className="w-full h-16 mt-6 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-[var(--primary)]/90 transition-all shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none">
                       {submitting ? 'جاري التنفيذ...' : 'تأكيد الطلب الآن'}
                    </button>
                </div>
             </div>
          </div>
        </main>
        <FloralFooter store={store} branding={branding} />
      </div>
    )
  }

  // ─── THEME: DEFAULT ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 font-inter" dir="rtl" style={commonStyles}>
      <StoreHeader store={store} branding={branding} slug={slug} />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Customer Info Form */}
          <div className="space-y-6 md:space-y-8">
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 pr-2">بيانات التوصيل</h1>
            
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-zinc-100 p-6 md:p-8 shadow-xl shadow-zinc-200/50 space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-zinc-700 mb-2">الاسم بالكامل <span className="text-rose-500">*</span></label>
                  <input 
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className={`w-full h-12 md:h-14 bg-zinc-50 border rounded-xl md:rounded-2xl px-5 md:px-6 text-sm font-black outline-none transition-all ${errors.name ? 'border-rose-500 bg-rose-50' : 'border-zinc-100 focus:bg-white focus:border-[var(--primary)]'}`}
                    placeholder="الاسم بالكامل"
                  />
                  {errors.name && <p className="text-[10px] font-bold text-rose-500 mt-1.5 pr-2">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-zinc-700 mb-2">رقم التليفون <span className="text-rose-500">*</span></label>
                  <input 
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    dir="ltr"
                    className={`w-full h-12 md:h-14 bg-zinc-50 border rounded-xl md:rounded-2xl px-5 md:px-6 text-sm font-black outline-none text-right transition-all ${errors.phone ? 'border-rose-500 bg-rose-50' : 'border-zinc-100 focus:bg-white focus:border-[var(--primary)]'}`}
                    placeholder="رقم الموبايل للتواصل"
                  />
                  {errors.phone && <p className="text-[10px] font-bold text-rose-500 mt-1.5 pr-2">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-zinc-700 mb-2">عنوان التوصيل <span className="text-rose-500">*</span></label>
                  <textarea 
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    className={`w-full h-24 md:h-32 bg-zinc-50 border rounded-xl md:rounded-2xl p-5 md:p-6 text-sm font-bold outline-none resize-none transition-all ${errors.address ? 'border-rose-500 bg-rose-50' : 'border-zinc-100 focus:bg-white focus:border-[var(--primary)]'}`}
                    placeholder="المدينة، المنطقة، الشارع، رقم العمارة"
                  />
                  {errors.address && <p className="text-[10px] font-bold text-rose-500 mt-1.5 pr-2">{errors.address}</p>}
                </div>
              </div>

              {/* Coupon Section */}
              <div className="pt-6 border-t border-zinc-50">
                <label className="block text-xs md:text-sm font-bold text-zinc-700 mb-2">كوبون الخصم (اختياري)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input 
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      disabled={!!appliedCoupon}
                      className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-11 text-sm font-black outline-none focus:bg-white focus:border-[var(--primary)] transition-all uppercase"
                      placeholder="أدخل الكود..."
                    />
                  </div>
                  <button 
                    onClick={handleApplyCoupon} 
                    disabled={isValidatingCoupon || !!appliedCoupon || !couponInput.trim()}
                    className="px-6 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all disabled:opacity-50"
                  >
                    {isValidatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : appliedCoupon ? 'مطبق' : 'تطبيق'}
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-[10px] font-bold text-emerald-600 mt-2 pr-1">تم تطبيق الخصم بنجاح!</p>
                )}
              </div>

              <div className="pt-6 border-t border-zinc-50 mt-6">
                <label className="block text-xs md:text-sm font-bold text-zinc-700 mb-4">طريقة الدفع</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { 
                      id: 'cod', 
                      label: 'الدفع عند الاستلام', 
                      icon: Banknote, 
                      subtext: 'الدفع عند الاستلام',
                      desc: settings?.cod_deposit_required 
                        ? `مطلوب مقدم ${settings.deposit_percentage}% (${Number((finalPrice * settings.deposit_percentage) / 100).toFixed(2)} ج.م)`
                        : 'ادفع نقداً عند استلام طلبك',
                      enabled: settings?.cod_enabled ?? true
                    },
                    { 
                      id: 'online', 
                      label: 'تحويل بنكي / محافظ إلكترونية', 
                      icon: CreditCard, 
                      subtext: 'دفع إلكتروني',
                      desc: 'إنستا باي / محافظ',
                      enabled: true
                    }
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => method.enabled && setPaymentMethod(method.label)}
                      disabled={!method.enabled}
                      className={`flex items-center gap-4 p-4 rounded-xl md:rounded-2xl border-2 transition-all text-right 
                        ${!method.enabled ? 'opacity-50 grayscale cursor-not-allowed border-zinc-100' : 
                          paymentMethod === method.label ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-zinc-100 hover:border-[var(--primary)]/30'}`}
                    >
                      <div className={`h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 ${paymentMethod === method.label ? 'bg-[var(--primary)] text-white' : 'bg-zinc-50 text-zinc-400'}`}>
                        <method.icon className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm md:text-base font-black ${paymentMethod === method.label ? 'text-zinc-900' : 'text-zinc-700'}`}>{method.subtext}</p>
                        {method.id === 'cod' && settings?.cod_deposit_required ? (
                          <p className="text-[10px] text-[var(--primary)] font-black mt-1 bg-[var(--primary)]/10 px-1.5 py-0.5 rounded inline-block">
                            {method.desc}
                          </p>
                        ) : (
                          <p className="text-[10px] font-bold text-zinc-400">{method.desc}</p>
                        )}
                        {!method.enabled && <p className="text-[9px] font-black text-rose-500 mt-1">غير متاح حالياً</p>}
                      </div>
                      {paymentMethod === method.label && <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-[var(--primary)]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6 md:space-y-8">
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 pr-2">ملخص الطلب</h2>
            
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-zinc-100 p-6 md:p-8 shadow-xl shadow-zinc-200/50 space-y-6">
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex gap-3 items-center overflow-hidden">
                      <span className="h-6 w-6 shrink-0 flex items-center justify-center bg-zinc-100 rounded-md font-black text-[10px]">{item.quantity}x</span>
                      <span className="font-bold text-zinc-700 truncate">{item.name}</span>
                    </div>
                    <span className="font-black text-zinc-900 shrink-0">{(item.price * item.quantity).toLocaleString()} ج.م</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-zinc-100 space-y-3">
                <div className="flex justify-between text-zinc-400 font-bold text-xs md:text-sm">
                  <span>المجموع الفرعي</span>
                  <span>{totalPrice.toLocaleString()} ج.م</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold text-xs md:text-sm">
                    <span>خصم ({discount}%)</span>
                    <span>-{(totalPrice * discount / 100).toLocaleString()} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-xl md:text-2xl font-black text-zinc-900 pt-2">
                  <span>الإجمالي الكلي</span>
                  <span className="text-[var(--primary)]">{finalPrice.toLocaleString()} ج.م</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full h-14 md:h-16 bg-zinc-900 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg flex items-center justify-center gap-3 hover:bg-zinc-800 shadow-xl shadow-zinc-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" /> : <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />}
                تأكيد الطلب
              </button>
            </div>
          </div>
        </div>
      </main>
      <StoreFooter store={store} branding={branding} slug={slug} />
    </div>
  )
}
