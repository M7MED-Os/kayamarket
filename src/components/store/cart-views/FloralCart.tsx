'use client'

import React from 'react'
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { FloralHeader, FloralFooter } from '@/components/store/themes/FloralTheme'
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

export default function FloralCart({
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
    <div className="min-h-screen bg-[#FAF3F0]/20" dir="rtl" style={commonStyles}>
      <FloralHeader store={store} branding={branding} slug={slug} />
      <main className="mx-auto max-w-5xl px-6 py-24">
        <div className="flex justify-center mb-6">
          {branding?.logo_url ? (
            <img src={branding.logo_url} alt={store.name} className="h-10 w-auto object-contain opacity-80" />
          ) : (
            <span className="text-xs font-black text-[var(--primary)] uppercase tracking-[0.3em] opacity-70">{store.name}</span>
          )}
        </div>

        <div className="mb-16 flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
           <div className="flex items-center gap-4 w-full max-w-xs justify-center">
              <div className="h-px flex-1 bg-gradient-to-l from-[var(--primary)]/30 to-transparent" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--primary)] whitespace-nowrap">
                 نجهز طلبك بكل حب وعناية
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-[var(--primary)]/30 to-transparent" />
           </div>
           <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight text-zinc-900">سلة المشتريات</h2>
           <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-[var(--primary)] to-transparent mx-auto" />
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-[var(--primary)]/10 shadow-sm mt-12">
            <div className="h-20 w-20 bg-[var(--primary)]/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-8 w-8 text-[var(--primary)]" />
            </div>
            <p className="text-xl font-sans font-bold text-[#2B2B2B] mb-8">سلتك فارغة حالياً</p>
            <Link href={`/store/${slug}`} className="inline-flex items-center gap-2 text-sm font-bold bg-[var(--primary)] text-white px-10 py-4 rounded-full hover:bg-[var(--primary)]/90 transition-all duration-300">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex gap-4 md:gap-6 items-center p-4 md:p-5 bg-white rounded-[2rem] border border-[var(--primary)]/10 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                  <div className="relative h-20 w-20 md:h-28 md:w-28 rounded-[1.2rem] bg-[#FAF3F0]/40 overflow-hidden shrink-0 border border-[var(--primary)]/10 shadow-inner">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />}
                  </div>
                  <div className="flex-1 space-y-3 min-w-0 py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-right space-y-0.5">
                        <h3 className="text-sm md:text-lg font-sans font-black text-[#2B2B2B] truncate leading-tight">{item.name}</h3>
                        <div className="text-xs md:text-sm font-bold text-[var(--primary)]/60">{item.price.toLocaleString()} ج.م</div>
                        {item.variant_info && (item.variant_info.color || item.variant_info.size) && (
                          <div className="text-[9px] font-bold text-[var(--primary)] opacity-60 uppercase tracking-wider flex gap-2">
                            {item.variant_info.color && <span>{item.variant_info.color}</span>}
                            {item.variant_info.size && <span>{item.variant_info.size}</span>}
                          </div>
                        )}
                      </div>
                       <button onClick={() => removeItem(item.cartItemId)} className="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--primary)]/5 text-[var(--primary)]/30 hover:text-white hover:bg-rose-500 transition-all duration-300 shrink-0">
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center bg-[#FAF3F0]/60 rounded-xl p-0.5 md:p-1 border border-[var(--primary)]/5">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                          className="h-6 w-6 md:h-7 md:w-7 flex items-center justify-center rounded-lg bg-white text-zinc-400 hover:text-[var(--primary)] shadow-sm transition-all"
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </button>
                        <span className="text-xs md:text-sm font-bold w-6 md:w-8 text-center text-[#2B2B2B]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="h-6 w-6 md:h-7 md:w-7 flex items-center justify-center rounded-lg bg-[var(--primary)] text-white shadow-sm transition-all hover:scale-105"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      </div>
                      <div className="text-left shrink-0">
                        <div className="text-[9px] font-bold text-[var(--primary)]/40 uppercase tracking-wider">المجموع</div>
                        <div className="text-base md:text-xl font-black text-[var(--primary)] leading-none">
                           {(item.price * item.quantity).toLocaleString()} <span className="text-[9px] md:text-[10px] opacity-60">ج.م</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-[var(--primary)]/10 shadow-sm sticky top-32 space-y-6 md:space-y-8">
                <h3 className="text-lg font-sans font-bold text-[#2B2B2B] pb-4 border-b border-[var(--primary)]/5">ملخص الحساب</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-zinc-400">إجمالي المنتجات ({items.reduce((acc: number, item: any) => acc + item.quantity, 0)} قطعة)</span>
                    <span className="text-[#2B2B2B]">{totalPrice.toLocaleString()} ج.م</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-zinc-400">مصاريف الشحن</span>
                    <span className="text-rose-300 text-[10px]">تحدد في الخطوة التالية</span>
                  </div>

                  <div className="pt-6 border-t border-[var(--primary)]/10 flex justify-between items-center">
                    <span className="text-lg font-black text-[#2B2B2B]">الإجمالي المتوقع</span>
                    <span className="text-2xl font-black text-[var(--primary)]">{totalPrice.toLocaleString()} ج.م</span>
                  </div>
                </div>
                <Link href={`/store/${slug}/checkout`} className="w-full h-16 bg-[var(--primary)] text-white rounded-3xl flex items-center justify-center text-base font-black hover:brightness-110 transition-all shadow-xl shadow-[var(--primary)]/20 active:scale-95">
                  الاستمرار لتأكيد الطلب
                </Link>
                <p className="text-[10px] text-zinc-400 text-center font-bold">
                  * سيتم إضافة مصاريف الشحن وتطبيق الكوبونات في الخطوة التالية.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <FloralFooter store={store} branding={branding} showWatermark={showWatermark} />
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
