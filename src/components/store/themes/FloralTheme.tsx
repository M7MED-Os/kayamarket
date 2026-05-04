'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { ShoppingBag, Heart, Menu, X, Flower2, Truck, Gift, Star, ChevronDown, Quote, MessageCircle, ChevronRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

// ─── Decorative SVGs ────────────────────────────────────────────────────────
export function PetalDeco({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 10 C60 10 20 50 20 100 C20 150 60 190 100 190 C140 190 180 150 180 100 C180 50 140 10 100 10Z" fill="currentColor" opacity="0.12" />
      <path d="M100 30 C75 30 45 60 45 100 C45 140 75 170 100 170 C125 170 155 140 155 100 C155 60 125 30 100 30Z" fill="currentColor" opacity="0.08" />
      <circle cx="100" cy="100" r="15" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function LeafDeco({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C50 5 5 40 5 90 C5 130 25 155 50 155 C75 155 95 130 95 90 C95 40 50 5 50 5Z" fill="currentColor" />
      <line x1="50" y1="155" x2="50" y2="30" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
      <line x1="50" y1="80" x2="25" y2="55" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="50" y1="100" x2="75" y2="75" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="50" y1="120" x2="30" y2="100" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
    </svg>
  )
}

export function StarDeco({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0 L22 18 L40 20 L22 22 L20 40 L18 22 L0 20 L18 18 Z" />
    </svg>
  )
}

// ─── Mobile Menu ─────────────────────────────────────────────────────────────
function MobileMenu({ open, onClose, slug }: { open: boolean; onClose: () => void; slug: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-72 bg-white shadow-2xl flex flex-col p-8 gap-6 animate-in slide-in-from-right duration-300">
        <button onClick={onClose} className="self-end p-2 text-zinc-400 hover:text-zinc-700">
          <X className="h-6 w-6" />
        </button>
        <nav className="flex flex-col gap-6 text-lg font-serif italic text-[#2B2B2B]">
          <Link href={`/store/${slug}/products`} onClick={onClose} className="hover:text-[var(--primary)] transition-colors">كل الباقات</Link>
          <Link href={`/store/${slug}/track`} onClick={onClose} className="hover:text-[var(--primary)] transition-colors">تتبع طلبك</Link>
          <Link href={`#features`} onClick={onClose} className="hover:text-[var(--primary)] transition-colors">لماذا نحن</Link>
        </nav>
        <div className="mt-auto">
          <Link href={`/store/${slug}/products`} onClick={onClose} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--primary)] text-white rounded-full font-bold shadow-lg shadow-[var(--primary)]/20 hover:-translate-y-0.5 transition-all">
            <ShoppingBag className="h-5 w-5" />
            تسوق الآن
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────
export function FloralHeader({ store, branding, slug }: { store: any; branding: any; slug: string }) {
  const { totalItems } = useCart()
  const { totalItems: wishCount } = useWishlist()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} slug={slug} />
      <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border-b border-rose-50' : 'bg-white/70 backdrop-blur-md'}`}>
        {/* Top accent line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-40" />
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/store/${slug}`} className="group flex items-center gap-2">
            {branding?.logo_url ? (
              <img src={branding.logo_url} alt={store.name} className="h-11 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <span className="text-2xl md:text-3xl font-serif italic font-bold text-[var(--primary)] tracking-tight group-hover:opacity-80 transition-opacity">{store.name}</span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-bold text-zinc-600">
            <Link href={`/store/${slug}/products`} className="group flex flex-col items-center gap-0.5">
              <span className="group-hover:text-[var(--primary)] transition-colors">مجموعتنا</span>
              <span className="h-0.5 w-0 bg-[var(--primary)] transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
            <Link href={`/store/${slug}/track`} className="group flex flex-col items-center gap-0.5">
              <span className="group-hover:text-[var(--primary)] transition-colors">تتبع هديتك</span>
              <span className="h-0.5 w-0 bg-[var(--primary)] transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
            <Link href="#features" className="group flex flex-col items-center gap-0.5">
              <span className="group-hover:text-[var(--primary)] transition-colors">لماذا نحن</span>
              <span className="h-0.5 w-0 bg-[var(--primary)] transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link href={`/store/${slug}/wishlist`} className="relative p-3 text-zinc-500 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <Heart className="h-5 w-5" />
              {wishCount > 0 && <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white" />}
            </Link>
            <Link href={`/store/${slug}/cart`} className="relative p-3 text-zinc-500 hover:text-[var(--primary)] hover:bg-rose-50 rounded-full transition-all">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-[var(--primary)] text-[9px] font-black text-white flex items-center justify-center shadow-md">{totalItems}</span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(true)} className="md:hidden p-3 text-zinc-500 hover:bg-rose-50 rounded-full transition-all">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────
export function FloralHero({ branding, store, slug }: { branding: any; store: any; slug: string }) {
  const heroTitle = branding?.hero_title || store.name
  const heroDesc = branding?.hero_description || 'نُنسّق مشاعرك في باقات من الجمال، نهتم بكل تفصيلة لتصل هديتك بأبهى صورة.'
  const heroImage = branding?.hero_image_url || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=2000&auto=format&fit=crop'
  const whatsapp = store.whatsapp_phone

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden" style={{ background: 'linear-gradient(160deg, #FAF3F0 0%, #fff 50%, #F0F4F0 100%)' }}>
      {/* Bg decorations */}
      <PetalDeco className="absolute -top-20 -right-20 h-80 w-80 text-[var(--primary)] opacity-30 rotate-12" />
      <PetalDeco className="absolute -bottom-20 -left-20 h-64 w-64 text-emerald-200 opacity-40 -rotate-12" />
      <StarDeco className="absolute top-32 left-1/4 h-8 w-8 text-[var(--primary)] opacity-20 animate-pulse" />
      <StarDeco className="absolute bottom-40 right-1/3 h-5 w-5 text-amber-300 opacity-30 animate-pulse delay-700" />
      <StarDeco className="absolute top-1/2 right-16 h-4 w-4 text-rose-300 opacity-25 animate-pulse delay-1000" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <div className="space-y-8 text-center lg:text-right order-2 lg:order-1">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-rose-100 shadow-sm">
              <Flower2 className="h-4 w-4 text-[var(--primary)]" />
              <span className="text-xs font-black text-[var(--primary)] uppercase tracking-[0.2em]">تشكيلة الموسم</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-black text-[#2B2B2B] leading-[1.2] tracking-normal drop-shadow-sm max-w-[12em] mx-auto lg:mx-0">
              {heroTitle}
            </h1>

            <p className="text-lg text-zinc-500 max-w-md mx-auto lg:mx-0 font-medium leading-relaxed">
              {heroDesc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href={`/store/${slug}/products`} className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-10 py-4 bg-[var(--primary)] text-white rounded-full font-bold text-base shadow-xl shadow-[var(--primary)]/25 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 active:scale-95">
                <ShoppingBag className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                تسوق الباقات
              </Link>
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('مرحباً، أود التواصل معكم بخصوص الطلبات.')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-10 py-4 bg-white text-zinc-700 rounded-full font-bold text-base border border-zinc-200 hover:border-[var(--primary)] hover:bg-rose-50 shadow-sm transition-all duration-300 active:scale-95">
                  <MessageCircle className="h-5 w-5 text-[var(--primary)] group-hover:scale-110 transition-transform" />
                  تواصل معنا
                </a>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                <div className="h-5 w-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <Truck className="h-3 w-3 text-emerald-600" />
                </div>
                توصيل سريع
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                <div className="h-5 w-5 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
                  <Heart className="h-3 w-3 text-rose-500" />
                </div>
                زهور طازجة
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                <div className="h-5 w-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <Star className="h-3 w-3 text-amber-500 fill-current" />
                </div>
                تغليف فاخر
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative justify-center order-1 lg:order-2 hidden lg:flex">
            {/* Main arch image */}
            <div className="relative w-[85%] max-w-sm lg:max-w-none aspect-[3/4] rounded-t-full rounded-b-[4rem] overflow-hidden shadow-2xl shadow-rose-900/15 ring-8 ring-white group">
              <img src={heroImage} alt="Floral Arrangement" className="absolute inset-0 h-full w-full object-cover scale-105 group-hover:scale-110 transition-transform duration-[1.5s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Floating badge */}
            <div className="absolute top-8 -right-12 bg-white rounded-3xl p-5 shadow-2xl border border-rose-50 flex items-center gap-4 animate-float z-20">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-[var(--primary)]">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div>
                <p className="text-sm font-black text-zinc-900">صُنعت بحب</p>
                <p className="text-xs font-bold text-zinc-400">لكل مناسباتكم</p>
              </div>
            </div>

            {/* Secondary decoration */}
            <LeafDeco className="absolute -top-8 -right-4 h-20 w-14 text-emerald-200/60 rotate-12" />
          </div>
        </div>
      </div>
    </section>
  )
}

import { CheckCircle2 } from 'lucide-react'

// ─── Product Card ────────────────────────────────────────────────────────────
export function FloralProductCard({ product, slug }: { product: any; slug: string }) {
  const { addItem } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()
  const [adding, setAdding] = useState(false)
  const favorited = isInWishlist(product.id)
  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100) : 0

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setAdding(true)
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity: 1 })
    setTimeout(() => setAdding(false), 1200)
  }

  return (
    <div className="group relative flex flex-col bg-white rounded-[2rem] overflow-hidden border border-rose-50/60 hover:border-rose-200 transition-all duration-500 hover:shadow-2xl hover:shadow-rose-900/5 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-50 border-b border-rose-50/50">
        <Link href={`/store/${slug}/products/${product.id}`} className="block h-full w-full">
          <img src={product.image_url} alt={product.name}
            className="h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Badges */}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-[var(--primary)] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
            خصم {discount}%
          </span>
        )}

        {/* Wishlist */}
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleItem(product) }}
          className={`absolute top-3 left-3 h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${favorited ? 'bg-rose-500 text-white' : 'bg-white/75 text-zinc-500 hover:text-rose-500'}`}>
          <Heart className={`h-4.5 w-4.5 ${favorited ? 'fill-current' : ''}`} strokeWidth={2} />
        </button>

        {/* Add to cart - slides up */}
        <div className="absolute bottom-4 inset-x-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
          <button onClick={handleAdd}
            className={`w-full h-12 flex items-center justify-center gap-2 rounded-full font-bold text-sm backdrop-blur-xl shadow-2xl border border-white/20 transition-all hover:scale-[1.02] active:scale-95 ${adding ? 'bg-emerald-500 text-white' : 'bg-white/90 text-[#2B2B2B] hover:bg-[var(--primary)] hover:text-white'}`}>
            {adding ? <><CheckCircle2 className="h-5 w-5" /> تمت الإضافة</> : <><ShoppingBag className="h-5 w-5" /> أضف للسلة</>}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 pt-3 pb-6 text-center space-y-1.5">
        <Link href={`/store/${slug}/products/${product.id}`}>
          <h3 className="font-serif italic text-[#2B2B2B] text-base font-bold line-clamp-1 hover:text-[var(--primary)] transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-center gap-2">
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-zinc-400 line-through">{Number(product.original_price).toLocaleString()} ج.م</span>
          )}
          <span className="text-lg font-black text-[var(--primary)]">{Number(product.price).toLocaleString()} ج.م</span>
        </div>
      </div>
    </div>
  )
}

// ─── Categories ───────────────────────────────────────────────────────────────
export function FloralCategories({ categories, slug }: { categories: any[]; slug: string }) {
  if (!categories || categories.length === 0) return null
  const placeholders = [
    'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?q=80&w=800&fit=crop',
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=800&fit=crop',
    'https://images.unsplash.com/photo-1490750967868-88df5691cc10?q=80&w=800&fit=crop',
    'https://images.unsplash.com/photo-1547517023-7ca0b3954cbc?q=80&w=800&fit=crop',
  ]
  return (
    <section className="py-28 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <StarDeco className="h-4 w-4 text-[var(--primary)]" />
              <span className="text-xs font-black text-[var(--primary)] uppercase tracking-[0.25em]">تصفح حسب المناسبة</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif italic text-[#2B2B2B] leading-tight">أقسام المتجر</h2>
          </div>
          <Link href={`/store/${slug}/products`}
            className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-[var(--primary)] transition-colors group px-6 py-3 rounded-full border border-zinc-200 hover:border-[var(--primary)] shrink-0">
            عرض الكل
            <ChevronRight className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid — elegant arch cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
          {categories.slice(0, 4).map((cat, i) => (
            <Link key={cat.id || i} href={`/store/${slug}/products?category=${cat.name}`}
              className="group flex flex-col items-center gap-5">
              <div className="relative w-full aspect-[3/4] rounded-t-full rounded-b-3xl overflow-hidden border-4 border-white shadow-md ring-1 ring-zinc-100 group-hover:ring-[var(--primary)]/30 group-hover:shadow-2xl group-hover:-translate-y-3 transition-all duration-700">
                <img src={cat.image_url || placeholders[i % 4]} alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-serif italic text-[#2B2B2B] group-hover:text-[var(--primary)] transition-colors duration-300">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ──────────────────────────────────────────────────────────────
export function FloralFeatures({ branding }: { branding?: any }) {
  const defaultFeatures = [
    { title: 'زهور طازجة', desc: 'نختار يومياً أجود أنواع الزهور' },
    { title: 'توصيل سريع', desc: 'توصيل سريع وآمن للورود' },
    { title: 'تغليف فاخر', desc: 'تغليف احترافي يليق بقيمة الهدية' },
    { title: 'كروت إهداء', desc: 'رسائل شخصية مع كل باقة' },
  ]

  const features = (Array.isArray(branding?.features_data) && branding.features_data.length > 0)
    ? branding.features_data
    : defaultFeatures

  const getIcon = (idx: number) => {
    const icons = [Flower2, Truck, Gift, Heart, Star]
    const Icon = icons[idx % icons.length]
    return <Icon className="h-7 w-7" strokeWidth={1.5} />
  }

  const getColors = (idx: number) => {
    const colors = [
      'bg-rose-50 text-[var(--primary)] border-rose-100',
      'bg-emerald-50 text-emerald-600 border-emerald-100',
      'bg-amber-50 text-amber-600 border-amber-100',
      'bg-pink-50 text-pink-600 border-pink-100',
    ]
    return colors[idx % colors.length]
  }

  return (
    <section id="features" className="py-28" style={{ background: 'linear-gradient(180deg, #fff 0%, #FAF3F0 100%)' }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif italic text-[#2B2B2B]">لماذا تختارنا؟</h2>
          <p className="text-zinc-500 font-medium max-w-md mx-auto">كل تفصيلة صُممت بعناية لتجعل هديتك لا تُنسى</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat: any, i: number) => (
            <div key={i} className="group flex flex-col items-center text-center space-y-5 p-8 rounded-[2rem] bg-white border border-zinc-50 hover:border-[var(--primary)]/20 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border ${getColors(i)} group-hover:scale-110 transition-transform duration-500`}>
                {getIcon(i)}
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-serif text-[#2B2B2B]">{feat.title}</h4>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ───────────────────────────────────────────────────────────

export function FloralTestimonials({ reviews }: { reviews: any[] }) {
  const [isPaused, setIsPaused] = useState(false)
  if (!reviews || reviews.length === 0) return null

  // Match ElegantTheme logic: ensure at least 12 items (duplicated) for a seamless loop
  const repeatedReviews = useMemo(() => {
    const minItems = 12
    const repeatCount = Math.ceil(minItems / reviews.length)
    // We need at least 2 full sets for the translateX(-50%) trick to work
    const baseSet = Array.from({ length: repeatCount }).flatMap(() => reviews)
    return [...baseSet, ...baseSet]
  }, [reviews])

  const duration = (repeatedReviews.length / 2) * 8 // 8s per item

  return (
    <section className="py-28 bg-white overflow-hidden select-none" dir="rtl">
      <style>{`
        @keyframes floralMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-floral-marquee {
          animation: floralMarquee linear infinite;
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <StarDeco className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-xs font-black text-[var(--primary)] uppercase tracking-[0.25em]">آراء عملائنا</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif italic text-[#2B2B2B]">مشاعر من القلب</h2>
        </div>
      </div>

      <div className="relative w-full" dir="ltr">
        {/* Left/Right Fade Gradients */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div
          className="flex w-max animate-floral-marquee"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            animationDuration: `${duration}s`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          <div className="flex gap-8 px-6">
            {repeatedReviews.map((r, i) => (
              <div key={i} className="w-[350px] shrink-0 group relative p-8 rounded-[2.5rem] border border-rose-50 hover:border-rose-100 bg-[#FAF3F0]/40 hover:bg-[#FAF3F0]/80 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 mx-3" dir="rtl">
                <Quote className="absolute top-6 left-6 h-10 w-10 text-[var(--primary)]/10 rotate-180" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className={`h-4 w-4 ${idx < (r.rating || 5) ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-zinc-200'}`} />
                  ))}
                </div>
                <p className="text-base font-medium text-zinc-600 leading-relaxed mb-6 italic min-h-[80px]">"{r.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white border border-rose-100 flex items-center justify-center shadow-sm shrink-0">
                    <span className="text-base font-black text-[var(--primary)]">{r.customer_name?.charAt(0) || 'ع'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{r.customer_name || 'عميل'}</p>
                    <p className="text-xs font-medium text-zinc-400">عميل موثق</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ────────────────────────────────────────────────────────────────────
export function FloralFAQ({ branding }: { branding: any }) {
  const faqs = branding?.faq_data || [
    { q: 'هل يمكن إضافة كارت إهداء مع الباقة؟', a: 'نعم، نوفر كروت إهداء بتصاميم فاخرة مجاناً مع كل طلب.' },
    { q: 'متى يتم التوصيل؟', a: 'نفس اليوم للطلبات قبل الساعة 4 عصراً.' },
    { q: 'هل الزهور طبيعية وطازجة؟', a: 'نعم، نختار أجود الزهور يومياً من مزارع معتمدة.' },
    { q: 'هل يمكن إرسال الباقة كهدية مجهولة؟', a: 'بالتأكيد! يمكنك اختيار إرسال الهدية بدون ذكر اسم المُرسل.' },
  ]
  return (
    <section className="py-28" style={{ background: '#FAF3F0' }}>
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif italic text-[#2B2B2B]">أسئلة شائعة</h2>
          <p className="text-zinc-500 font-medium">كل ما تحتاج لمعرفته</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq: any, i: number) => (
            <details key={i} className="group bg-white rounded-[2rem] overflow-hidden border border-transparent hover:border-rose-100 transition-all duration-300 hover:shadow-md">
              <summary className="flex items-center justify-between cursor-pointer p-7 font-serif italic text-lg text-[#2B2B2B] list-none gap-4">
                <span>{faq.q}</span>
                <div className="h-9 w-9 rounded-full bg-[#FAF3F0] flex items-center justify-center group-open:bg-[var(--primary)] group-open:text-white transition-colors shrink-0">
                  <ChevronDown className="h-5 w-5 transition-transform duration-500 group-open:rotate-180" />
                </div>
              </summary>
              <div className="px-7 pb-7 text-base font-medium text-zinc-600 leading-relaxed border-t border-zinc-50 pt-5">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────
const FacebookIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
const InstagramIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
const TwitterIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>

export function FloralFooter({ store, branding }: { store: any; branding: any }) {
  const socials = [
    { key: 'instagram_url', Icon: InstagramIcon, label: 'Instagram' },
    { key: 'facebook_url', Icon: FacebookIcon, label: 'Facebook' },
    { key: 'twitter_url', Icon: TwitterIcon, label: 'Twitter' },
    { key: 'snapchat_url', Icon: MessageCircle, label: 'Snapchat' },
  ]
  const activeSocials = socials.filter(s => branding?.[s.key])

  return (
    <footer className="bg-[#2B2B2B] text-white pt-20 pb-10 relative overflow-hidden" id="contact">
      {/* Top decorative line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-40" />
      {/* Decorative petals */}
      <PetalDeco className="absolute -top-20 left-10 h-48 w-48 text-white opacity-[0.02]" />
      <PetalDeco className="absolute bottom-0 right-10 h-64 w-64 text-[var(--primary)] opacity-[0.04] rotate-45" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            {branding?.logo_url ? (
              <img src={branding.logo_url} alt={store.name} className="h-12 w-auto object-contain brightness-0 invert opacity-90" />
            ) : (
              <span className="text-3xl font-serif italic text-white">{store.name}</span>
            )}
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
              {branding?.footer_description || branding?.tagline || 'نؤمن أن الزهور هي لغة القلوب، نسعى دائماً لنكون جزءاً من ذكرياتكم.'}
            </p>
          </div>

          {/* Links */}
          <div className="space-y-5">
            <h4 className="text-sm font-serif italic text-white/80">روابط سريعة</h4>
            <ul className="space-y-3 text-sm font-medium text-zinc-400">
              <li><Link href={`/store/${store.slug}/products`} className="hover:text-white transition-colors">تصفح الباقات</Link></li>
              <li><Link href={`/store/${store.slug}/track`} className="hover:text-white transition-colors">تتبع طلبك</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">سياسة الاسترجاع</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">الأسئلة الشائعة</Link></li>
            </ul>
          </div>

          <div className="space-y-5">
            <h4 className="text-sm font-serif italic text-white/80">التواصل</h4>
            <div className="space-y-4">
              {store.address && (
                <div className="flex items-start gap-2 text-sm font-medium text-zinc-400 pt-2">
                  <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                  </div>
                  <span className="leading-relaxed">{store.address}</span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                {store.whatsapp_phone && (
                  <a href={`https://wa.me/${store.whatsapp_phone.replace(/\D/g, '')}?text=${encodeURIComponent('مرحباً! أود التواصل معكم.')}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                    className="h-10 w-10 rounded-full bg-white/8 hover:bg-[var(--primary)] border border-white/10 hover:border-[var(--primary)] flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-300 hover:scale-110">
                    <MessageCircle className="h-5 w-5" />
                  </a>
                )}
                {activeSocials.map(({ key, Icon, label }) => (
                  <a key={key} href={branding[key]} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="h-10 w-10 rounded-full bg-white/8 hover:bg-[var(--primary)] border border-white/10 hover:border-[var(--primary)] flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-300 hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-zinc-600">
          <p>© {new Date().getFullYear()} {store.name}. جميع الحقوق محفوظة.</p>
          <p>صُنع بواسطة <span className="text-white font-serif italic">KayaMarket</span></p>
        </div>
      </div>
    </footer>
  )
}
