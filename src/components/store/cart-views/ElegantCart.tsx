'use client'

import React from 'react'
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { ElegantHeader, ElegantFooter } from '@/components/store/themes/ElegantTheme'
import { KayaBadge } from '@/components/store/KayaBadge'

interface CartViewProps {
  slug: string
  store: any
  branding: any
  items: any[]
  updateQuantity: (id: string, q: number) => void
  removeItem: (id: string) => void
  totalPrice: number
  showWatermark: boolean
  commonStyles: any
}

export default function ElegantCart({
  slug,
  store,
  branding,
  items,
  updateQuantity,
  removeItem,
  totalPrice,
  showWatermark,
  commonStyles
}: CartViewProps) {
  return (
    <div className="min-h-screen bg-white" dir="rtl" style={commonStyles}>
      <ElegantHeader store={store} branding={branding} slug={slug} />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <div className="h-px w-12 bg-[var(--primary)]/30 mb-2" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">سلتك</span>
          <h1 className="text-4xl md:text-5xl font-light text-zinc-900 tracking-tighter uppercase">مراجعة <span className="font-bold italic text-[var(--primary)]">المشتريات</span></h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-32 border border-zinc-100 bg-zinc-50/50 rounded-none">
            <div className="h-20 w-20 bg-white rounded-none flex items-center justify-center mx-auto mb-6 shadow-sm border border-zinc-50">
              <ShoppingBag className="h-8 w-8 text-zinc-200" />
            </div>
            <p className="text-lg font-light italic text-zinc-400 mb-8">سلتك فارغة حالياً</p>
            <Link href={`/store/${slug}`} className="text-[10px] font-black uppercase tracking-widest text-white bg-[var(--primary)] px-12 py-5 hover:brightness-125 transition-all duration-500 rounded-none">
              ابدأ التسوق الآن
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex gap-10 items-start pb-10 border-b border-zinc-100 group">
                  <div className="relative h-40 w-32 bg-zinc-50 border border-zinc-50 rounded-none overflow-hidden transition-all duration-700">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="h-full w-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />}
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest group-hover:text-[var(--primary)] transition-colors">{item.name}</h3>
                        <div className="flex flex-col gap-1">
                          <div className="text-lg font-bold text-[var(--primary)]">{item.price.toLocaleString()} ج.م</div>
                          {item.variant_info && (item.variant_info.color || item.variant_info.size) && (
                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex gap-2">
                              {item.variant_info.color && <span>اللون: {item.variant_info.color}</span>}
                              {item.variant_info.size && <span>المقاس: {item.variant_info.size}</span>}
                            </div>
                          )}
                          {item.original_price && item.original_price > item.price && (
                            <div className="text-xs font-light text-zinc-300 line-through italic">{item.original_price.toLocaleString()} ج.م</div>
                          )}
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.cartItemId)} className="text-[var(--primary)] hover:brightness-125 transition-colors">
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-4">
                      <div className="flex items-center border border-zinc-100 p-1 rounded-none bg-white">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                          className="h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-[var(--primary)] hover:bg-zinc-50 transition-all active:scale-90"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-black w-8 text-center tabular-nums text-zinc-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-[var(--primary)] hover:bg-zinc-50 transition-all active:scale-90"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-sm sm:text-base font-bold text-zinc-900 uppercase tracking-widest tabular-nums text-left">
                        {(item.price * item.quantity).toLocaleString()} ج.م
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-zinc-50 p-10 space-y-8 sticky top-28 rounded-none border border-zinc-100 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">ملخص الحساب</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-zinc-400">
                    <span>المنتجات ({items.reduce((acc: number, item: any) => acc + item.quantity, 0)})</span>
                    <span>{totalPrice.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-zinc-400">
                    <span>مصاريف الشحن</span>
                    <span className="text-[9px] italic">تحسب لاحقاً</span>
                  </div>
                  <div className="flex justify-between items-end border-t border-zinc-200 pt-6">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-900">الإجمالي المتوقع</span>
                    <span className="text-3xl font-bold text-[var(--primary)] tracking-tighter">{totalPrice.toLocaleString()} ج.م</span>
                  </div>
                </div>
                <Link href={`/store/${slug}/checkout`} className="w-full h-16 bg-[var(--primary)] text-white flex items-center justify-center text-xs font-black uppercase tracking-[0.2em] hover:brightness-125 transition-all shadow-lg rounded-none">
                  الاستمرار للدفع
                </Link>
                <p className="text-[9px] text-zinc-300 text-center font-bold uppercase tracking-wider">
                  * الشحن والخصومات تضاف في الخطوة التالية
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <ElegantFooter store={store} branding={branding} showWatermark={showWatermark} />
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
