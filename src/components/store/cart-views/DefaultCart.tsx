'use client'

import React from 'react'
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, CreditCard } from 'lucide-react'
import Link from 'next/link'
import StoreHeader from '@/components/StoreHeader'
import StoreFooter from '@/components/StoreFooter'
import { KayaBadge } from '@/components/store/KayaBadge'

interface CartViewProps {
  slug: string
  store: any
  branding: any
  items: any[]
  updateQuantity: (id: string, q: number) => void
  removeItem: (id: string) => void
  totalPrice: number
  totalItems: number
  showWatermark: boolean
  commonStyles: any
}

export default function DefaultCart({
  slug,
  store,
  branding,
  items,
  updateQuantity,
  removeItem,
  totalPrice,
  totalItems,
  showWatermark,
  commonStyles
}: CartViewProps) {
  return (
    <div className="min-h-screen bg-zinc-50 font-inter" dir="rtl" style={commonStyles}>
      <StoreHeader store={store} branding={branding} slug={slug} />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 mb-8 flex items-center gap-4">
          <ShoppingBag className="h-8 w-8 text-[var(--primary)]" />
          سلة المشتريات
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-12 text-center shadow-xl shadow-zinc-200/50">
            <div className="h-24 w-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-zinc-300" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 mb-2">السلة فارغة حالياً</h2>
            <p className="text-zinc-500 font-bold mb-8">ابدأ بإضافة المنتجات التي تعجبك للسلة</p>
            <Link
              href={`/store/${slug}#products`}
              className="inline-flex items-center gap-2 px-10 py-4 bg-[var(--primary)] text-white rounded-2xl font-black hover:brightness-110 transition-all active:scale-95"
            >
              العودة للمتجر
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.cartItemId} className="bg-white rounded-3xl border border-zinc-100 p-6 flex gap-6 items-center shadow-sm hover:shadow-md transition-all">
                  <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-zinc-50 bg-zinc-50 shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-zinc-200">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <h3 className="text-lg font-black text-zinc-900 truncate mb-0.5">{item.name}</h3>
                    <div className="flex flex-col gap-1 mb-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-[var(--primary)]">{item.price.toLocaleString()} ج.م</p>
                        {item.original_price && item.original_price > item.price && (
                          <p className="text-[10px] text-zinc-300 line-through font-bold">{item.original_price.toLocaleString()} ج.م</p>
                        )}
                      </div>
                      {item.variant_info && (item.variant_info.color || item.variant_info.size) && (
                        <div className="flex gap-2 text-[10px] font-bold text-zinc-400">
                          {item.variant_info.color && <span className="bg-zinc-50 px-2 py-0.5 rounded">اللون: {item.variant_info.color}</span>}
                          {item.variant_info.size && <span className="bg-zinc-50 px-2 py-0.5 rounded">المقاس: {item.variant_info.size}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-zinc-50 border border-zinc-100 rounded-2xl p-1">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                          className="h-9 w-9 flex items-center justify-center rounded-xl bg-white text-zinc-600 hover:text-zinc-900 shadow-sm transition-all active:scale-90"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-black text-zinc-900 tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl bg-white text-zinc-600 hover:text-zinc-900 shadow-sm transition-all active:scale-90"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="text-zinc-400 hover:text-rose-500 transition-all p-2 hover:scale-110 active:scale-95"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-xl shadow-zinc-200/50 sticky top-28">
                <h3 className="text-xl font-black text-zinc-900 mb-6 text-right">ملخص الطلب</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-zinc-500 font-bold">
                    <span>عدد المنتجات</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="h-px bg-zinc-50" />
                  <div className="flex justify-between text-xl font-black text-zinc-900">
                    <span>الإجمالي</span>
                    <span className="text-[var(--primary)]">{totalPrice.toLocaleString()} ج.م</span>
                  </div>
                </div>
                <Link
                  href={`/store/${slug}/checkout`}
                  className="w-full h-16 bg-[var(--primary)] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:brightness-110 shadow-xl shadow-[var(--primary)]/20 transition-all active:scale-95"
                >
                  <CreditCard className="h-6 w-6" />
                  إتمام الطلب
                </Link>
                <p className="text-center text-xs text-zinc-400 mt-6 font-bold">
                  سيتم إضافة تفاصيل الشحن في الخطوة التالية
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <StoreFooter store={store} branding={branding} slug={slug} showWatermark={showWatermark} />
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
