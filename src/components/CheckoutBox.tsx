'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types/product'
import { createClient } from '@/lib/supabase/client'
import {
  Minus, Plus, Store, ChevronDown
} from 'lucide-react'
import WishlistButton from './WishlistButton'
import { createOrder } from '@/app/actions/order'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useCart } from '@/context/CartContext'

interface CheckoutBoxProps {
  product: Product
  storeId?: string
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
  const [settings, setSettings] = useState<any>({ cod_enabled: true, cod_deposit_required: false, deposit_percentage: 50 })
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => crypto.randomUUID())
  const [shippingConfig, setShippingConfig] = useState<any>(null)
  const [selectedGov, setSelectedGov] = useState('')
  const [deliveryType, setDeliveryType] = useState('delivery') // 'delivery' or 'pickup'

  const GOVERNORATES = [
    "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "السويس", "الشرقية", "دمياط", "بورسعيد", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر", "قنا", "شمال سيناء", "سوهاج", "بني سويف", "أسيوط", "أسوان"
  ]

  // Variants Support
  const hasVariants = product.variants && product.variants.length > 0
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0)
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0)

  const selectedVariant = (hasVariants && product.variants) ? product.variants[selectedVariantIdx] : null
  const selectedSize = (selectedVariant && selectedVariant.sizes && selectedVariant.sizes[selectedSizeIdx]) ? selectedVariant.sizes[selectedSizeIdx] : null

  const router = useRouter()
  const supabase = createClient()

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

      // Fetch Shipping Config from branding
      const { data: branding } = await supabase.from('store_branding').select('shipping_config').eq('store_id', storeId).single()
      if (branding) {
        setShippingConfig(branding.shipping_config)
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

  // Calculate Shipping Cost
  const shippingCost = (deliveryType === 'pickup' || !shippingConfig)
    ? 0
    : (shippingConfig.type === 'flat'
      ? Number(shippingConfig.flat_rate || 0)
      : Number(shippingConfig.governorates?.[selectedGov] || 0))

  const subtotal = (basePrice - (basePrice * discount / 100)) * quantity
  const finalPrice = subtotal + shippingCost

  const handleOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('برجاء إدخال الاسم ورقم الهاتف')
      return
    }

    if (deliveryType === 'delivery' && !selectedGov) {
      toast.error('برجاء اختيار المحافظة')
      return
    }

    if (deliveryType === 'delivery' && !customerAddress.trim()) {
      toast.error('برجاء إدخال العنوان بالتفصيل')
      return
    }

    setLoading(true)
    try {
      const variantInfo = hasVariants ? {
        color: selectedVariant.color,
        size: selectedSize?.size
      } : null

      const finalPaymentMethod = (paymentMethod === 'الدفع عند الاستلام' && settings.cod_deposit_required) ? 'الدفع عند الاستلام (عربون)' : paymentMethod
      const fullAddress = deliveryType === 'pickup'
        ? 'استلام شخصي من المتجر'
        : `${selectedGov}${selectedGov ? ' - ' : ''}${customerAddress.trim()}`

      const result = await createOrder(product, couponCode, customerName.trim(), fullAddress, customerPhone.trim(), finalPaymentMethod, storeId, idempotencyKey, quantity, variantInfo, basePrice, shippingCost)
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

  const { addItem } = useCart()
  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('هذا المنتج غير متوفر حالياً')
      return
    }

    const variantInfo = (hasVariants && selectedVariant) ? {
      color: selectedVariant.color as string | undefined,
      size: selectedSize?.size as string | undefined
    } : undefined

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

  // ───────────────────────────────────────────────────────────────────────────
  // UNIFIED BOUTIQUE CHECKOUT UI
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-1000 font-[family-name:var(--font-cairo)]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-6">
          <div className="text-4xl font-bold text-[var(--primary)] tracking-tighter">
            {finalPrice?.toLocaleString()} <span className="text-sm font-black opacity-60">ج.م</span>
          </div>
          {product.original_price && Number(product.original_price) > basePrice && (
            <div className="text-lg font-bold text-zinc-300 line-through">
              {Number(product.original_price).toLocaleString()} ج.م
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${product.stock === 0 ? 'bg-zinc-200' : 'bg-[var(--primary)] animate-pulse'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {product.stock === 0 ? 'غير متوفر حالياً' : 'متوفر في المخزون'}
          </span>
        </div>
      </div>

      {hasVariants && (
        <div className="space-y-8">
          {(selectedVariant && selectedVariant.color !== 'مقاسات المنتج') && (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">اللون</label>
              <div className="flex flex-wrap gap-4">
                {product.variants?.map((v: any, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setSelectedVariantIdx(i); setSelectedSizeIdx(0); }}
                    className={`h-9 w-9 rounded-full transition-all duration-500 ${selectedVariantIdx === i ? 'ring-1 ring-offset-4 ring-[var(--primary)] scale-110' : 'opacity-40 hover:opacity-100'}`}
                    style={{ backgroundColor: v.hex }}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">المقاس</label>
            <div className="flex flex-wrap gap-3">
              {selectedVariant?.sizes.map((s: any, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedSizeIdx(i)}
                  className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${selectedSizeIdx === i ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-zinc-100 text-zinc-400'}`}
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
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} disabled={product.stock === 0} className="w-full bg-zinc-50 border-none p-4 text-xs font-bold focus:ring-1 focus:ring-[var(--primary)] rounded-none" placeholder="الاسم بالكامل..." />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-300 px-1">رقم الهاتف</label>
            <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} disabled={product.stock === 0} className="w-full bg-zinc-50 border-none p-4 text-xs font-bold focus:ring-1 focus:ring-[var(--primary)] text-right rounded-none" dir="ltr" placeholder="01234567890" />
          </div>
        </div>

        {shippingConfig?.allow_pickup && (
          <div className="flex gap-4 p-1 bg-zinc-50 border border-zinc-100">
            <button
              type="button"
              onClick={() => setDeliveryType('delivery')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${deliveryType === 'delivery' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-900'}`}
            >
              شحن للمنزل
            </button>
            <button
              type="button"
              onClick={() => setDeliveryType('pickup')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${deliveryType === 'pickup' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-900'}`}
            >
              استلام شخصي
            </button>
          </div>
        )}

        {deliveryType === 'delivery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-700">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-300 px-1">المحافظة</label>
              <div className="relative">
                <select
                  value={selectedGov}
                  onChange={e => setSelectedGov(e.target.value)}
                  className="w-full bg-zinc-50 border-none p-4 text-xs font-bold focus:ring-1 focus:ring-[var(--primary)] appearance-none rounded-none"
                >
                  <option value="">اختر المحافظة...</option>
                  {GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-300 px-1">العنوان بالتفصيل</label>
              <input value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-zinc-50 border-none p-4 text-xs font-bold focus:ring-1 focus:ring-[var(--primary)] rounded-none" placeholder="المنطقة، الشارع، رقم المنزل" />
            </div>
          </div>
        )}

        {deliveryType === 'pickup' && (
          <div className="p-6 bg-zinc-50 border border-dashed border-zinc-200 text-center space-y-2 animate-in zoom-in-95 duration-700">
            <Store className="h-5 w-5 mx-auto text-zinc-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">سيتم التواصل معك لتحديد موعد ومكان الاستلام</p>
          </div>
        )}

        <div className="space-y-4">
          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-300 px-1">طريقة الدفع</label>
          <div className="flex flex-col sm:flex-row gap-4">
            {['الدفع عند الاستلام', 'تحويل بنكي / محافظ إلكترونية'].map(m => (
              <div key={m} className="flex-1 space-y-2">
                <button
                  onClick={() => setPaymentMethod(m)}
                  disabled={m === 'الدفع عند الاستلام' && !settings.cod_enabled}
                  className={`w-full p-4 text-[10px] font-black uppercase tracking-widest border transition-all duration-500 rounded-none ${paymentMethod === m ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-lg' : 'border-zinc-100 text-zinc-400 hover:border-zinc-300'} ${(m === 'الدفع عند الاستلام' && !settings.cod_enabled) ? 'opacity-20 cursor-not-allowed' : ''}`}
                >
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

        <div className="flex gap-4 p-1 bg-zinc-50 border border-zinc-100 mt-4">
          <input
            value={couponCode}
            onChange={e => setCouponCode(e.target.value)}
            className="flex-1 bg-transparent border-none p-3 text-xs font-bold focus:ring-0 uppercase tracking-widest"
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
        {discount > 0 && <p className="text-[10px] font-black text-emerald-600 px-1 mt-2">✓ تم تفعيل خصم {discount}%</p>}

        <div className="pt-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex items-center bg-zinc-50 px-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-zinc-900"><Minus className="h-3 w-3" /></button>
              <span className="text-xs font-black w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-zinc-900"><Plus className="h-3 w-3" /></button>
            </div>
            <div className="flex-1 flex gap-4">
              <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 border border-zinc-100 text-zinc-900 h-14 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all">إضافة للسلة</button>
              <WishlistButton product={{ ...product, store_id: storeId }} />
            </div>
          </div>
          <button onClick={handleOrder} disabled={loading || product.stock === 0} className={`w-full h-16 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:brightness-110 rounded-none disabled:bg-zinc-200 disabled:text-zinc-400`}>
            {loading ? 'جاري التأكيد...' : product.stock === 0 ? 'غير متوفر حالياً' : 'تأكيد الطلب الآن'}
          </button>
        </div>
      </div>
    </div>
  )
}
