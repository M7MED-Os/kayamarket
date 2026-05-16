'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Heart, Search, Menu, X, ArrowLeft, Leaf, Star, MessageSquare, Check, PackageSearch, ArrowRight, User, ShieldCheck, Zap, ExternalLink, Mail, ArrowUpRight, Lock, Truck, RefreshCw, Smartphone, CreditCard, Landmark } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { KayaBadge } from '@/components/store/KayaBadge'
import toast from 'react-hot-toast'

// --- Custom Social Icons ---
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

// ─────────────────────────────────────────
// ORGANIC HEADER
// ─────────────────────────────────────────
export function OrganicHeader({ store, branding, slug }: any) {
  const { totalItems: cartCount } = useCart()
  const { totalItems: wishlistCount } = useWishlist()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const primaryColor = branding?.primary_color || '#4A6741'

  return (
    <header className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-2' : 'py-4 sm:py-6'}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-12">
        <div className={`relative flex items-center justify-between px-4 sm:px-10 py-2.5 sm:py-3 rounded-[2.5rem] border transition-all duration-700 ${isScrolled
          ? 'bg-white/80 backdrop-blur-2xl border-zinc-200/50 shadow-sm'
          : 'bg-white/40 backdrop-blur-md border-white/40'
          }`}>

          {/* Nav — Left */}
          <div className="flex items-center gap-1 sm:gap-4 relative z-10">
            <nav className="hidden lg:flex items-center gap-1">
              <Link href={`/store/${slug}`} className="px-4 py-2 text-[10px] font-black tracking-[0.2em] text-zinc-900 hover:text-[var(--primary)] transition-all uppercase">الرئيسية</Link>
              <Link href={`/store/${slug}/products`} className="px-4 py-2 text-[10px] font-black tracking-[0.2em] text-zinc-900 hover:text-[var(--primary)] transition-all uppercase">المتجر</Link>
            </nav>
            {/* Mobile simplified links - Smaller text & tighter spacing */}
            <div className="lg:hidden flex items-center gap-1.5">
              <Link href={`/store/${slug}`} className="px-1.5 py-1 text-[9px] font-black text-zinc-900 uppercase">الرئيسية</Link>
              <Link href={`/store/${slug}/products`} className="px-1.5 py-1 text-[9px] font-black text-zinc-900 uppercase">المتجر</Link>
            </div>
          </div>

          {/* Logo — Center */}
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <Link href={`/store/${slug}`} className="pointer-events-auto flex flex-col items-center">
              <span className="text-base sm:text-2xl font-black italic font-serif" style={{ color: primaryColor }}>
                {store.name}
              </span>
            </Link>
          </div>

          {/* Icons — Right - Tighter for mobile */}
          <div className="flex items-center gap-0.5 sm:gap-2 relative z-10">
            <Link href={`/store/${slug}/track`} aria-label="تتبع الطلب" className="p-1.5 sm:p-2 text-zinc-500 hover:text-zinc-900 transition-all">
              <Truck className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem] stroke-[1.5]" />
            </Link>

            <Link href={`/store/${slug}/wishlist`} aria-label="المفضلة" className="relative p-1.5 sm:p-2 text-zinc-500 hover:text-rose-500 transition-all">
              <Heart className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem] stroke-[1.5]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 h-3 w-3 bg-rose-500 text-white text-[7px] font-black rounded-full flex items-center justify-center border border-white">{wishlistCount}</span>
              )}
            </Link>

            <Link href={`/store/${slug}/cart`} aria-label="السلة" className="relative p-1.5 sm:p-2 text-zinc-500 hover:text-zinc-900 transition-all">
              <div className="relative">
                <ShoppingBag className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem] stroke-[1.5]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-3 w-3 bg-zinc-900 text-white text-[7px] font-black rounded-full flex items-center justify-center border border-white">{cartCount}</span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

// ─────────────────────────────────────────
// ORGANIC PRODUCT CARD
// ─────────────────────────────────────────
export function OrganicProductCard({ product, slug }: any) {
  const { addItem } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({ id: product.id, slug: product.slug, cartItemId: `${product.id}-none-none`, name: product.name, price: product.price, image_url: product.image_url, quantity: 1, variant_info: {} })
    toast.success('تمت الإضافة للسلة')
  }

  const discount = product.old_price && product.old_price > product.price
    ? Math.round((1 - product.price / product.old_price) * 100)
    : null

  return (
    <div className="group bg-white rounded-[1.5rem] overflow-hidden border border-zinc-100 hover:shadow-lg transition-all flex flex-col items-center">
      <div className="relative w-full aspect-square overflow-hidden bg-zinc-50">
        <Link href={`/store/${slug}/products/${product.slug || product.id}`} className="block w-full h-full">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        </Link>
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <button
            onClick={e => { e.preventDefault(); toggleItem(product) }}
            className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all shadow-sm backdrop-blur-md
              ${isInWishlist(product.id) ? 'bg-rose-500 text-white' : 'bg-white/80 text-zinc-400 hover:text-rose-500'}`}
          >
            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleAddToCart}
            className="h-9 w-9 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-[var(--primary)] transition-all shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>

        {discount && (
          <span className="absolute top-3 right-3 px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded-lg">-{discount}%</span>
        )}
      </div>

      <div className="p-5 text-center space-y-2 w-full">
        <div className="flex justify-center items-center gap-0.5">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className={`h-2.5 w-2.5 ${s <= Math.floor(product.avg_rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 fill-zinc-200'}`} />
          ))}
        </div>
        
        <Link href={`/store/${slug}/products/${product.slug || product.id}`}>
          <h3 className="text-sm font-black text-zinc-900 line-clamp-1">{product.name}</h3>
        </Link>
        
        <div className="flex flex-col items-center gap-1">
          <p className="text-base font-black text-[var(--primary)]">{product.price.toLocaleString()} ج.م</p>
          {product.old_price && (
            <p className="text-[10px] text-zinc-400 line-through font-medium">{product.old_price.toLocaleString()} ج.م</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// ORGANIC FOOTER
// ─────────────────────────────────────────
export function OrganicFooter({ store, branding, slug, showWatermark, categories }: any) {
  const footerCategories = categories?.slice(0, 5) || []
  const primaryColor = branding?.primary_color || '#4A6741'

  return (
    <footer className="bg-[#0D0D0D] text-white pt-24 pb-12 relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 pb-16 border-b border-white/5 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl sm:text-4xl font-black italic font-serif leading-tight">انضمي لعائلة <span style={{ color: primaryColor }}>{store.name}</span> على فيسبوك</h3>
            <p className="text-zinc-500 text-sm max-w-md leading-relaxed">تابعي صفحتنا لتصلك أحدث أسرار العناية بالبشرة والعروض الحصرية قبل الجميع.</p>
          </div>
          <div className="relative flex lg:justify-end">
             {branding?.facebook_url && (
                <a href={branding.facebook_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 bg-[#1877F2] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:-translate-y-1 transition-all w-full sm:w-auto justify-center">
                  <FacebookIcon className="h-5 w-5" /> تابعينا الآن
                </a>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <Link href={`/store/${slug}`} className="text-2xl font-black italic font-serif" style={{ color: primaryColor }}>{store.name}</Link>
            <div 
              className="text-zinc-500 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: (branding?.footer_description || store.description || 'نهتم بجمالك الطبيعي من خلال منتجات عضوية مختارة بعناية فائقة.').replace(/\n/g, '<br/>') }}
            />
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)] mb-8">روابط سريعة</h4>
            <nav className="flex flex-col gap-4">
              {['الرئيسية', 'المتجر', 'تتبع الطلب', 'المفضلة'].map((item) => (
                <Link key={item} href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">{item}</Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)] mb-8">الأقسام</h4>
            <nav className="flex flex-col gap-4">
              {footerCategories.map((cat: any) => (
                <Link key={cat.id} href={`/store/${slug}/products?category=${cat.name}`} className="text-sm text-zinc-500 hover:text-white transition-colors">{cat.name}</Link>
              ))}
            </nav>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--primary)] mb-8">تسوق آمن</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">حماية ١٠٠٪</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col items-center gap-2">
                <Truck className="h-5 w-5 text-[var(--primary)]" />
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">شحن سريع</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">© {new Date().getFullYear()} {store.name}. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap items-center gap-6 opacity-60">
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
          {showWatermark && <KayaBadge />}
        </div>
      </div>
    </footer>
  )
}
