import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, PackageX, Box, Tag, Archive, ShoppingBag } from 'lucide-react'
import ProductImage from './ProductImage'
import ProductActions from './ProductActions'
import ProductHeaderActions from './ProductHeaderActions'

export const metadata = {
  title: 'المنتجات | KayaMarket',
}

export default async function AdminProductsPage() {
  const supabase = await createClient()
  let storeId: string

  try {
    const authData = await assertMerchant(supabase)
    storeId = authData.storeId
  } catch (error) {
    redirect('/login')
  }

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  const { data: store } = await supabase
    .from('stores')
    .select('slug')
    .eq('id', storeId)
    .single()
    
  const storeSlug = store?.slug || null

  if (error) {
    return <div className="p-10 bg-rose-50 text-rose-600 rounded-[2rem] font-black border border-rose-100 shadow-sm">حدث خطأ أثناء تحميل المنتجات.</div>
  }

  return (
    <div className="space-y-10 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* ── Header Section ───────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <div className="h-8 md:h-10 w-1.5 bg-sky-500 rounded-full shrink-0" />
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">المنتجات</h2>
            {products && (
              <span className="bg-sky-50 text-sky-600 px-3 py-1 rounded-full text-sm font-bold font-inter border border-sky-100 shadow-sm">
                {products.length} منتج
              </span>
            )}
          </div>
          <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl leading-relaxed">
            إدارة وتنسيق معروضات متجرك بكل احترافية وسهولة.
          </p>
        </div>
        </div>
        <ProductHeaderActions />
      </div>
      
      {/* ── Precise Grid System (430px) ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(min(100%,430px),1fr))] gap-8 md:gap-12">
        {products && products.length > 0 ? (
          products.map((product) => {
            const isOutOfStock = product.stock !== null && product.stock <= 0
            
            return (
              <div key={product.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)] hover:border-sky-100 transition-all duration-700 group flex flex-col relative h-full">
                <div className="relative h-80 md:h-96 bg-slate-50 flex items-center justify-center overflow-hidden rounded-t-[3rem] border-b border-slate-50">
                  <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-1000 ease-out">
                    <ProductImage src={product.image_url} alt={product.name} />
                  </div>
                  <div className="absolute top-6 right-6 flex flex-col gap-2.5 z-20">
                    {!product.is_visible && (
                      <div className="bg-slate-900/90 backdrop-blur-xl text-white text-[11px] font-black px-4 py-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2">
                        <Archive className="h-4 w-4" /> مخفي
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="bg-rose-500/90 backdrop-blur-xl text-white text-[11px] font-black px-4 py-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2">
                        <PackageX className="h-4 w-4" /> نفدت الكمية
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-xl px-5 py-3 rounded-[1.5rem] border border-white shadow-lg z-20 flex items-baseline gap-1.5 transition-transform group-hover:-translate-y-1">
                    <span className="text-2xl font-black text-slate-900 font-poppins">{product.price.toLocaleString()}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">ج.م</span>
                  </div>
                </div>
                <div className="p-10 flex flex-col flex-1 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 text-[10px] font-black text-sky-500/60 uppercase tracking-[0.2em]">
                       <div className="h-1 w-4 bg-sky-500/20 rounded-full" />
                       <Tag className="h-3 w-3" /> تصنيف المنتج
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 font-inter line-clamp-1 group-hover:text-sky-600 transition-colors leading-tight">{product.name}</h3>
                    <p className="text-base font-bold text-slate-400 line-clamp-2 font-inter leading-relaxed min-h-[3rem]">{product.description || 'لا يوجد وصف مضاف لهذا المنتج.'}</p>
                  </div>
                  <div className="flex items-center gap-4 py-6 border-y border-slate-50/80">
                    <div className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border text-sm font-black transition-all ${isOutOfStock ? 'bg-rose-50/50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-100 group-hover:bg-sky-50'}`}>
                      <Box className="h-5 w-5" />
                      <span>المخزون: {product.stock !== null ? product.stock : '∞'}</span>
                    </div>
                  </div>
                  <div className="pt-2 mt-auto">
                    <ProductActions productId={product.id} storeSlug={storeSlug} />
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full py-40 flex flex-col items-center justify-center text-center bg-white rounded-[4rem] border border-slate-100 shadow-sm">
            <div className="h-28 w-28 bg-slate-50 text-slate-200 rounded-[3rem] flex items-center justify-center mb-10 border border-slate-50">
               <ShoppingBag className="h-14 w-14" strokeWidth={1} />
            </div>
            <h3 className="text-4xl font-black text-slate-900 font-poppins mb-4 tracking-tight">ابدأ رحلتك التجارية</h3>
            <p className="text-slate-400 font-bold max-w-md mx-auto mb-12 text-xl leading-relaxed">قائمة منتجاتك فارغة حالياً. أضف منتجاتك لتبدأ في عرضها لعملائك.</p>
            <Link href="/admin/products/new" className="flex items-center gap-4 bg-slate-900 text-white px-12 py-6 rounded-[2.5rem] text-xl font-black font-inter hover:bg-sky-600 transition-all shadow-2xl active:scale-95 group">
              <Plus className="h-7 w-7 group-hover:rotate-90 transition-transform duration-500" strokeWidth={3} />
              إضافة منتج جديد
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
