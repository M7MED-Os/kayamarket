'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types/product'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Banknote, CreditCard, ShoppingCart, Minus, Plus } from 'lucide-react'
import WishlistButton from './WishlistButton'
import { createOrder } from '@/app/actions/order'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useCart } from '@/context/CartContext'
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
  
  // Variants Support
  const hasVariants = product.variants && product.variants.length > 0
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0)
  
  const selectedVariant = hasVariants ? product.variants[selectedVariantIdx] : null
  const selectedSize = (selectedVariant && selectedVariant.sizes[selectedSizeIdx]) ? selectedVariant.sizes[selectedSizeIdx] : null

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

  const basePrice = (selectedSize && selectedSize.price_override) ? Number(selectedSize.price_override) : (product.price || 0)
  const finalPrice = (basePrice - (basePrice * discount / 100)) * quantity

  const handleOrder = async () => {
    if (!customerName.trim() || !customerAddress.trim()) {
      toast.error('برجاء إدخال الاسم والعنوان')
      return
    }
    setLoading(true)
    try {
      const variantInfo = hasVariants ? {
        color: selectedVariant.color,
        size: selectedSize?.size
      } : null

      const finalPaymentMethod = (paymentMethod === 'الدفع عند الاستلام' && settings.cod_deposit_required) ? 'الدفع عند الاستلام (عربون)' : paymentMethod
      const result = await createOrder(product, couponCode, customerName.trim(), customerAddress.trim(), customerPhone.trim(), finalPaymentMethod, storeId, idempotencyKey, quantity, variantInfo, basePrice)
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
    const variantInfo = hasVariants ? {
      color: selectedVariant.color,
      size: selectedSize?.size
    } : null

    // Generate a unique ID for this specific variant combination
    const variantKey = variantInfo ? `-${variantInfo.color}-${variantInfo.size}` : ''
    const cartItemId = `${product.id}${variantKey}`

    const newItem = { 
      id: product.id, 
      cartItemId,
      name: product.name, 
      price: basePrice, 
      original_price: product.original_price ?? undefined, 
      image_url: product.image_url ?? undefined, 
      description: product.description ?? undefined, 
      quantity,
      variant_info: variantInfo
    }
    addItem(newItem)
    toast.success('تمت الإضافة للسلة')
  }

  if (isElegant) {
    return (
      <div className="space-y-8">
        {/* Dynamic Price Display - Styled to match Elegant theme header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-6">
            <div className="text-4xl font-bold text-[var(--primary)] tracking-tighter">
              {finalPrice?.toLocaleString()} <span className="text-sm font-black opacity-60">ج.م</span>
            </div>
            {product.original_price && Number(product.original_price) > basePrice && (
              <div className="text-lg font-bold text-zinc-300 line-through decoration-zinc-100">
                {Number(product.original_price).toLocaleString()} ج.م
              </div>
            )}
          </div>
          
          {/* Stock Badge */}
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${product.stock === 0 ? 'bg-zinc-200' : 'bg-[var(--primary)] animate-pulse'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {product.stock === 0 ? 'غير متوفر حالياً' : 'متوفر في المخزون'}
            </span>
          </div>
        </div>

        {/* Variants Selection (Elegant) */}
        {hasVariants && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Colors - Only show if color name is not "مقاسات المنتج" */}
            {selectedVariant.color !== 'مقاسات المنتج' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">اختر اللون</label>
                  <span className="text-[10px] font-black text-[var(--primary)]">{selectedVariant.color}</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {product.variants.map((v: any, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedVariantIdx(i)
                        setSelectedSizeIdx(0)
                      }}
                      className={`group relative h-9 w-9 rounded-full transition-all duration-500 ${selectedVariantIdx === i ? 'ring-1 ring-offset-4 ring-[var(--primary)] scale-110' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                      style={{ backgroundColor: v.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">المقاس المتاح</label>
              <div className="flex flex-wrap gap-3">
                {selectedVariant.sizes.map((s: any, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedSizeIdx(i)}
                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest border transition-all duration-500 rounded-none ${selectedSizeIdx === i ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-lg' : 'border-zinc-100 text-zinc-400 hover:border-zinc-300'}`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-300 px-1">الاسم</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} disabled={product.stock === 0} className="w-full bg-zinc-50 border-none p-4 text-xs focus:ring-1 focus:ring-[var(--primary)] transition-all rounded-none" placeholder="الاسم بالكامل..." />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-300 px-1">رقم الهاتف</label>
              <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} disabled={product.stock === 0} className="w-full bg-zinc-50 border-none p-4 text-xs focus:ring-1 focus:ring-[var(--primary)] transition-all text-right rounded-none" dir="ltr" placeholder="01xxxxxxxxx" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-300 px-1">العنوان</label>
            <input value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} disabled={product.stock === 0} className="w-full bg-zinc-50 border-none p-4 text-xs focus:ring-1 focus:ring-[var(--primary)] transition-all rounded-none" placeholder="المدينة، الشارع، رقم المنزل..." />
          </div>

          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-300 px-1">طريقة الدفع</label>
            <div className="flex flex-col sm:flex-row gap-4">
              {['الدفع عند الاستلام', 'تحويل بنكي / محافظ إلكترونية'].map(m => (
                <div key={m} className="flex-1 flex flex-col gap-2">
                  <button onClick={() => setPaymentMethod(m)} className={`w-full p-4 text-[10px] font-black uppercase tracking-widest border transition-all duration-500 rounded-none ${paymentMethod === m ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-lg' : 'border-zinc-100 text-zinc-400 hover:border-zinc-300'}`}>
                    {m}
                  </button>
                  {m === 'الدفع عند الاستلام' && settings.cod_deposit_required && (
                    <p className="text-[10px] text-[var(--primary)] font-black text-center animate-pulse">
                      مقدم {settings.deposit_percentage}% ({Number((finalPrice * settings.deposit_percentage) / 100).toFixed(2)} ج.م)
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Coupon */}
          <div className="flex gap-4 p-1 bg-zinc-50 rounded-none mt-4">
            <input
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              className="flex-1 bg-transparent border-none p-3 text-xs focus:ring-0 uppercase tracking-widest"
              placeholder="كوبون خصم؟"
            />
            <button
              onClick={applyCoupon}
              disabled={loading || !couponCode}
              className="px-6 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
            >
              تطبيق
            </button>
          </div>
          {discount > 0 && <p className="text-[10px] font-black text-emerald-600 px-1">✓ تم تفعيل خصم {discount}%</p>}

          <div className="pt-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex items-center bg-zinc-50 px-2 gap-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-zinc-900 transition-colors"><Minus className="h-3 w-3" /></button>
                <span className="text-xs font-black w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-zinc-900 transition-colors"><Plus className="h-3 w-3" /></button>
              </div>
              <div className="flex-1 relative flex gap-4">
                <button onClick={handleAddToCart} className="flex-1 bg-white border border-[var(--primary)] text-[var(--primary)] h-14 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--primary)] hover:text-white transition-all duration-500">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">إضافة للسلة</span>
                </button>
                <WishlistButton product={{ ...product, store_id: storeId }} />
              </div>
            </div>
            
            <button onClick={handleOrder} disabled={loading || product.stock === 0} className={`w-full h-16 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl rounded-none ${product.stock === 0 ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-[var(--primary)] text-white hover:brightness-110'}`}>
              {loading ? 'جاري التنفيذ...' : product.stock === 0 ? 'غير متوفر حالياً' : 'تأكيد الطلب الآن'}
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
                    {Number(finalPrice / quantity).toFixed(2)}
                  </span>
                  {(product.price && ((product.original_price && product.original_price > basePrice) || discount > 0)) && (
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
      </div>

      <div className="h-px bg-primary-100" />

      {/* Variants Selection (Default) */}
      {hasVariants && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
          {/* Colors - Only show if not "مقاسات المنتج" */}
          {selectedVariant.color !== 'مقاسات المنتج' && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <div className="h-1 w-1 bg-primary-500 rounded-full" /> اختر اللون:
              </label>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v: any, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedVariantIdx(i)
                      setSelectedSizeIdx(0)
                    }}
                    className={`group relative flex flex-col items-center gap-2 transition-all ${selectedVariantIdx === i ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <div 
                      className={`h-10 w-10 rounded-full border-4 transition-all shadow-md ${selectedVariantIdx === i ? 'border-primary-500 ring-4 ring-primary-100' : 'border-white'}`}
                      style={{ backgroundColor: v.hex }}
                    />
                    <span className={`text-[10px] font-black tracking-tight ${selectedVariantIdx === i ? 'text-primary-600' : 'text-zinc-400'}`}>
                      {v.color}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <div className="h-1 w-1 bg-primary-500 rounded-full" /> المقاس المتاح:
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedVariant.sizes.map((s: any, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedSizeIdx(i)}
                  className={`px-5 py-2 rounded-xl text-xs font-black transition-all border-2 ${selectedSizeIdx === i ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-white border-zinc-100 text-zinc-500 hover:border-primary-200'}`}
                >
                  {s.size}
                  {s.price_override && Number(s.price_override) !== product.price && (
                    <span className="block text-[8px] opacity-70 mt-0.5">{s.price_override} ج.م</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="h-px bg-primary-100" />

      {/* Quantity Selector */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-black text-zinc-700">الكمية:</label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center bg-zinc-50 border border-zinc-100 rounded-2xl p-1 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={product.stock === 0}
              className="h-10 w-12 sm:w-10 flex items-center justify-center rounded-xl bg-white text-zinc-600 hover:text-primary-600 shadow-sm transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className={`w-16 text-center text-xl font-black ${product.stock === 0 ? 'text-zinc-400' : 'text-primary-600'}`}>{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              disabled={product.stock === 0}
              className="h-10 w-12 sm:w-10 flex items-center justify-center rounded-xl bg-white text-zinc-600 hover:text-primary-600 shadow-sm transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={product.stock === 0}
              placeholder="الاسم بالكامل"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all disabled:bg-zinc-900/10 disabled:text-zinc-400 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">رقم التليفون <span className="text-primary-500">*</span></label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              disabled={product.stock === 0}
              placeholder="رقم الموبايل للتواصل"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-right disabled:bg-zinc-900/10 disabled:text-zinc-400 disabled:cursor-not-allowed"
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
              disabled={product.stock === 0}
              placeholder="المدينة، المنطقة، الشارع، رقم العمارة"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all disabled:bg-zinc-900/10 disabled:text-zinc-400 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">طريقة الدفع <span className="text-primary-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`relative flex rounded-xl border p-4 transition-all ${product.stock === 0 || !settings.cod_enabled ? 'cursor-not-allowed opacity-60 bg-zinc-50 border-zinc-200' : paymentMethod === 'الدفع عند الاستلام' ? 'cursor-pointer border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm' : 'cursor-pointer border-zinc-200 hover:border-[var(--primary)]/20 bg-white'}`}>
                <input type="radio" name="paymentMethod" value="الدفع عند الاستلام" checked={paymentMethod === 'الدفع عند الاستلام'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={product.stock === 0 || !settings.cod_enabled} className="sr-only" />
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

              <label className={`relative flex rounded-xl border p-4 transition-all ${product.stock === 0 ? 'cursor-not-allowed opacity-60 bg-zinc-50 border-zinc-200' : paymentMethod === 'تحويل بنكي / محافظ إلكترونية' ? 'cursor-pointer border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm' : 'cursor-pointer border-zinc-200 hover:border-[var(--primary)]/20 bg-white'}`}>
                <input type="radio" name="paymentMethod" value="تحويل بنكي / محافظ إلكترونية" checked={paymentMethod === 'تحويل بنكي / محافظ إلكترونية'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={product.stock === 0} className="sr-only" />
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
              className="rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 transition-all active:scale-95 whitespace-nowrap"
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
            className="w-full sm:flex-[2] inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] h-14 text-lg font-bold text-white transition hover:brightness-110 shadow-lg shadow-[var(--primary)]/20 disabled:opacity-50 disabled:bg-zinc-400 disabled:shadow-none"
          >
            {loading ? 'جاري التحضير...' : product.stock === 0 ? 'نفذت الكمية' : 'تأكيد الطلب'}
          </button>

          <button
            onClick={handleAddToCart}
            className="w-full sm:flex-[1] flex items-center justify-center gap-2 h-14 bg-[var(--primary)]/10 border-2 border-[var(--primary)] text-[var(--primary)] rounded-2xl font-black text-sm hover:bg-[var(--primary)] transition-all hover:text-white shadow-sm active:scale-95 group"
            title="إضافة للسلة"
          >
            <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">إضافة للسلة</span>
          </button>
        </div>
        <p className="text-center text-xs text-zinc-400">
          سيتم إنشاء فاتورة إلكترونية لطلبك مع خيارات الدفع المتاحة
        </p>
      </div>
    </div>
  )
}
