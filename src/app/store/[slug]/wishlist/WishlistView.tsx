'use client'

import { useWishlist } from '@/context/WishlistContext'
import Link from 'next/link'
import { Heart, ArrowRight } from 'lucide-react'
import StoreHeader from '@/components/StoreHeader'
import StoreFooter from '@/components/StoreFooter'
import ProductCard from '@/components/product/ProductCard'
import {
  ElegantHeader,
  ElegantFooter,
  ElegantProductCard
} from '@/components/store/themes/ElegantTheme'
import {
  FloralHeader,
  FloralFooter,
  FloralProductCard
} from '@/components/store/themes/FloralTheme'

export default function WishlistView({ params, storeData }: { params: { slug: string }, storeData: any }) {
  const { slug } = params
  const { items } = useWishlist()

  if (!storeData?.store) return <div className="min-h-screen flex items-center justify-center font-black text-2xl">المتجر غير موجود</div>

  const { store, branding } = storeData
  const primaryColor = branding?.primary_color || '#e11d48'
  const selectedTheme = (branding as any)?.selected_theme || 'default'

  const commonStyles = { '--primary': primaryColor } as any

  // ─── THEME: ELEGANT ────────────────────────────────────────────────────────
  if (selectedTheme === 'elegant') {
    return (
      <div className="min-h-screen bg-white" dir="rtl" style={commonStyles}>
        <ElegantHeader store={store} branding={branding} slug={slug} />
        <main className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col items-center text-center mb-16 space-y-4">
            <div className="h-px w-12 bg-[var(--primary)]/30 mb-2" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">قائمتك</span>
            <h1 className="text-4xl md:text-5xl font-light text-zinc-900 tracking-tighter uppercase">المنتجات <span className="font-bold italic text-[var(--primary)]">المفضلة</span></h1>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-32 border border-zinc-100 bg-zinc-50/50 rounded-[3rem]">
              <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                 <Heart className="h-10 w-10 text-zinc-200" />
              </div>
              <p className="text-lg font-light italic text-zinc-400 mb-8">قائمة المفضلات فارغة حالياً</p>
              <Link href={`/store/${slug}/products`} className="inline-flex bg-[var(--primary)] text-white px-12 py-5 text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-[var(--primary)]/20 rounded-2xl">
                استكشف المنتجات
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
              {items.map((item) => (
                <ElegantProductCard key={item.id} product={item} slug={slug} />
              ))}
            </div>
          )}
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
        <main className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif italic text-[#2B2B2B]">الباقات المفضلة</h1>
            <p className="text-zinc-500 font-medium">زهور لفتت انتباهك لتختار منها</p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-rose-50 shadow-sm mt-12">
              <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-[var(--primary)]" />
              </div>
              <p className="text-xl font-serif italic text-[#2B2B2B] mb-8">لم تقم بإضافة أي زهور للمفضلة بعد</p>
              <Link href={`/store/${slug}`} className="inline-flex items-center gap-2 text-sm font-bold bg-[var(--primary)] text-white px-10 py-4 rounded-full hover:bg-[var(--primary)]/90 transition-all duration-300">
                تصفح الباقات
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mt-12">
              {items.map((item) => (
                <FloralProductCard key={item.id} product={item} slug={slug} />
              ))}
            </div>
          )}
        </main>
        <FloralFooter store={store} branding={branding} />
      </div>
    )
  }

  // ─── THEME: DEFAULT ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 font-inter" dir="rtl" style={commonStyles}>
      <StoreHeader store={store} branding={branding} slug={slug} />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 mb-8 flex items-center gap-4">
          <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
          المفضلات
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-12 text-center shadow-xl shadow-zinc-200/50">
            <div className="h-24 w-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-zinc-300" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 mb-2">قائمة المفضلات فارغة</h2>
            <p className="text-zinc-500 font-bold mb-8">أضف المنتجات التي تهمك للعودة إليها لاحقاً</p>
            <Link
              href={`/store/${slug}#products`}
              className="inline-flex items-center gap-2 px-10 py-4 bg-zinc-900 text-white rounded-2xl font-black hover:bg-zinc-800 transition-all active:scale-95"
            >
              استكشف المنتجات
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <ProductCard key={item.id} product={item} slug={slug} />
            ))}
          </div>
        )}
      </main>
      <StoreFooter store={store} branding={branding} slug={slug} />
    </div>
  )
}
