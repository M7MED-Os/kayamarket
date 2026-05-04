'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, MessageSquare, ShoppingBag, Heart, Star, Share2, MapPin } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import toast from 'react-hot-toast'

// ─── ELEGANT PRODUCT CARD ───────────────────────────────────────────────────
export const ElegantProductCard = ({ product, slug }: any) => {
  const { toggleItem, isInWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)
  const productImage = product.image_url || (product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop')

  const { addItem } = useCart()

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(product)
    if (!isWishlisted) {
      toast.success('تم الإضافة للمفضلة')
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({ 
      id: product.id, 
      name: product.name, 
      price: product.price || 0, 
      original_price: product.original_price, 
      image_url: productImage,
      quantity: 1 
    })
    toast.success('تمت الإضافة للسلة')
  }

  return (
    <Link href={`/store/${slug}/products/${product.id}`} className="group space-y-6">
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50 border border-zinc-100 transition-all duration-700 group-hover:border-zinc-900">
        <Image
          src={productImage}
          alt={product.name}
          fill
          className="object-cover lg:grayscale lg:group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <button
            onClick={handleWishlist}
            className={`h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full backdrop-blur-md border transition-all hover:scale-110 active:scale-95 ${isWishlisted ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/90 text-zinc-400 border-zinc-100 hover:text-rose-500'}`}
          >
            <Heart className={`h-4 w-4 md:h-5 md:w-5 ${isWishlisted ? 'fill-current' : ''}`} strokeWidth={1.5} />
          </button>
          
          <button
            onClick={handleAddToCart}
            className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full bg-zinc-900/90 text-white backdrop-blur-md border border-zinc-900 transition-all hover:scale-110 active:scale-95 shadow-lg"
          >
            <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <div className="space-y-2 text-center">
        <h3 className="text-sm font-bold text-zinc-900 group-hover:text-[var(--primary)] transition-colors uppercase tracking-wider">{product.name}</h3>
        <div className="flex flex-col items-center gap-0.5">
          <div className="text-lg font-light text-zinc-900 tracking-tighter">
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
export const ElegantHero = ({ branding, store, slug }: any) => {
  const hasImage = !!branding?.hero_image_url
  const sideImage = branding?.hero_image_url
  const heroTitle = branding?.hero_title || `مرحباً بك في ${store.name}`
  const heroDescription = branding?.hero_description || 'تصفح أحدث منتجاتنا وعروضنا الحصرية.'
  const ctaText = branding?.hero_cta_text || 'تصفح المنتجات'

  const words = heroTitle.split(' ')
  let renderedTitle;

  if (words.length === 1) {
    renderedTitle = (
      <span className="text-7xl md:text-9xl font-black text-zinc-900 tracking-tighter leading-none">
        {words[0]}
      </span>
    )
  } else if (words.length === 2) {
    renderedTitle = (
      <div className="flex flex-col -space-y-4">
        <span className="text-4xl md:text-6xl font-light text-zinc-300 tracking-wide uppercase leading-tight">{words[0]}</span>
        <span className="text-7xl md:text-9xl font-black text-[var(--primary)] leading-[0.85]">{words[1]}</span>
      </div>
    )
  } else if (words.length === 3) {
    renderedTitle = (
      <div className="flex flex-col -space-y-4">
        <span className="text-4xl md:text-6xl font-light text-zinc-300 tracking-wide uppercase leading-tight">{words[0]}</span>
        <span className="text-7xl md:text-9xl font-black text-zinc-900 leading-[0.85]">
          {words[1]} <span className="text-[var(--primary)]">{words[2]}</span>
        </span>
      </div>
    )
  } else {
    // 4 words or more
    const firstTwo = words.slice(0, 2).join(' ')
    const rest = words.slice(2).join(' ')
    renderedTitle = (
      <div className="flex flex-col -space-y-4">
        <span className="text-4xl md:text-6xl font-light text-zinc-300 tracking-wide uppercase leading-tight">{firstTwo}</span>
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
                className="w-full sm:w-auto bg-zinc-900 text-white px-10 py-5 text-sm font-black uppercase tracking-widest hover:bg-zinc-800 transition-all duration-500 shadow-2xl shadow-zinc-200 flex items-center justify-center gap-3"
              >
                {ctaText}
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link
                href={`https://wa.me/${store.whatsapp_phone?.replace(/\D/g, '')}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن بعض المنتجات.')}`}
                className="w-full sm:w-auto border border-zinc-200 text-zinc-900 px-10 py-5 text-sm font-black uppercase tracking-widest hover:bg-zinc-50 transition-all duration-500 flex items-center justify-center gap-3"
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
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
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
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">التصنيفات</span>
          <h2 className="text-4xl font-light text-zinc-900 tracking-tighter">اختر <span className="font-bold italic">أسلوبك</span></h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/store/${slug}/products?category=${cat.name}`} className="group relative aspect-square overflow-hidden bg-zinc-50">
              <Image
                src={cat.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop'}
                alt={cat.name}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 flex items-center justify-center">
                <h3 className="text-white text-sm font-black uppercase tracking-[0.2em]">{cat.name}</h3>
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-zinc-100 pb-12">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)]">الأكثر طلباً</span>
            <h2 className="text-4xl lg:text-5xl font-light text-zinc-900 tracking-tighter">القطع <span className="font-bold underline decoration-zinc-200 underline-offset-8">المميزة</span></h2>
          </div>
          <Link href={`/store/${slug}/products`} className="text-sm font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-2 group">
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
    { title: 'دعم متواصل', desc: 'فريقنا متاح دائماً للإجابة على استفساراتكم' }
  ]
  const features = branding?.features_data?.length > 0 ? branding.features_data : defaultFeatures

  return (
    <section className="py-24 bg-zinc-50 border-y border-zinc-100" dir="rtl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
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
          <Link href={`/store/${slug}`} className={`text-xs font-black uppercase tracking-widest transition-colors ${isActive(`/store/${slug}`) ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-900'}`}>الرئيسية</Link>
          <Link href={`/store/${slug}/products`} className={`text-xs font-black uppercase tracking-widest transition-colors ${isActive(`/store/${slug}/products`) ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-900'}`}>المنتجات</Link>
          <Link href={`/store/${slug}/track`} className={`text-xs font-black uppercase tracking-widest transition-colors ${isActive(`/store/${slug}/track`) ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-900'}`}>تتبع الطلب</Link>
        </nav>

        {/* Mobile Left Actions (Cart/Wishlist) */}
        <div className="flex md:hidden items-center gap-4">
           <Link href={`/store/${slug}/cart`} className="relative text-zinc-400">
             <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
             {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-zinc-900 text-white text-[7px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-black">{totalItems}</span>}
           </Link>
           <Link href={`/store/${slug}/wishlist`} className="relative text-zinc-400">
             <Heart className="h-5 w-5" strokeWidth={1.5} />
             {wishlistItems.length > 0 && <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[7px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-black">{wishlistItems.length}</span>}
           </Link>
        </div>

        {/* Logo (Centered Always) */}
        <Link href={`/store/${slug}`} className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          {branding?.logo_url ? (
            <div className="relative h-8 w-24 md:h-10 md:w-32">
              <Image src={branding.logo_url} alt={store.name} fill className="object-contain grayscale" />
            </div>
          ) : (
            <span className="text-xl md:text-2xl font-light tracking-tighter text-zinc-900 italic uppercase">
              {store.name}
            </span>
          )}
        </Link>

        {/* Mobile Right Actions (Home/Products) */}
        <div className="flex md:hidden items-center gap-4">
           <Link href={`/store/${slug}`} className={`text-[9px] font-black uppercase tracking-widest ${isActive(`/store/${slug}`) ? 'text-zinc-900' : 'text-zinc-400'}`}>الرئيسية</Link>
           <Link href={`/store/${slug}/products`} className={`text-[9px] font-black uppercase tracking-widest ${isActive(`/store/${slug}/products`) ? 'text-zinc-900' : 'text-zinc-400'}`}>المنتجات</Link>
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-6">
          <Link href={`/store/${slug}/wishlist`} className="group relative text-zinc-400 hover:text-rose-500 transition-colors">
            <Heart className="h-5 w-5" strokeWidth={1.5} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-2 -left-2 bg-rose-500 text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-lg">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <Link href={`/store/${slug}/cart`} className="group relative text-zinc-400 hover:text-zinc-900 transition-colors">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -left-2 bg-zinc-900 text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-lg">
                {totalItems}
              </span>
            )}
          </Link>
          <Link href={`https://wa.me/${store.whatsapp_phone?.replace(/\D/g, '')}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن بعض المنتجات.')}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-900 border border-zinc-900 px-5 py-2 hover:bg-zinc-900 hover:text-white transition-all duration-500">
            <MessageSquare className="h-3 w-3" />
            مساعدة
          </Link>
        </div>
      </div>
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
      <div className="mx-auto max-w-7xl px-6 text-center mb-16">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4 block">قالوا عنا</span>
        <h2 className="text-4xl font-light text-zinc-900 italic tracking-tighter">ثقة نعتز بها</h2>
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
                        className={`h-3 w-3 ${star <= Math.round(review.rating) ? 'text-zinc-900 fill-zinc-900' : 'text-zinc-100'}`}
                        strokeWidth={1}
                      />
                    ))}
                  </div>
                  <p className="text-lg font-light text-zinc-600 leading-relaxed italic line-clamp-3 text-right">
                    "{review.comment}"
                  </p>
                  <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
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
export const ElegantFooter = ({ store, branding }: any) => {
  return (
    <footer className="bg-white py-20 border-t border-zinc-100" dir="rtl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 pb-20 border-b border-zinc-50">
          <div className="text-right space-y-4">
            <h2 className="text-2xl font-light italic tracking-tighter text-zinc-900 uppercase">
              {store.name}
            </h2>
            <p className="text-xs font-bold text-zinc-400 max-w-xs leading-relaxed">
              {branding?.footer_description || 'نقدم لكم أجود المنتجات بأعلى معايير الجودة والفخامة.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 w-full md:w-auto">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">روابط سريعة</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors">السياسات</Link></li>
                <li><Link href="#" className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors">الأسئلة الشائعة</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">تواصل معنا</h4>
              <ul className="space-y-3">
                {store.whatsapp_phone && (
                  <li>
                    <Link href={`https://wa.me/${store.whatsapp_phone?.replace(/\D/g, '')}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن بعض المنتجات.')}`} className="group flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors">
                      <MessageSquare className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                      واتساب
                    </Link>
                  </li>
                )}
                {branding.facebook_url && (
                  <li>
                    <Link href={branding.facebook_url} className="group flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors">
                      <svg className="h-3 w-3 opacity-40 group-hover:opacity-100 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                      فيسبوك
                    </Link>
                  </li>
                )}
                {branding.instagram_url && (
                  <li>
                    <Link href={branding.instagram_url} className="group flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors">
                      <svg className="h-3 w-3 opacity-40 group-hover:opacity-100 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path></svg>
                      انستجرام
                    </Link>
                  </li>
                )}
                {branding.tiktok_url && (
                  <li>
                    <Link href={branding.tiktok_url} className="group flex items-center gap-2 text-[10px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors">
                      <Share2 className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                      تيك توك
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">العنوان</h4>
              <p className="text-[10px] font-bold text-zinc-400 leading-relaxed max-w-[200px]">
                {branding.address || "العنوان غير متوفر حالياً"}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
            © {new Date().getFullYear()} {store.name}. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-zinc-100" />
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kaya Market Platform</span>
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
    <section className="py-24 bg-white" dir="rtl">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-16 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">الأسئلة الشائعة</span>
          <h2 className="text-3xl font-light text-zinc-900 tracking-tighter">كل ما <span className="font-bold">تود معرفته</span></h2>
        </div>

        <div className="space-y-8">
          {faqs.map((faq: any, i: number) => (
            <div key={i} className="border-b border-zinc-100 pb-8 group">
              <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-4">
                <span className="text-[10px] font-black text-zinc-300">0{i + 1}</span>
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
