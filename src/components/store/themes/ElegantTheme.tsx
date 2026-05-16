'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  Share2, 
  ArrowUpRight,
  Truck,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Landmark
} from 'lucide-react'
import { KayaBadge } from '@/components/store/KayaBadge'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { trackAddToCart } from '@/components/store/PixelManager'
import toast from 'react-hot-toast'

// ─── ELEGANT PRODUCT CARD ───────────────────────────────────────────────────
export const ElegantProductCard = ({ product, slug }: any) => {
  const router = useRouter()
  const { toggleItem, isInWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)
  const productImage = product.image_url || (product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop')

  const { addItem } = useCart()

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(product)

    // Direct sync fallback
    try {
      const wishlistKey = slug ? `wishlist_${slug}` : 'wishlist'
      const saved = localStorage.getItem(wishlistKey)
      let items = saved ? JSON.parse(saved) : []
      if (isWishlisted) {
        items = items.filter((i: any) => i.id !== product.id)
      } else {
        items.push(product)
      }
      localStorage.setItem(wishlistKey, JSON.stringify(items))
    } catch (e) { }

    if (!isWishlisted) {
      toast.success('تم الإضافة للمفضلة')
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock === 0) {
      toast.error('هذا المنتج غير متوفر حالياً')
      return
    }

    // If product has variants, redirect to product page instead of adding directly
    const hasVariants = product.variants && product.variants.length > 0

    if (hasVariants) {
      toast('يرجى اختيار المقاس واللون أولاً ثم الضغط على زر "أضف للسلة"', { icon: '📝' })
      router.push(`/store/${slug}/products/${product.slug || product.id}`)
      return
    }

    // Generate cartItemId for simple products
    const cartItemId = `${product.id}-none-none`

    const newItem = {
      id: product.id,
      cartItemId: cartItemId,
      name: product.name,
      slug: product.slug,
      price: product.price || 0,
      original_price: product.original_price,
      image_url: productImage,
      quantity: 1,
      variant_info: {
        color: undefined,
        size: undefined
      }
    }
    addItem(newItem)
    trackAddToCart(product)
    toast.success('تمت الإضافة للسلة')
  }

  return (
    <Link href={`/store/${slug}/products/${product.slug || product.id}`} className="group space-y-6">
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50 border border-zinc-100/50 transition-all duration-700 group-hover:border-[var(--primary)]/30 group-hover:shadow-2xl group-hover:shadow-[var(--primary)]/5">
        <Image
          src={productImage}
          alt={product.name}
          fill
          className="object-cover transition-all duration-700 scale-110 group-hover:scale-100"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <button
            onClick={handleWishlist}
            className={`h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-none backdrop-blur-md border transition-all hover:scale-110 active:scale-95 ${isWishlisted ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/90 text-zinc-400 border-zinc-100 hover:text-rose-500'}`}
          >
            <Heart className={`h-4 w-4 md:h-5 md:w-5 ${isWishlisted ? 'fill-current' : ''}`} strokeWidth={1.5} />
          </button>

          <div className="relative flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-none backdrop-blur-md border border-[var(--primary)]/20 transition-all shadow-lg ${product.stock === 0 ? 'bg-zinc-100 text-zinc-400 opacity-50 cursor-not-allowed border-zinc-200' : 'bg-[var(--primary)] text-white hover:brightness-110 active:scale-95'}`}
            >
              <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-2 text-center">
        <h3 className="text-sm font-bold text-zinc-900 group-hover:text-[var(--primary)] transition-colors uppercase tracking-wider">{product.name}</h3>
        <div className="flex flex-col items-center gap-0.5">
          <div className="text-lg font-bold text-[var(--primary)] tracking-tighter">
            {Number(product.price).toLocaleString()} ج.م
          </div>
          {product.original_price && Number(product.original_price) > Number(product.price) && (
            <div className="text-[10px] font-bold text-zinc-300 line-through decoration-zinc-200">
              {Number(product.original_price).toLocaleString()} ج.م
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── ELEGANT HERO ───────────────────────────────────────────────────────────
export const ElegantHero = ({ branding, store, slug, showWatermark }: any) => {
  const hasImage = !!branding?.hero_image_url
  const sideImage = branding?.hero_image_url
  const heroTitle = branding?.hero_title || `مرحباً بك في ${store.name}`
  const heroDescription = branding?.hero_description || 'تصفح أحدث منتجاتنا وعروضنا الحصرية.'
  const ctaText = branding?.hero_cta_text || 'تصفح المنتجات'

  const words = heroTitle.split(' ')
  let renderedTitle;

  if (words.length === 1) {
    renderedTitle = (
      <span className="text-7xl md:text-9xl font-black tracking-tighter leading-none" style={{ color: 'var(--primary)', filter: 'brightness(0.15) contrast(1.2)' }}>
        {words[0]}
      </span>
    )
  } else if (words.length === 2) {
    renderedTitle = (
      <div className="flex flex-col -space-y-4">
        <span className="text-4xl md:text-6xl font-light text-[var(--primary)]/20 tracking-wide uppercase leading-tight">{words[0]}</span>
        <span className="text-7xl md:text-9xl font-black text-[var(--primary)] leading-[0.85]">{words[1]}</span>
      </div>
    )
  } else if (words.length === 3) {
    renderedTitle = (
      <div className="flex flex-col -space-y-4">
        <span className="text-4xl md:text-6xl font-light text-[var(--primary)]/20 tracking-wide uppercase leading-tight">{words[0]}</span>
        <span className="text-7xl md:text-9xl font-black leading-[0.85]">
          <span style={{ color: 'var(--primary)', filter: 'brightness(0.15) contrast(1.2)' }}>{words[1]}</span> <span className="text-[var(--primary)]">{words[2]}</span>
        </span>
      </div>
    )
  } else {
    // 4 words or more
    const firstTwo = words.slice(0, 2).join(' ')
    const rest = words.slice(2).join(' ')
    renderedTitle = (
      <div className="flex flex-col -space-y-4">
        <span className="text-4xl md:text-6xl font-light text-[var(--primary)]/20 tracking-wide uppercase leading-tight">{firstTwo}</span>
        <span className="text-7xl md:text-9xl font-black text-[var(--primary)] leading-[0.85]">{rest}</span>
      </div>
    )
  }

  return (
    <section className="relative bg-white border-b border-zinc-100 overflow-hidden flex flex-col justify-center min-h-[calc(100vh-120px)]" dir="rtl">
      {hasImage && <div className="absolute top-0 right-0 w-px h-full bg-zinc-50 hidden lg:block" style={{ right: '50%' }} />}

      <div className="mx-auto max-w-7xl px-6 relative w-full">
        <div className={`flex flex-col lg:flex-row items-center gap-16 ${!hasImage ? 'text-center justify-center' : 'justify-center lg:justify-between'}`}>
          {/* Content */}
          <div className={`flex-1 space-y-12 flex flex-col items-center text-center ${hasImage ? 'lg:items-start lg:text-right' : ''} max-w-4xl`}>
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-black text-zinc-900 leading-[1.1] tracking-tighter">
                {renderedTitle}
              </h1>
              <p className={`text-lg text-zinc-400 font-light leading-relaxed ${hasImage ? 'max-w-md' : 'max-w-xl mx-auto'}`}>
                {heroDescription}
              </p>
            </div>

            <div className={`flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto justify-center ${hasImage ? 'lg:justify-start' : ''}`}>
              <Link
                href={`/store/${slug}/products`}
                className="w-full sm:w-auto bg-[var(--primary)] text-white px-10 py-5 text-sm font-black uppercase tracking-widest hover:brightness-125 transition-all duration-500 shadow-2xl flex items-center justify-center gap-3 rounded-none disabled:brightness-75"
              >
                {ctaText}
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link
                href={`https://wa.me/${store.whatsapp_phone?.replace(/\D/g, '')}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن بعض المنتجات.')}`}
                className="w-full sm:w-auto border border-zinc-200 text-zinc-900 px-10 py-5 text-sm font-black uppercase tracking-widest hover:bg-zinc-50 transition-all duration-500 flex items-center justify-center gap-3 rounded-none"
              >
                <MessageSquare className="h-4 w-4" />
                تواصل معنا
              </Link>
            </div>
          </div>

          {/* Side Image - ONLY ON LG+ */}
          {hasImage && (
            <div className="flex-1 w-full hidden lg:block">
              <div className="relative aspect-[4/5] w-full max-w-[450px] mx-auto lg:mr-auto lg:ml-0 group">
                <div className="absolute inset-0 border border-zinc-900 translate-x-6 translate-y-6 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700" />
                <div className="relative h-full w-full overflow-hidden bg-zinc-50">
                  <Image
                    src={sideImage}
                    alt={store.name}
                    fill
                    className="object-cover transition-all duration-1000 scale-105 group-hover:scale-100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── ELEGANT CATEGORIES ─────────────────────────────────────────────────────
export const ElegantCategories = ({ categories, slug }: any) => {
  return (
    <section className="py-24 bg-white border-b border-zinc-100" dir="rtl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="h-px w-12 bg-[var(--primary)]/30 mb-2" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">التصنيفات</span>
          <h2 className="text-4xl md:text-5xl font-light text-zinc-900 tracking-tighter uppercase">اختر <span className="font-bold italic text-[var(--primary)]">أسلوبك</span></h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {categories.map((cat: any, i: number) => (
            <Link key={cat.id || i} href={`/store/${slug}/products?category=${encodeURIComponent(cat.name)}`} className="group relative aspect-square overflow-hidden bg-zinc-50">
              <Image
                src={cat.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop'}
                alt={cat.name}
                fill
                className="object-cover transition-all duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/40 transition-colors duration-500 flex items-center justify-center p-4">
                <h3 className="text-white text-sm md:text-base font-black uppercase tracking-[0.2em] text-center leading-relaxed">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── ELEGANT BESTSELLERS ────────────────────────────────────────────────────
export const ElegantBestsellers = ({ products, slug }: any) => {
  return (
    <section className="py-24 bg-white" dir="rtl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center gap-8 mb-20 border-b border-zinc-100 pb-12">
          <div className="space-y-4">
            <div className="h-px w-12 bg-[var(--primary)]/30 mx-auto mb-2" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">الأكثر طلباً</span>
            <h2 className="text-4xl md:text-5xl font-light text-zinc-900 tracking-tighter uppercase">القطع <span className="font-bold italic text-[var(--primary)]">المميزة</span></h2>
          </div>
          <Link href={`/store/${slug}/products`} className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-[var(--primary)] transition-all flex items-center gap-2 group">
            عرض كل المنتجات
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
          {products.slice(0, 8).map((product: any) => (
            <ElegantProductCard key={product.id} product={product} slug={slug} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── ELEGANT FEATURES ───────────────────────────────────────────────────────
export const ElegantFeatures = ({ branding }: { branding?: any }) => {
  const defaultFeatures = [
    { title: 'جودة استثنائية', desc: 'نختار أجود الخامات لضمان رضاكم' },
    { title: 'شحن فاخر', desc: 'تغليف آمن وتوصيل سريع لباب المنزل' },
    { title: 'دعم متواصل', desc: 'فريقنا متاح دائماً للإجابة على استفساراتكم' },
    { title: 'دفع آمن', desc: 'طرق دفع متنوعة ومشفرة تماماً' }
  ]
  const features = branding?.features_data?.length > 0 ? branding.features_data : defaultFeatures

  return (
    <section className="py-24 bg-zinc-50 border-y border-zinc-100" dir="rtl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16">
          {features.map((f: { title: string, desc: string }, i: number) => (
            <div key={i} className="text-center space-y-4">
              <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.4em]">0{i + 1}</span>
              <h3 className="text-xl font-bold text-zinc-900">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xs mx-auto">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── ELEGANT HEADER ────────────────────────────────────────────────────────
export const ElegantHeader = ({ store, branding, slug }: any) => {
  const { totalItems } = useCart()
  const { items: wishlistItems } = useWishlist()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-100" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-20 flex items-center justify-between relative">

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href={`/store/${slug}`} className={`text-xs font-black uppercase tracking-widest transition-colors ${isActive(`/store/${slug}`) ? 'text-[var(--primary)]' : 'text-zinc-400 hover:text-[var(--primary)]'}`}>الرئيسية</Link>
          <Link href={`/store/${slug}/products`} className={`text-xs font-black uppercase tracking-widest transition-colors ${isActive(`/store/${slug}/products`) ? 'text-[var(--primary)]' : 'text-zinc-400 hover:text-[var(--primary)]'}`}>المنتجات</Link>
          <Link href={`/store/${slug}/track`} className={`text-xs font-black uppercase tracking-widest transition-colors ${isActive(`/store/${slug}/track`) ? 'text-[var(--primary)]' : 'text-zinc-400 hover:text-[var(--primary)]'}`}>تتبع الطلب</Link>
        </nav>

        {/* Mobile Left Actions (Cart/Wishlist) */}
        <div className="flex md:hidden items-center gap-4">
          <Link href={`/store/${slug}/cart`} className="relative text-zinc-400 hover:text-[var(--primary)] transition-colors">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-[var(--primary)] text-white text-[7px] h-3.5 w-3.5 rounded-none flex items-center justify-center font-black shadow-lg">{totalItems}</span>}
          </Link>
          <Link href={`/store/${slug}/wishlist`} className="relative text-zinc-400 hover:text-rose-500 transition-colors">
            <Heart className="h-5 w-5" strokeWidth={1.5} />
            {wishlistItems.length > 0 && <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[7px] h-3.5 w-3.5 rounded-none flex items-center justify-center font-black shadow-lg shadow-rose-500/20">{wishlistItems.length}</span>}
          </Link>
          <Link href={`/store/${slug}/track`} className={`relative transition-colors ${isActive(`/store/${slug}/track`) ? 'text-[var(--primary)]' : 'text-zinc-400 hover:text-[var(--primary)]'}`}>
            <Truck className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        </div>

        {/* Logo (Centered Always) */}
        <Link href={`/store/${slug}`} className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          {branding?.logo_url ? (
            <div className="relative h-8 w-24 md:h-10 md:w-32">
              <Image src={branding.logo_url} alt={store.name} fill className="object-contain" />
            </div>
          ) : (
            <span className="text-xl md:text-2xl font-light tracking-tighter text-zinc-900 italic uppercase">
              {store.name}
            </span>
          )}
        </Link>

        {/* Mobile Right Actions (Home/Products) */}
        <div className="flex md:hidden items-center gap-4">
          <Link href={`/store/${slug}`} className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive(`/store/${slug}`) ? 'text-[var(--primary)]' : 'text-zinc-400'}`}>الرئيسية</Link>
          <Link href={`/store/${slug}/products`} className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive(`/store/${slug}/products`) ? 'text-[var(--primary)]' : 'text-zinc-400'}`}>المنتجات</Link>
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-6">
          <Link href={`/store/${slug}/wishlist`} className="group relative text-zinc-400 hover:text-rose-500 transition-colors">
            <Heart className="h-5 w-5" strokeWidth={1.5} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-2 -left-2 bg-rose-500 text-white text-[8px] font-black h-4 w-4 rounded-none flex items-center justify-center shadow-lg shadow-rose-500/20">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <Link href={`/store/${slug}/cart`} className="group relative text-zinc-400 hover:text-[var(--primary)] transition-colors">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -left-2 bg-[var(--primary)] text-white text-[8px] font-black h-4 w-4 rounded-none flex items-center justify-center shadow-lg">
                {totalItems}
              </span>
            )}
          </Link>
          <Link href={`https://wa.me/${store.whatsapp_phone?.replace(/\D/g, '')}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن بعض المنتجات.')}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-[var(--primary)] px-5 py-2 hover:brightness-125 transition-all duration-500 rounded-none disabled:brightness-75">
            <MessageSquare className="h-3 w-3" />
            مساعدة
          </Link>
        </div>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--primary)]/20 to-transparent" />
    </header>
  )
}

// ─── ELEGANT TESTIMONIALS ───────────────────────────────────────────────────
export const ElegantTestimonials = ({ reviews }: { reviews: any[] }) => {
  const [isPaused, setIsPaused] = React.useState(false)

  const displayReviews = React.useMemo(() => {
    const base = reviews && reviews.length > 0 ? reviews : [
      { id: 'f1', reviewer_name: 'أحمد محمود', rating: 5, comment: 'تجربة ممتازة ومنتجات بجودة عالية جداً، سأكرر التجربة بالتأكيد.' },
      { id: 'f2', reviewer_name: 'سارة خالد', rating: 5, comment: 'توصيل سريع وتغليف رائع، شكراً لكم على هذا الرقي.' },
      { id: 'f3', reviewer_name: 'محمد علي', rating: 5, comment: 'خدمة عملاء راقية وسرعة في الرد والاستجابة.' },
      { id: 'f4', reviewer_name: 'نورة عبدالله', rating: 5, comment: 'أفضل متجر تعاملت معه، أنصح الجميع بالتجربة!' },
    ]
    return base.slice(0, 8)
  }, [reviews])

  const repeatedSet = React.useMemo(() => {
    const minItems = 12
    const repeatCount = Math.ceil(minItems / displayReviews.length)
    return Array.from({ length: repeatCount }).flatMap(() => displayReviews)
  }, [displayReviews])

  const duration = repeatedSet.length * 8

  return (
    <section className="bg-white py-24 border-y border-zinc-100 overflow-hidden select-none" dir="rtl">
      <div className="mx-auto max-w-7xl px-6 flex flex-col items-center text-center mb-16 space-y-4">
        <div className="h-px w-12 bg-[var(--primary)]/30 mb-2" />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">قالوا عنا</span>
        <h2 className="text-4xl md:text-5xl font-light text-zinc-900 tracking-tighter uppercase">ثقة <span className="font-bold italic text-[var(--primary)]">نعتز بها</span></h2>
      </div>

      <div className="relative w-full" dir="ltr">
        {/* Fades */}
        <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />

        <div
          className="flex w-max animate-elegant-marquee"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            animationDuration: `${duration}s`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          <div className="flex gap-12 px-6">
            {repeatedSet.map((review: any, idx: number) => (
              <div key={idx} className="w-[350px] shrink-0 border border-zinc-100 p-10 bg-zinc-50/30 hover:bg-white hover:border-zinc-900 transition-all duration-700 group">
                <div className="space-y-6">
                  {/* Elegant Stars */}
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${star <= Math.round(review.rating) ? 'text-[var(--primary)] fill-[var(--primary)]' : 'text-zinc-100'}`}
                        strokeWidth={1}
                      />
                    ))}
                  </div>
                  <p className="text-lg font-light text-zinc-600 leading-relaxed line-clamp-3 text-right" dir="rtl">
                    <span className="font-sans font-bold text-xl text-zinc-400">"</span>
                    <span className="italic mx-1">{review.comment}</span>
                    <span className="font-sans font-bold text-xl text-zinc-400">"</span>
                  </p>
                  <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">
                      {review.reviewer_name || review.customer_name || 'عميل مجهول'}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                      عميل موثق
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes elegant-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-elegant-marquee {
          animation: elegant-marquee linear infinite;
        }
      `}</style>
    </section>
  )
}

// ─── ELEGANT FOOTER ─────────────────────────────────────────────────────────
export const ElegantFooter = ({ store, branding, slug, showWatermark = true, categories = [] }: any) => {
  return (
    <footer className="bg-[#0a0a0a] text-zinc-400 pt-16 pb-8" dir="rtl">
      <div className="mx-auto max-w-7xl px-6">

        {/* Facebook CTA Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-12 border-b border-white/5">
          <div className="text-center md:text-right space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
              انضم لعائلة <span className="italic" style={{ color: 'var(--primary)' }}>{store.name}</span>
            </h2>
            <p className="text-[11px] md:text-xs font-bold text-zinc-500 tracking-wide">
              تابع صفحتنا على فيسبوك عشان توصلك كل المنتجات والعروض الجديدة أول بأول.
            </p>
          </div>
          <Link
            href={branding.facebook_url || '#'}
            target="_blank"
            className="flex items-center gap-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white px-8 py-3.5 rounded-xl font-black text-[13px] transition-all shadow-xl shadow-blue-500/10 active:scale-95 shrink-0"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
            تابعنا الآن
          </Link>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-12 text-center md:text-right items-center md:items-start">
          
          {/* Brand Info */}
          <div className="space-y-4 flex flex-col items-center md:items-start w-full">
            {branding?.logo_url ? (
              <div className="relative h-8 w-28">
                <Image src={branding.logo_url} alt={store.name} fill className="object-contain md:object-right brightness-0 invert" />
              </div>
            ) : (
              <h3 className="text-xl font-light italic tracking-tighter text-white uppercase" style={{ color: 'var(--primary)' }}>
                {store.name}
              </h3>
            )}
            <p className="text-[10px] font-bold leading-relaxed max-w-xs text-zinc-600">
              {branding?.footer_description || store.description || 'نسوق أفضل المنتجات العالمية المختارة بعناية لتليق بجمالك ورقتك.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {branding.facebook_url && (
                <Link href={branding.facebook_url} target="_blank" className="h-9 w-9 bg-zinc-900/50 rounded-xl flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all duration-500 border border-white/5 group">
                   <svg className="h-3.5 w-3.5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                </Link>
              )}
              {branding.instagram_url && (
                <Link href={branding.instagram_url} target="_blank" className="h-9 w-9 bg-zinc-900/50 rounded-xl flex items-center justify-center hover:bg-[var(--primary)] hover:text-white transition-all duration-500 border border-white/5 group">
                  <svg className="h-3.5 w-3.5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path></svg>
                </Link>
              )}
              {store.whatsapp_phone && (
                <Link href={`https://wa.me/${store.whatsapp_phone?.replace(/\D/g, '')}`} target="_blank" className="h-9 w-9 bg-zinc-900/50 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all duration-500 border border-white/5 group">
                  <svg className="h-3.5 w-3.5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.63 1.433h.005c6.554 0 11.89-5.335 11.893-11.892a11.826 11.826 0 00-3.475-8.412"></path></svg>
                </Link>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6 flex flex-col items-center md:items-start w-full">
            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white" style={{ color: 'var(--primary)' }}>روابط سريعة</h4>
            <ul className="space-y-3">
              <li><Link href={`/store/${slug}`} className="text-[10px] font-bold text-zinc-600 hover:text-white transition-all uppercase tracking-widest">الرئيسية</Link></li>
              <li><Link href={`/store/${slug}/products`} className="text-[10px] font-bold text-zinc-600 hover:text-white transition-all uppercase tracking-widest">المتجر</Link></li>
              <li><Link href={`/store/${slug}/track`} className="text-[10px] font-bold text-zinc-600 hover:text-white transition-all uppercase tracking-widest">تتبع الطلب</Link></li>
              <li><Link href={`/store/${slug}/wishlist`} className="text-[10px] font-bold text-zinc-600 hover:text-white transition-all uppercase tracking-widest">المفضلة</Link></li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="space-y-6 flex flex-col items-center md:items-start w-full">
            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white" style={{ color: 'var(--primary)' }}>الأقسام</h4>
            <ul className="space-y-3">
              {categories.length > 0 ? categories.slice(0, 5).map((cat: any) => (
                <li key={cat.id}>
                  <Link href={`/store/${slug}/products?category=${cat.id}`} className="text-[10px] font-bold text-zinc-600 hover:text-white transition-all uppercase tracking-widest">
                    {cat.name}
                  </Link>
                </li>
              )) : (
                <li className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest italic">لا توجد أقسام</li>
              )}
            </ul>
          </div>

          {/* Column 4: WhatsApp Contact */}
          <div className="space-y-6 flex flex-col items-center md:items-start w-full">
            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white" style={{ color: 'var(--primary)' }}>تواصل معنا</h4>
            <div className="space-y-4 flex flex-col items-center md:items-start">
              <p className="text-[10px] font-bold text-zinc-600 leading-relaxed uppercase tracking-widest">عندك أي استفسار؟ تواصل معنا مباشرة عبر الواتساب.</p>
              <Link 
                href={`https://wa.me/${store.whatsapp_phone?.replace(/\D/g, '')}`}
                target="_blank"
                className="flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all group w-fit"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.63 1.433h.005c6.554 0 11.89-5.335 11.893-11.892a11.826 11.826 0 00-3.475-8.412"></path></svg>
                تواصل عبر الواتس
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-6 text-center">
          <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] w-full lg:w-auto">
            © {new Date().getFullYear()} {store.name}. ALL RIGHTS RESERVED.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 opacity-60 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-emerald-500" />
              <span className="text-[9px] font-bold">محافظ إلكترونية</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <span className="text-[9px] font-bold">InstaPay</span>
            </div>
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-amber-500" />
              <span className="text-[9px] font-bold">حساب بنكي</span>
            </div>
          </div>

          <div className="opacity-50 hover:opacity-100 transition-opacity w-full lg:w-auto flex justify-center">
            {showWatermark ? <KayaBadge /> : <span className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.3em]">Elegant Edition</span>}
          </div>
        </div>
      </div>
    </footer>
  )
}



// ─── ELEGANT FAQ ────────────────────────────────────────────────────────────
export const ElegantFAQ = ({ branding }: any) => {
  const faqs = branding?.faq_data || []
  if (faqs.length === 0) return null

  return (
    <section id="faq-section" className="py-24 bg-white" dir="rtl">
      <div className="mx-auto max-w-3xl px-6">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="h-px w-12 bg-[var(--primary)]/30 mb-2" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">الأسئلة الشائعة</span>
          <h2 className="text-4xl md:text-5xl font-light text-zinc-900 tracking-tighter uppercase">كل ما <span className="font-bold italic text-[var(--primary)]">تود معرفته</span></h2>
        </div>

        <div className="space-y-8">
          {faqs.map((faq: any, i: number) => (
            <div key={i} className="border-b border-zinc-100 pb-8 group">
              <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-4">
                <span className="text-[10px] font-black text-[var(--primary)]">0{i + 1}</span>
                {faq.q || faq.question}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed pr-10">{faq.a || faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
