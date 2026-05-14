'use client'

import React, { useState } from 'react'
import { Star, ShoppingBag, Heart, ArrowRight, ShieldCheck, Truck, Leaf, Check, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import Link from 'next/link'
import { OrganicHeader, OrganicFooter, OrganicProductCard } from '../themes/OrganicTheme'
import CheckoutBox from '@/components/CheckoutBox'
import CountdownTimer from '@/components/CountdownTimer'
import { useWishlist } from '@/context/WishlistContext'
import toast from 'react-hot-toast'

export default function OrganicView({ product, store, branding, slug, galleryImages, ratingSummary, reviews, showWatermark, commonStyles, dbCategories }: any) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const { toggleItem, isInWishlist } = useWishlist()

  const primaryColor = branding?.primary_color || '#4A6741'
  const finalStyles = { ...commonStyles, '--primary': primaryColor, fontFamily: branding?.font_family || 'Outfit, Cairo, sans-serif' }
  const images = galleryImages?.length > 0 ? galleryImages : [product.image_url].filter(Boolean)
  const rating = ratingSummary?.average_rating || product.avg_rating || 5
  const reviewCount = ratingSummary?.total_reviews || reviews?.length || 0
  const discount = product.old_price && product.old_price > product.price
    ? Math.round((1 - product.price / product.old_price) * 100)
    : null

  const featuredExtras = ['مكونات طبيعية 100%', 'بدون مواد حافظة', 'صديق للبيئة', 'تغليف مستدام']

  return (
    <div className="min-h-screen bg-[#F9F7F2]" dir="rtl" style={finalStyles}>
      <OrganicHeader store={store} branding={branding} slug={slug} />

      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-10 text-xs font-bold text-zinc-400">
            <Link href={`/store/${slug}`} className="hover:text-[var(--primary)] transition-colors">الرئيسية</Link>
            <span className="text-zinc-300">•</span>
            <Link href={`/store/${slug}/products`} className="hover:text-[var(--primary)] transition-colors">المنتجات</Link>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-700 font-black truncate max-w-[200px]">{product.name}</span>
          </nav>

          {/* Product Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start">

            {/* ── Image Gallery ── */}
            <div className="space-y-4 lg:sticky lg:top-28">
              {/* Main image */}
              <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white border border-zinc-100 shadow-sm group cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}>
                <img src={images[selectedImage]} alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {discount && (
                  <div className="absolute top-5 right-5 px-3 py-1.5 bg-rose-500 text-white text-xs font-black rounded-xl shadow-lg">
                    -{discount}%
                  </div>
                )}
                <button
                  onClick={e => { e.stopPropagation(); toggleItem(product); toast.success(isInWishlist(product.id) ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة') }}
                  aria-label="المفضلة"
                  className={`absolute top-5 left-5 h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-md
                    ${isInWishlist(product.id) ? 'bg-[var(--primary)] text-white shadow-[var(--primary)]/30' : 'bg-white/90 backdrop-blur-sm text-zinc-700 hover:bg-white'}`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
                <div className="absolute bottom-5 right-5 flex items-center gap-2 bg-black/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-3.5 w-3.5" /> تكبير
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {images.map((img: string, idx: number) => (
                    <button key={idx} onClick={() => setSelectedImage(idx)}
                      className={`h-20 w-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300
                        ${selectedImage === idx ? 'border-[var(--primary)] shadow-md shadow-[var(--primary)]/20 scale-105' : 'border-transparent opacity-60 hover:opacity-90 hover:scale-105'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info ── */}
            <div className="space-y-8">
              {/* Category + name */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)]/8 rounded-full">
                  <Leaf className="h-3.5 w-3.5 text-[var(--primary)]" />
                  <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em]">منتج عضوي معتمد</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-tight">{product.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`h-4 w-4 ${s <= Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200 fill-zinc-200'}`} />
                    ))}
                    <span className="text-sm font-bold text-zinc-500 mr-1.5">{rating.toFixed(1)}</span>
                    {reviewCount > 0 && <span className="text-sm text-zinc-400">({reviewCount} تقييم)</span>}
                  </div>
                  <div className="h-4 w-px bg-zinc-200" />
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-black uppercase tracking-widest">
                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    متوفر في المخزون
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-[var(--primary)]">{product.price.toLocaleString()} ج.م</span>
                {product.old_price && (
                  <>
                    <span className="text-xl text-zinc-400 line-through font-medium">{product.old_price.toLocaleString()} ج.م</span>
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-500 text-xs font-black rounded-lg">وفّر {discount}%</span>
                  </>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-zinc-500 font-medium leading-relaxed text-base border-t border-zinc-100 pt-6">
                  {product.description}
                </p>
              )}

              {/* Checkout Box */}
              <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-lg shadow-zinc-200/30 space-y-6">
                {product.sale_end_date && <CountdownTimer endDate={product.sale_end_date} />}
                <CheckoutBox product={product} storeId={store.id} storeSlug={slug} selectedTheme={branding?.theme_id} />
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { Icon: Truck, label: 'شحن سريع وآمن' },
                  { Icon: ShieldCheck, label: 'ضمان الجودة 100%' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 p-4 bg-[var(--primary)]/5 rounded-2xl border border-[var(--primary)]/10 group hover:bg-[var(--primary)]/10 transition-colors">
                    <div className="h-9 w-9 bg-white rounded-xl flex items-center justify-center text-[var(--primary)] shadow-sm flex-shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-black text-zinc-700">{label}</span>
                  </div>
                ))}
              </div>

              {/* Features list */}
              <div className="grid grid-cols-2 gap-2.5">
                {featuredExtras.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-zinc-600">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <div className="mt-24 pt-16 border-t border-zinc-100">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                {/* Summary */}
                <div className="flex-shrink-0 bg-white rounded-[2.5rem] p-8 text-center border border-zinc-100 shadow-sm w-full md:w-64">
                  <p className="text-6xl font-black text-zinc-900 mb-2">{rating.toFixed(1)}</p>
                  <div className="flex justify-center gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-zinc-400 font-medium">{reviewCount} تقييم</p>
                  {[5,4,3,2,1].map(star => {
                    const pct = ratingSummary?.distribution?.[star] || (star === 5 ? 70 : star === 4 ? 20 : 5)
                    return (
                      <div key={star} className="flex items-center gap-2 mt-2 text-xs">
                        <span className="font-bold text-zinc-500 w-3">{star}</span>
                        <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Review cards */}
                <div className="flex-1 space-y-4">
                  <h2 className="text-2xl font-black text-zinc-900 mb-6">آراء العملاء</h2>
                  {reviews.slice(0, 5).map((rev: any, i: number) => (
                    <div key={i} className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                          {rev.customer_name?.charAt(0) || 'ع'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="font-black text-zinc-900 text-sm">{rev.customer_name || 'عميل'}</p>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200'}`} />)}
                            </div>
                          </div>
                          {rev.comment && <p className="text-sm text-zinc-500 font-medium mt-2 leading-relaxed">{rev.comment}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Related Products */}
          {store.products?.length > 0 && (
            <div className="mt-24 pt-16 border-t border-zinc-100">
              <div className="flex justify-between items-end mb-10">
                <h2 className="text-3xl font-black text-zinc-900">
                  منتجات <span className="italic text-[var(--primary)] font-serif">ذات صلة</span>
                </h2>
                <Link href={`/store/${slug}/products`}
                  className="text-xs font-black text-zinc-400 hover:text-[var(--primary)] transition-colors uppercase tracking-widest flex items-center gap-1.5 group">
                  عرض الكل <ArrowRight className="h-3.5 w-3.5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {store.products.filter((p: any) => p.id !== product.id).slice(0, 4).map((p: any) => (
                  <OrganicProductCard key={p.id} product={p} slug={slug} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <X className="h-5 w-5" />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setSelectedImage((selectedImage - 1 + images.length) % images.length) }}
                className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={e => { e.stopPropagation(); setSelectedImage((selectedImage + 1) % images.length) }}
                className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <img src={images[selectedImage]} alt={product.name} className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <OrganicFooter store={store} branding={branding} slug={slug} showWatermark={showWatermark} categories={dbCategories} />
    </div>
  )
}
