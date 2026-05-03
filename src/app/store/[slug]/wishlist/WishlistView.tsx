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
          <div className="text-center mb-16 space-y-4">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">قائمتك</span>
             <h1 className="text-4xl font-light text-zinc-900 tracking-tighter">المنتجات <span className="font-bold underline decoration-zinc-200 underline-offset-8">المفضلة</span></h1>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-32 border border-zinc-100 bg-zinc-50/50">
              <p className="text-lg font-light italic text-zinc-400 mb-8">قائمة المفضلات فارغة</p>
              <Link href={`/store/${slug}`} className="text-xs font-black uppercase tracking-widest text-zinc-900 border border-zinc-900 px-10 py-4 hover:bg-zinc-900 hover:text-white transition-all duration-500">
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
