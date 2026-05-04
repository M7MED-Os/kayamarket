'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types/product'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Banknote, CreditCard } from 'lucide-react'
import { createOrder } from '@/app/actions/order'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useCart } from '@/context/CartContext'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import CountdownTimer from './CountdownTimer'

interface CheckoutBoxProps {
  product: Product
  /** Multi-tenant: UUID of the owning store. Required for validate_coupon() RPC. */
  storeId?: string
  /** Multi-tenant: slug used to build the back-link after order. */
  storeSlug?: string
  selectedTheme?: string
}

export default function CheckoutBox({ product, storeId, storeSlug, selectedTheme = 'default' }: CheckoutBoxProps) {
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('الدفع عند الاستلام')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const [settings, setSettings] = useState<{ cod_enabled: boolean; cod_deposit_required: boolean; deposit_percentage: number; policies?: string }>({ cod_enabled: true, cod_deposit_required: false, deposit_percentage: 50 })
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => crypto.randomUUID())
  const router = useRouter()
  const supabase = createClient()

  const isElegant = selectedTheme === 'elegant'

  useEffect(() => {
    async function fetchSettings() {
      let query = supabase.from('store_settings').select('*')
      if (storeId) {
        query = query.eq('store_id', storeId) as typeof query
      }
      const { data } = await query.single()
      if (data) {
        setSettings(data)
        if (!data.cod_enabled && paymentMethod === 'الدفع عند الاستلام') {
          setPaymentMethod('تحويل بنكي / محافظ إلكترونية')
        }
      }
    }
    fetchSettings()
  }, [storeId])

  const applyCoupon = async () => {
    if (!couponCode) return
    setLoading(true)
    try {
      if (storeId) {
        const { data, error } = await supabase.rpc('validate_coupon', { p_store_id: storeId, p_code: couponCode.trim() })
        if (error) {
          setDiscount(0)
          toast.error('تعذّر التحقق من الكوبون')
        } else if (data && data[0]?.is_valid) {
          setDiscount(data[0].discount_percentage)
          toast.success(`تم تفعيل خصم ${data[0].discount_percentage}%`)
        } else {
          setDiscount(0)
          toast.error(data?.[0]?.error_message || 'كود غير صحيح')
        }
      }
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const finalPrice = product.price ? (product.price - (product.price * discount / 100)) * quantity : null

  const handleOrder = async () => {
    if (!customerName.trim() || !customerAddress.trim()) {
      toast.error('برجاء إدخال الاسم والعنوان')
      return
    }
    setLoading(true)
    try {
      const finalPaymentMethod = (paymentMethod === 'الدفع عند الاستلام' && settings.cod_deposit_required) ? 'الدفع عند الاستلام (عربون)' : paymentMethod
      const result = await createOrder(product, couponCode, customerName.trim(), customerAddress.trim(), customerPhone.trim(), finalPaymentMethod, storeId, idempotencyKey, quantity)
      if (result.success && result.orderId) {
        toast.success('تم تسجيل الطلب بنجاح!')
        setIdempotencyKey(crypto.randomUUID())
        const invoicePath = result.publicToken ? `/invoice/${result.orderId}?token=${result.publicToken}` : `/invoice/${result.orderId}`
        router.push(invoicePath)
      } else {
        toast.error(result.error || 'حدث خطأ')
        setLoading(false)
      }
    } catch {
      toast.error('حدث خطأ')
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    addItem({ id: product.id, name: product.name, price: product.price ?? 0, original_price: product.original_price ?? undefined, image_url: product.image_url ?? undefined, description: product.description ?? undefined, quantity })
    toast.success('تمت الإضافة للسلة')
  }

  const [showCartHint, setShowCartHint] = useState(false)

  useEffect(() => {
    let timer: any
    if (showCartHint) {
      timer = setTimeout(() => setShowCartHint(false), 5000)
    }
    return () => clearTimeout(timer)
  }, [showCartHint])

  const handleAddToCartWithHint = () => {
    handleAddToCart()
    setShowCartHint(true)
  }

  if (isElegant) {
    return (
      <div className="space-y-10">
        <div className="space-y-2">
           <div className="flex items-baseline gap-3">
              <span className="text-4xl font-light text-zinc-900 tracking-tighter">
                {Number(finalPrice).toLocaleString()} ج.م
              </span>
              {(product.price && ((product.original_price && product.original_price > product.price) || discount > 0)) && (
                <span className="text-xl line-through text-zinc-300 font-light italic">
                  {Number(product.original_price || product.price).toLocaleString()}
                </span>
              )}
           </div>

           {/* Countdown Timer (Themed) */}
           {product.sale_end_date && new Date(product.sale_end_date) > new Date() && (
             <div className="py-4 border-y border-zinc-50 flex items-center gap-6">
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 rotate-180 [writing-mode:vertical-lr]">تنتهي قريباً</span>
               <CountdownTimer endDate={product.sale_end_date} selectedTheme={selectedTheme} />
             </div>
           )}

           {product.stock !== null && (
              <div className="flex items-center gap-2">
                 <div className={`h-1 w-1 rounded-none ${product.stock > 0 ? 'bg-[var(--primary)]' : 'bg-zinc-200'}`} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {product.stock > 0 ? `متوفر: ${product.stock} قطعة` : 'نفذت الكمية'}
                 </span>
              </div>
           )}
        </div>

        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">الاسم</label>
                 <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-zinc-50 border-none p-4 text-xs focus:ring-1 focus:ring-[var(--primary)] transition-all rounded-none" placeholder="الاسم بالكامل..." />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">رقم الهاتف</label>
                 <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-zinc-50 border-none p-4 text-xs focus:ring-1 focus:ring-[var(--primary)] transition-all text-right rounded-none" dir="ltr" placeholder="01234567890" />
              </div>
           </div>
           <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">العنوان</label>
              <input value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-zinc-50 border-none p-4 text-xs focus:ring-1 focus:ring-[var(--primary)] transition-all rounded-none" placeholder="المدينة، الشارع، رقم المنزل..." />
           </div>

            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">طريقة الدفع</label>
              <div className="flex flex-col sm:flex-row gap-4">
                 {['الدفع عند الاستلام', 'تحويل بنكي / محافظ إلكترونية'].map(m => (
                    <button key={m} onClick={() => setPaymentMethod(m)} className={`flex-1 p-4 text-[10px] font-black uppercase tracking-widest border transition-all duration-500 rounded-none ${paymentMethod === m ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-zinc-100 text-zinc-400 hover:border-[var(--primary)]/30'}`}>
                       {m}
                    </button>
                 ))}
              </div>
              {paymentMethod === 'الدفع عند الاستلام' && settings.cod_deposit_required && (
                <div className="p-4 bg-zinc-50 border border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-900 flex justify-between items-center rounded-none">
                  <span>مقدم مطلوب ({settings.deposit_percentage}%)</span>
                  <span>{finalPrice ? ((finalPrice * settings.deposit_percentage) / 100).toLocaleString() : '0'} ج.م</span>
                </div>
              )}
            </div>

           {/* Coupon Section */}
           <div className="space-y-4 pt-4 border-t border-zinc-100">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400">كوبون الخصم</label>
              <div className="flex gap-4">
                 <input 
                   value={couponCode} 
                   onChange={e => setCouponCode(e.target.value)} 
                   className="flex-1 bg-zinc-50 border-none p-4 text-xs focus:ring-1 focus:ring-[var(--primary)] transition-all uppercase tracking-widest rounded-none" 
                   placeholder="أدخل الكود..." 
                 />
                 <button 
                   onClick={applyCoupon} 
                   disabled={loading || !couponCode}
                   className="px-8 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-125 transition-all disabled:brightness-75 rounded-none"
                 >
                   تطبيق
                 </button>
              </div>
              {discount > 0 && <p className="text-[10px] font-black text-emerald-600">تم تطبيق خصم {discount}%</p>}
           </div>

           <div className="pt-6 space-y-4">
              <div className="flex gap-4">
                 <div className="flex items-center bg-zinc-50 px-2 py-2 gap-2 rounded-none">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-[var(--primary)] transition-colors"><Minus className="h-4 w-4" /></button>
                    <span className="text-base font-black w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-[var(--primary)] transition-colors"><Plus className="h-4 w-4" /></button>
                 </div>
                 <div className="flex-1 relative">
                    <button onClick={handleAddToCartWithHint} className="w-full bg-white border border-[var(--primary)] text-[var(--primary)] h-14 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--primary)] hover:text-white transition-all duration-500 rounded-none">
                       <ShoppingCart className="h-4 w-4" />
                       إضافة للسلة
                    </button>
                    {showCartHint && (
                      <div className="absolute bottom-full mb-3 left-0 right-0 bg-zinc-900 text-white text-[9px] font-black px-4 py-2 rounded-none text-center animate-in fade-in slide-in-from-bottom-2 duration-300 uppercase tracking-widest shadow-xl z-20">
                        هذا الزر يقوم بإضافة المنتج لسلة المشتريات
                      </div>
                    )}
                 </div>
              </div>
              <button onClick={handleOrder} disabled={loading} className="w-full bg-[var(--primary)] text-white h-16 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-125 transition-all shadow-lg disabled:brightness-75 rounded-none">
                 {loading ? 'جاري التنفيذ...' : 'تأكيد الطلب الآن'}
              </button>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-3">
          {product.price ? (
            <>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="text-5xl font-black text-primary-600">
                    {Number(finalPrice).toFixed(2)}
                  </span>
                  {(product.price && ((product.original_price && product.original_price > product.price) || discount > 0)) && (
                    <span className="text-2xl line-through text-zinc-400 font-bold">
                      {Number(product.original_price || product.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xl font-semibold text-zinc-400">ج.م</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-zinc-400">السعر عند التواصل</span>
          )}
        </div>


        {/* Countdown Timer */}
        {product.sale_end_date && new Date(product.sale_end_date) > new Date() && (
          <div className="mt-4 animate-in slide-in-from-bottom-2 duration-500">
            <CountdownTimer endDate={product.sale_end_date} />
          </div>
        )}

        {/* Stock Status */}
        {product.stock !== null ? (
          <div className="mt-4 flex items-center gap-2">
            {product.stock > 0 && product.stock < 5 ? (
              <div className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-2.5 py-1 rounded-md border border-rose-100">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-black">كمية محدودة: {product.stock} فقط!</span>
              </div>
            ) : (
              <>
                <div className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-primary-500'}`} />
                <span className={`text-xs font-bold ${product.stock > 0 ? 'text-zinc-500' : 'text-primary-600'}`}>
                  {product.stock > 0 ? `متوفر في المخزون: ${product.stock}` : 'غير متوفر حالياً'}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-bold text-zinc-500">متوفر في المخزون</span>
          </div>
        )}
      </div>

      <div className="h-px bg-primary-100" />

      {/* Quantity Selector */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-black text-zinc-700">الكمية:</label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center bg-zinc-50 border border-zinc-100 rounded-2xl p-1 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-10 w-12 sm:w-10 flex items-center justify-center rounded-xl bg-white text-zinc-600 hover:text-primary-600 shadow-sm transition-all active:scale-90"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-16 text-center text-xl font-black text-primary-600">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="h-10 w-12 sm:w-10 flex items-center justify-center rounded-xl bg-white text-zinc-600 hover:text-primary-600 shadow-sm transition-all active:scale-90"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start">
            <span className="text-sm font-bold text-zinc-500">
              السعر الإجمالي: <span className="text-primary-600 font-black text-base">{finalPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م</span>
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-primary-100" />

      {/* Customer Details */}
      {product.price && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">الاسم <span className="text-primary-500">*</span></label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="الاسم بالكامل"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">رقم التليفون <span className="text-primary-500">*</span></label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="رقم الموبايل للتواصل"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-right"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">عنوان التوصيل <span className="text-primary-500">*</span></label>
            <input
              type="text"
              required
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="المدينة، المنطقة، الشارع، رقم العمارة"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">طريقة الدفع <span className="text-primary-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`relative flex rounded-xl border p-4 transition-all ${!settings.cod_enabled ? 'cursor-not-allowed opacity-60 bg-zinc-50 border-zinc-200' : paymentMethod === 'الدفع عند الاستلام' ? 'cursor-pointer border-primary-600 bg-primary-50/50 shadow-sm' : 'cursor-pointer border-zinc-200 hover:border-primary-200 bg-white'}`}>
                <input type="radio" name="paymentMethod" value="الدفع عند الاستلام" checked={paymentMethod === 'الدفع عند الاستلام'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={!settings.cod_enabled} className="sr-only" />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${!settings.cod_enabled ? 'bg-zinc-200 text-zinc-400' : paymentMethod === 'الدفع عند الاستلام' ? 'bg-primary-100 text-primary-600' : 'bg-zinc-100 text-zinc-500'}`}>
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${!settings.cod_enabled ? 'text-zinc-500 line-through' : paymentMethod === 'الدفع عند الاستلام' ? 'text-primary-900' : 'text-zinc-700'}`}>الدفع عند الاستلام</p>
                      {settings.cod_enabled && settings.cod_deposit_required && (
                        <p className="text-[10px] text-primary-600 font-black mt-1 bg-primary-100 px-1.5 py-0.5 rounded inline-block">
                          مقدم {settings.deposit_percentage}% {finalPrice ? `(${Number((finalPrice * settings.deposit_percentage) / 100).toFixed(2)} ج.م)` : ''}
                        </p>
                      )}
                      {!settings.cod_enabled && <p className="text-[10px] text-zinc-500 font-bold mt-1">غير متاح حالياً</p>}
                    </div>
                  </div>
                  {paymentMethod === 'الدفع عند الاستلام' && <CheckCircle2 className="h-5 w-5 text-primary-600" />}
                </div>
              </label>

              <label className={`relative flex cursor-pointer rounded-xl border p-4 transition-all ${paymentMethod === 'تحويل بنكي / محافظ إلكترونية' ? 'border-primary-600 bg-primary-50/50 shadow-sm' : 'border-zinc-200 hover:border-primary-200 bg-white'}`}>
                <input type="radio" name="paymentMethod" value="تحويل بنكي / محافظ إلكترونية" checked={paymentMethod === 'تحويل بنكي / محافظ إلكترونية'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${paymentMethod === 'تحويل بنكي / محافظ إلكترونية' ? 'bg-primary-100 text-primary-600' : 'bg-zinc-100 text-zinc-500'}`}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${paymentMethod === 'تحويل بنكي / محافظ إلكترونية' ? 'text-primary-900' : 'text-zinc-700'}`}>دفع إلكتروني</p>
                      <p className="text-[10px] text-zinc-500 font-bold mt-1">إنستا باي / محافظ</p>
                    </div>
                  </div>
                  {paymentMethod === 'تحويل بنكي / محافظ إلكترونية' && <CheckCircle2 className="h-5 w-5 text-primary-600" />}
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Input */}
      {product.price && (
        <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-4 space-y-3">
          <label className="block text-sm font-bold text-zinc-700 mb-1 text-right">
            كوبون الخصم <span className="text-zinc-400 font-normal">(اختياري)</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="أدخل الكود هنا..."
              className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-center uppercase tracking-widest outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all placeholder:tracking-normal placeholder:text-right min-w-0"
            />
            <button
              onClick={applyCoupon}
              disabled={loading || !couponCode}
              className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
            >
              {loading ? '...' : 'تطبيق'}
            </button>
          </div>
          {discount > 0 && (
            <p className="text-sm font-bold text-emerald-600 text-right pr-1">
              تم تفعيل خصم {discount}%
            </p>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="space-y-3 pt-4 border-t border-primary-100 mt-6">
        {settings.policies && (
          <div className="mb-4 rounded-xl bg-zinc-50 border border-zinc-100 p-4">
            <h4 className="text-xs font-black text-zinc-900 mb-2">سياسات المتجر:</h4>
            <p className="text-xs text-zinc-500 leading-relaxed whitespace-pre-line font-medium">
              {settings.policies}
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={handleOrder}
            disabled={loading || product.stock === 0 || !!(product.price && (!customerName.trim() || !customerAddress.trim() || !customerPhone.trim()))}
            className="w-full sm:flex-[2] inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 h-14 text-lg font-bold text-white transition hover:bg-primary-700 shadow-lg shadow-primary-200 disabled:opacity-50 disabled:bg-zinc-400 disabled:shadow-none"
          >
            {loading ? 'جاري التحضير...' : product.stock === 0 ? 'نفذت الكمية' : 'تأكيد الطلب'}
          </button>
          
          <button
            onClick={handleAddToCart}
            className="w-full sm:flex-[1] flex items-center justify-center gap-2 h-14 bg-zinc-900 text-white rounded-2xl font-black text-sm hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
          >
            <ShoppingCart className="h-5 w-5" />
            إضافة للسلة
          </button>
        </div>
        <p className="text-center text-xs text-zinc-400">
          سيتم إنشاء فاتورة إلكترونية لطلبك مع خيارات الدفع المتاحة
        </p>
      </div>
    </div>
  )
}
