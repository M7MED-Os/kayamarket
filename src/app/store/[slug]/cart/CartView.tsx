'use client'

import { useCart } from '@/context/CartContext'
import StoreHeader from '@/components/StoreHeader'
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CartView({ params, storeData }: { params: { slug: string }, storeData: any }) {
  const { slug } = params
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart()
  const router = useRouter()

  if (!storeData?.store) return <div className="min-h-screen flex items-center justify-center font-black text-2xl">المتجر غير موجود</div>

  const { store, branding } = storeData
  const primaryColor = branding?.primary_color || '#e11d48'

  return (
    <div className="min-h-screen bg-zinc-50 font-inter" dir="rtl" style={{ '--primary': primaryColor } as any}>
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
                    {item.description && (
                      <p className="text-xs text-zinc-400 font-bold mb-3 line-clamp-1">{item.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-sm font-black text-[var(--primary)]">{item.price.toLocaleString()} ج.م</p>
                      {item.original_price && item.original_price > item.price && (
                        <p className="text-[10px] text-zinc-300 line-through font-bold">{(item.original_price).toLocaleString()} ج.م</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-zinc-50 border border-zinc-100 rounded-xl p-0.5">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg bg-white text-zinc-600 hover:text-primary-600 shadow-sm transition-all active:scale-90"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-black text-zinc-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg bg-white text-zinc-600 hover:text-primary-600 shadow-sm transition-all active:scale-90"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-2"
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
    </div>
  )
}
