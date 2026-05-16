'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types/product'
import { createClient } from '@/lib/supabase/client'
import {
  Minus, Plus, Store, ChevronDown
} from 'lucide-react'
import WishlistButton from './WishlistButton'
import { createOrder, saveDraftOrder } from '@/app/actions/order'
import { validateCoupon } from '@/app/actions/coupons'
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
  const [isGovOpen, setIsGovOpen] = useState(false)
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
        const res = await validateCoupon(couponCode, storeId)
        if (res.success) {
          setDiscount(res.discount || 0)
          toast.success(`تم تفعيل خصم ${res.discount}%`)
        } else {
          setDiscount(0)
          toast.error(res.error || 'كود غير صحيح')
        }
      }
    } catch {
      toast.error('حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const basePrice = Number((selectedSize && selectedSize.price_override) ? selectedSize.price_override : (product.price || 0)) || 0
  const qty = Number(quantity) || 1

  // Calculate Shipping Cost
  const shippingCost = Number((deliveryType === 'pickup' || !shippingConfig)
    ? 0
    : (shippingConfig.type === 'flat'
      ? Number(shippingConfig.flat_rate || 0)
      : Number(shippingConfig.governorates?.[selectedGov] || 0))) || 0

  const subtotal = (basePrice - (basePrice * (Number(discount) || 0) / 100)) * qty
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
    } finally {
      setLoading(false)
    }
  }

  // 🛒 Abandoned Cart Tracking Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerName.length > 2 && customerPhone.length >= 10 && storeId) {
        const item = [{
          id: product.id,
          quantity,
          name: product.name,
          price: basePrice,
          variant_info: hasVariants ? { color: selectedVariant.color, size: selectedSize?.size } : {}
        }]
        saveDraftOrder(storeId, customerName, customerPhone, item, idempotencyKey)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [customerName, customerPhone, quantity, storeId, idempotencyKey, product, basePrice, hasVariants, selectedVariant, selectedSize])

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
            {basePrice?.toLocaleString()} <span className="text-sm font-black opacity-60">ج.م</span>
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
                <button 
                  type="button"
                  onClick={() => setIsGovOpen(!isGovOpen)}
                  className={`w-full bg-zinc-50 border p-4 text-xs font-bold transition-all flex justify-between items-center ${isGovOpen ? 'border-[var(--primary)] bg-white ring-1 ring-[var(--primary)]' : 'border-transparent'}`}
                >
                  <span className={`${selectedGov ? 'text-zinc-900' : 'text-zinc-400'}`}>
                    {selectedGov || 'اختر المحافظة...'}
                  </span>
                  <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform duration-300 ${isGovOpen ? 'rotate-180 text-[var(--primary)]' : ''}`} />
                </button>
                {selectedGov && shippingCost > 0 && (
                  <p className="text-[10px] font-black text-emerald-600 mt-1.5 px-1 animate-in fade-in slide-in-from-top-1">
                    + {shippingCost} ج.م مصاريف شحن
                  </p>
                )}
                {selectedGov && shippingCost === 0 && (
                  <p className="text-[10px] font-black text-sky-600 mt-1.5 px-1 animate-in fade-in slide-in-from-top-1">
                    شحن مجاني لهذه المحافظة
                  </p>
                )}

                {isGovOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsGovOpen(false)} />
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-zinc-100 shadow-2xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300 custom-scrollbar">
                      {GOVERNORATES.map(gov => (
                        <button
                          key={gov}
                          type="button"
                          onClick={() => {
                            setSelectedGov(gov)
                            setIsGovOpen(false)
                          }}
                          className={`w-full text-right p-4 text-xs font-bold transition-colors hover:bg-[var(--primary)] hover:text-white ${selectedGov === gov ? 'bg-zinc-50 text-[var(--primary)]' : 'text-zinc-600'}`}
                        >
                          {gov}
                        </button>
                      ))}
                    </div>
                  </>
                )}
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

        {/* 📋 ORDER SUMMARY BOX */}
        <div className="mt-8 p-6 bg-zinc-50 border border-zinc-100 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-200 pb-3 mb-4">تفاصيل الحساب</h4>
          
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-zinc-500">سعر المنتج ({quantity} قطعة)</span>
            <span className="text-zinc-900">{(basePrice * quantity).toLocaleString()} ج.م</span>
          </div>

          {shippingCost > 0 && (
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-zinc-500">مصاريف الشحن</span>
              <span className="text-zinc-900">{shippingCost} ج.م</span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between items-center text-xs font-bold text-emerald-600">
              <span>الخصم ({discount}%)</span>
              <span>- {( (basePrice * quantity) * discount / 100 ).toLocaleString()} ج.م</span>
            </div>
          )}

          <div className="pt-3 border-t border-zinc-200 flex justify-between items-center">
            <span className="text-sm font-black text-zinc-900">الإجمالي النهائي</span>
            <span className="text-xl font-black text-[var(--primary)]">{finalPrice.toLocaleString()} ج.م</span>
          </div>

          {paymentMethod === 'الدفع عند الاستلام' && settings.cod_deposit_required && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-none space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black text-amber-700">
                <span>المقدم المطلوب ({settings.deposit_percentage}%)</span>
                <span>{((finalPrice * settings.deposit_percentage) / 100).toLocaleString()} ج.م</span>
              </div>
              <p className="text-[9px] text-amber-600 font-bold leading-relaxed">
                * سيتم دفع هذا المبلغ كعربون لتأكيد الجدية، والباقي عند الاستلام.
              </p>
            </div>
          )}
        </div>

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
