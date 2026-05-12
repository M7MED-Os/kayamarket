'use client'

import React, { useState } from 'react'
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, ShieldCheck, Leaf, Tag, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { OrganicHeader, OrganicFooter } from '../themes/OrganicTheme'
import { useCart } from '@/context/CartContext'

export default function OrganicCart({ store, branding, slug, showWatermark, commonStyles }: any) {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()
  const [coupon, setCoupon] = useState('')
  const [couponOpen, setCouponOpen] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const primaryColor = branding?.primary_color || '#4A6741'
  const finalStyles = { ...commonStyles, '--primary': primaryColor, fontFamily: branding?.font_family || 'Outfit, Cairo, sans-serif' }

  const handleRemove = (cartItemId: string) => {
    setRemoving(cartItemId)
    setTimeout(() => { removeItem(cartItemId); setRemoving(null) }, 300)
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2]" dir="rtl" style={finalStyles}>
      <OrganicHeader store={store} branding={branding} slug={slug} />

      <main className="pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-14 space-y-3">
            <div className="h-14 w-14 bg-[var(--primary)]/10 rounded-[1.5rem] rotate-6 flex items-center justify-center text-[var(--primary)] shadow-sm">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight">
              حقيبة <span className="italic text-[var(--primary)] font-serif">التسوق</span>
            </h1>
            {items.length > 0 && (
              <p className="text-zinc-500 font-medium">{items.length} منتج في سلتك</p>
            )}
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.cartItemId}
                    className={`bg-white rounded-[2rem] p-5 border border-zinc-100 shadow-sm transition-all duration-300
                      ${removing === item.cartItemId ? 'opacity-0 scale-95 -translate-x-4' : 'opacity-100 scale-100'}`}
                  >
                    <div className="flex items-center gap-5">
                      {/* Image */}
                      <Link href={`/store/${slug}/products/${item.id}`}
                        className="h-24 w-24 rounded-2xl overflow-hidden bg-zinc-50 flex-shrink-0 group">
                        <img src={item.image_url} alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-0.5 flex items-center gap-1">
                          <Leaf className="h-2.5 w-2.5" /> عضوي
                        </p>
                        <Link href={`/store/${slug}/products/${item.id}`}>
                          <h3 className="font-black text-zinc-900 hover:text-[var(--primary)] transition-colors truncate text-base">{item.name}</h3>
                        </Link>
                        {item.variant_info?.color && (
                          <p className="text-xs text-zinc-400 font-medium mt-0.5">{item.variant_info.color}</p>
                        )}
                        <p className="text-lg font-black text-[var(--primary)] mt-1.5">{item.price.toLocaleString()} ج.م</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
                        {/* Qty */}
                        <div className="flex items-center gap-1 bg-zinc-50 rounded-xl p-1 border border-zinc-100">
                          <button onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                            aria-label="تقليل" className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-zinc-500 hover:text-[var(--primary)] hover:shadow-sm transition-all">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-black text-zinc-900">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            aria-label="زيادة" className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-zinc-500 hover:text-[var(--primary)] hover:shadow-sm transition-all">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Delete */}
                        <button onClick={() => handleRemove(item.cartItemId)} aria-label="حذف"
                          className="h-10 w-10 bg-rose-50 text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all group">
                          <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {/* Item subtotal */}
                    <div className="mt-3 pt-3 border-t border-zinc-50 flex justify-between items-center">
                      <span className="text-xs text-zinc-400 font-medium">المجموع الفرعي</span>
                      <span className="font-black text-zinc-700 text-sm">{(item.price * item.quantity).toLocaleString()} ج.م</span>
                    </div>
                  </div>
                ))}

                <Link href={`/store/${slug}/products`}
                  className="inline-flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-[var(--primary)] transition-colors pt-2">
                  <ArrowRight className="h-4 w-4" /> الاستمرار في التسوق
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-48 h-48 bg-[var(--primary)]/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                  <div className="relative z-10">
                    <h2 className="text-xl font-black mb-8">ملخص الطلب</h2>

                    <div className="space-y-4">
                      <div className="flex justify-between text-zinc-400 font-medium text-sm">
                        <span>المجموع الفرعي</span>
                        <span className="font-black text-white">{totalPrice.toLocaleString()} ج.م</span>
                      </div>
                      <div className="flex justify-between text-zinc-400 font-medium text-sm">
                        <span>الشحن</span>
                        <span className="font-black text-emerald-400 text-xs uppercase tracking-wide">مجاني</span>
                      </div>

                      {/* Coupon */}
                      <div>
                        <button onClick={() => setCouponOpen(!couponOpen)}
                          className="flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-white transition-colors">
                          <Tag className="h-3.5 w-3.5" />
                          {couponOpen ? 'إلغاء' : 'لديك كوبون خصم؟'}
                        </button>
                        {couponOpen && (
                          <div className="mt-3 flex gap-2">
                            <input value={coupon} onChange={e => setCoupon(e.target.value)}
                              placeholder="كود الخصم"
                              className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-[var(--primary)]/50"
                            />
                            <button className="px-4 py-2.5 bg-[var(--primary)] rounded-xl text-xs font-black hover:bg-[var(--primary)]/80 transition-colors">
                              تطبيق
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="h-px bg-white/10" />
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">الإجمالي</span>
                        <span className="text-3xl font-black">{totalPrice.toLocaleString()} <span className="text-sm text-zinc-400">ج.م</span></span>
                      </div>
                    </div>

                    <Link href={`/store/${slug}/checkout`}
                      className="mt-8 flex w-full items-center justify-center gap-3 py-4 bg-[var(--primary)] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[var(--primary)]/90 active:scale-95 transition-all shadow-xl shadow-[var(--primary)]/20">
                      إتمام الشراء
                      <ChevronLeft className="h-5 w-5" />
                    </Link>
                  </div>
                </div>

                {/* Trust */}
                <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm space-y-4">
                  {[
                    { Icon: ShieldCheck, label: 'دفع آمن ومشفّر', sub: 'بياناتك محمية بالكامل' },
                    { Icon: Leaf, label: 'منتجات عضوية مضمونة', sub: 'جودة عالية في كل طلب' },
                  ].map(({ Icon, label, sub }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-[var(--primary)]/8 rounded-xl flex items-center justify-center text-[var(--primary)] flex-shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-zinc-900">{label}</p>
                        <p className="text-[10px] text-zinc-400 font-medium">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 bg-white rounded-[3rem] border border-zinc-100 shadow-sm max-w-lg mx-auto">
              <div className="h-28 w-28 bg-zinc-50 rounded-[2.5rem] flex items-center justify-center text-zinc-200">
                <ShoppingBag className="h-14 w-14" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-zinc-900">السلة فارغة</h3>
                <p className="text-zinc-500 font-medium text-sm">ابدأ بإضافة منتجاتك الطبيعية المفضلة.</p>
              </div>
              <Link href={`/store/${slug}/products`}
                className="px-10 py-5 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[var(--primary)] active:scale-95 transition-all shadow-xl">
                تصفح المنتجات
              </Link>
            </div>
          )}
        </div>
      </main>

      <OrganicFooter store={store} branding={branding} slug={slug} showWatermark={showWatermark} />
    </div>
  )
}
