'use client'

import { useWishlist } from '@/context/WishlistContext'
import StoreHeader from '@/components/StoreHeader'
import { Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import ProductCard from '@/components/product/ProductCard'

export default function WishlistView({ params, storeData }: { params: { slug: string }, storeData: any }) {
  const { slug } = params
  const { items } = useWishlist()

  if (!storeData?.store) return <div className="min-h-screen flex items-center justify-center font-black text-2xl">المتجر غير موجود</div>

  const { store, branding } = storeData
  const primaryColor = branding?.primary_color || '#e11d48'

  return (
    <div className="min-h-screen bg-zinc-50 font-inter" dir="rtl" style={{ '--primary': primaryColor } as any}>
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
    </div>
  )
}
