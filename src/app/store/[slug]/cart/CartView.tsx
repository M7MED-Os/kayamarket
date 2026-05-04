'use client'

import { useCart } from '@/context/CartContext'
import StoreHeader from '@/components/StoreHeader'
import StoreFooter from '@/components/StoreFooter'
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ElegantHeader,
  ElegantFooter
} from '@/components/store/themes/ElegantTheme'
import {
  FloralHeader,
  FloralFooter
} from '@/components/store/themes/FloralTheme'

export default function CartView({ params, storeData }: { params: { slug: string }, storeData: any }) {
  const { slug } = params
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart()
  const router = useRouter()

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
        <main className="mx-auto max-w-5xl px-6 py-20">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">سلتك</span>
            <h1 className="text-4xl font-light text-zinc-900 tracking-tighter">مراجعة <span className="font-bold underline decoration-zinc-200 underline-offset-8">المشتريات</span></h1>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-32 border border-zinc-100 bg-zinc-50/50">
              <p className="text-lg font-light italic text-zinc-400 mb-8">سلتك فارغة حالياً</p>
              <Link href={`/store/${slug}`} className="text-xs font-black uppercase tracking-widest text-zinc-900 border border-zinc-900 px-10 py-4 hover:bg-zinc-900 hover:text-white transition-all duration-500">
                تصفح المنتجات
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 space-y-12">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-10 items-start pb-10 border-b border-zinc-100 group">
                    <div className="relative h-40 w-32 bg-zinc-50 border border-zinc-50 overflow-hidden lg:grayscale lg:group-hover:grayscale-0 transition-all duration-700">
                      {item.image_url && <img src={item.image_url} alt={item.name} className="h-full w-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />}
                    </div>
                    <div className="flex-1 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{item.name}</h3>
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-light text-zinc-900">{item.price.toLocaleString()} ج.م</div>
                            {(item as any).original_price && (item as any).original_price > item.price && (
                              <div className="text-xs font-light text-zinc-300 line-through italic">{(item as any).original_price.toLocaleString()} ج.م</div>
                            )}
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-zinc-200 hover:text-zinc-900 transition-colors">
                          <Trash2 className="h-4 w-4" strokeWidth={1} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center border border-zinc-100 p-1">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all active:scale-90"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-black w-8 text-center tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all active:scale-90"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-zinc-900 uppercase tracking-widest tabular-nums">
                          {(item.price * item.quantity).toLocaleString()} ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-zinc-50 p-10 space-y-8 sticky top-28">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">ملخص الطلب</h3>
                  <div className="flex justify-between items-end border-b border-zinc-200 pb-4">
                    <span className="text-xs font-bold text-zinc-400 uppercase">الإجمالي</span>
                    <span className="text-3xl font-light text-zinc-900 tracking-tighter">{totalPrice.toLocaleString()} ج.م</span>
                  </div>
                  <Link href={`/store/${slug}/checkout`} className="w-full h-16 bg-zinc-900 text-white flex items-center justify-center text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors shadow-lg">
                    إتمام الطلب
                  </Link>
                </div>
              </div>
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
        <main className="mx-auto max-w-5xl px-6 py-24">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif italic text-[#2B2B2B]">سلة المشتريات</h1>
            <p className="text-zinc-500 font-medium">نجهز لك باقاتك بكل حب وعناية</p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border border-rose-50 shadow-sm mt-12">
              <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-8 w-8 text-[var(--primary)]" />
              </div>
              <p className="text-xl font-serif italic text-[#2B2B2B] mb-8">سلتك فارغة حالياً</p>
              <Link href={`/store/${slug}`} className="inline-flex items-center gap-2 text-sm font-bold bg-[var(--primary)] text-white px-10 py-4 rounded-full hover:bg-[var(--primary)]/90 transition-all duration-300">
                تصفح الباقات
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-6 items-start p-6 bg-white rounded-[2rem] border border-rose-50 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="relative h-32 w-28 rounded-2xl bg-[#FAF3F0]/40 overflow-hidden shrink-0 border border-rose-50">
                      {item.image_url && <img src={item.image_url} alt={item.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-lg font-serif text-[#2B2B2B]">{item.name}</h3>
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-[var(--primary)]">{item.price.toLocaleString()} ج.م</div>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="h-10 w-10 flex items-center justify-center rounded-full bg-rose-50 text-rose-400 hover:text-white hover:bg-rose-500 transition-colors">
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center bg-[#FAF3F0]/60 rounded-full p-1 border border-rose-50">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-zinc-400 hover:text-[var(--primary)] shadow-sm transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold w-10 text-center text-[#2B2B2B]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-sm transition-colors hover:bg-[var(--primary)]/90"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-black text-[#2B2B2B]">
                          {(item.price * item.quantity).toLocaleString()} ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-[2rem] border border-rose-50 shadow-sm sticky top-32 space-y-8">
                  <h3 className="text-lg font-serif text-[#2B2B2B] pb-4 border-b border-rose-50">ملخص الطلب</h3>
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-zinc-500">الإجمالي</span>
                    <span className="text-3xl font-black text-[var(--primary)]">{totalPrice.toLocaleString()} ج.م</span>
                  </div>
                  <Link href={`/store/${slug}/checkout`} className="w-full h-14 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-[var(--primary)]/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                    إتمام الطلب
                  </Link>
                </div>
              </div>
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
              className="inline-flex items-center gap-2 px-10 py-4 bg-zinc-900 text-white rounded-2xl font-black hover:bg-zinc-800 transition-all active:scale-95"
            >
              العودة للمتجر
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl border border-zinc-100 p-6 flex gap-6 items-center shadow-sm hover:shadow-md transition-all">
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
                    {(item as any).description && (
                      <p className="text-xs text-zinc-400 font-bold mb-3 line-clamp-1">{(item as any).description}</p>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-sm font-black text-[var(--primary)]">{item.price.toLocaleString()} ج.م</p>
                      {(item as any).original_price && (item as any).original_price > item.price && (
                        <p className="text-[10px] text-zinc-300 line-through font-bold">{((item as any).original_price).toLocaleString()} ج.م</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-zinc-50 border border-zinc-100 rounded-2xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="h-9 w-9 flex items-center justify-center rounded-xl bg-white text-zinc-600 hover:text-zinc-900 shadow-sm transition-all active:scale-90"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-black text-zinc-900 tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl bg-white text-zinc-600 hover:text-zinc-900 shadow-sm transition-all active:scale-90"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-400 hover:text-rose-500 transition-all p-2 hover:scale-110 active:scale-95"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
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
                  className="w-full h-16 bg-zinc-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-zinc-800 shadow-xl shadow-zinc-200 transition-all active:scale-95"
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
      <StoreFooter store={store} branding={branding} slug={slug} />
    </div>
  )
}
