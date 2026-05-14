'use client'

import React from 'react'
import { Heart, ShoppingBag, Trash2, ArrowRight, Leaf, Star } from 'lucide-react'
import Link from 'next/link'
import { OrganicHeader, OrganicFooter } from '../themes/OrganicTheme'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import toast from 'react-hot-toast'

export default function OrganicWishlist({ store, branding, slug, showWatermark, commonStyles }: any) {
  const { items: wishlist, toggleItem } = useWishlist()
  const { addItem } = useCart()

  const primaryColor = branding?.primary_color || '#4A6741'
  const finalStyles = { ...commonStyles, '--primary': primaryColor, fontFamily: branding?.font_family || 'Outfit, Cairo, sans-serif' }

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      cartItemId: `${product.id}-none-none`,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
      variant_info: {}
    })
    toast.success('تمت الإضافة للسلة')
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2]" dir="rtl" style={finalStyles}>
      <OrganicHeader store={store} branding={branding} slug={slug} />

      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-14 space-y-3">
            <div className="h-14 w-14 bg-rose-50 rounded-[1.5rem] rotate-6 flex items-center justify-center text-rose-400 shadow-sm">
              <Heart className="h-7 w-7 fill-current" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight">
              <span className="italic text-[var(--primary)] font-serif">المفضلة</span>
            </h1>
            <p className="text-zinc-500 font-medium">
              {wishlist.length > 0 ? `${wishlist.length} منتج محفوظ` : 'المنتجات التي أعجبتك في مكان واحد'}
            </p>
          </div>

          {wishlist.length > 0 ? (
            <>
              <div className="space-y-4 mb-16">
                {wishlist.map((product) => (
                  <div key={product.id}
                    className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-md hover:border-[var(--primary)]/20 transition-all duration-300 group overflow-hidden">
                    <div className="flex items-center">
                      {/* Image */}
                      <Link href={`/store/${slug}/products/${product.slug || product.id}`}
                        className="h-32 w-32 sm:h-36 sm:w-36 flex-shrink-0 overflow-hidden bg-zinc-50">
                        <img src={product.image_url} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0 px-6 py-4">
                        <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Leaf className="h-2.5 w-2.5" /> عضوي
                        </p>
                        <Link href={`/store/${slug}/products/${product.slug || product.id}`}>
                          <h3 className="font-black text-zinc-900 text-lg hover:text-[var(--primary)] transition-colors line-clamp-1">{product.name}</h3>
                        </Link>
                        <div className="flex items-center gap-1 mt-1.5 mb-3">
                          {[1,2,3,4,5].map(s => <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                        </div>
                        <p className="text-xl font-black text-[var(--primary)]">{product.price.toLocaleString()} ج.م</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 px-5 py-4 border-r border-zinc-50 flex-shrink-0">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex items-center gap-2 px-5 py-3 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-wide hover:bg-[var(--primary)] active:scale-95 transition-all shadow-sm whitespace-nowrap">
                          <ShoppingBag className="h-4 w-4" />
                          <span className="hidden sm:block">أضف للسلة</span>
                        </button>
                        <button
                          onClick={() => toggleItem(product)}
                          aria-label="إزالة من المفضلة"
                          className="h-10 w-10 bg-rose-50 text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
                <div>
                  <p className="font-black text-zinc-900">{wishlist.length} منتج في قائمة الأمنيات</p>
                  <p className="text-sm text-zinc-400 font-medium">يمكنك إضافتها للسلة في أي وقت</p>
                </div>
                <Link href={`/store/${slug}/products`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[var(--primary)] active:scale-95 transition-all shadow-lg">
                  <ArrowRight className="h-4 w-4 rotate-180" /> اكتشف المزيد
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 bg-white rounded-[3rem] border border-zinc-100 shadow-sm max-w-lg mx-auto">
              <div className="relative">
                <div className="h-32 w-32 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-200 mx-auto">
                  <Heart className="h-16 w-16" />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white">
                  <Leaf className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-2 px-8">
                <h3 className="text-2xl font-black text-zinc-900">المفضلة فارغة</h3>
                <p className="text-zinc-500 font-medium text-sm leading-relaxed">
                  احفظ المنتجات التي أعجبتك بالضغط على قلب المنتج وستجدها هنا.
                </p>
              </div>
              <Link href={`/store/${slug}/products`}
                className="px-10 py-5 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[var(--primary)] active:scale-95 transition-all shadow-xl">
                اكتشف المنتجات
              </Link>
            </div>
          )}
        </div>
      </main>

      <OrganicFooter store={store} branding={branding} slug={slug} showWatermark={showWatermark} />
    </div>
  )
}
