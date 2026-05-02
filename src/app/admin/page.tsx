import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ShoppingBag, DollarSign, Clock, AlertTriangle, PackageX, Package, ArrowUpRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Dashboard | KayaMarket',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  let storeId: string

  try {
    const authData = await assertMerchant(supabase)
    storeId = authData.storeId
  } catch (error) {
    redirect('/login')
  }

  // Fetch orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('status, final_price')
    .eq('store_id', storeId)

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, stock, image_url')
    .eq('store_id', storeId)

  if (error || productsError) {
    return (
      <div className="p-8 bg-rose-50 text-rose-600 rounded-2xl font-black flex items-center gap-4 border border-rose-100">
        <AlertTriangle className="h-6 w-6" />
        <p>حدث خطأ أثناء تحميل البيانات.</p>
      </div>
    )
  }

  const totalOrders = orders.length
  const totalRevenue = orders
    .filter((o) => o.status === 'delivered' || o.status === 'confirmed')
    .reduce((sum, order) => sum + (Number(order.final_price) || 0), 0)
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const totalProducts = products.length
  const outOfStock = products.filter((p) => p.stock !== null && p.stock <= 0).length

  const stats = [
    { label: 'إجمالي الأرباح', value: `${totalRevenue.toLocaleString()} ج.م`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12%', sub: 'من الشهر الماضي' },
    { label: 'إجمالي الطلبات', value: totalOrders, icon: ShoppingBag, color: 'text-sky-600', bg: 'bg-sky-50', sub: 'كل الطلبات' },
    { label: 'قيد الانتظار', value: pendingOrders, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'تحتاج لمراجعتك' },
    { label: 'المنتجات', value: totalProducts, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: 'في متجرك' },
    { label: 'نفدت الكمية', value: outOfStock, icon: PackageX, color: 'text-rose-600', bg: 'bg-rose-50', sub: 'تحتاج لإعادة توريد' },
  ]

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── Header Section ───────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 text-right">
        <div className="space-y-2">
          <div className="flex items-center gap-4 mb-1 justify-start">
            <div className="h-8 md:h-12 w-1.5 bg-sky-500 rounded-full" />
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 font-poppins tracking-tighter">نظرة عامة</h2>
          </div>
          <p className="text-slate-400 font-inter text-sm md:text-lg max-w-2xl font-bold leading-relaxed">
            تابع أداء متجرك، نمو مبيعاتك، وإدارة مخزونك بكل سهولة.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <Link href="/admin/products/new" className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-sky-500 text-white rounded-[1.5rem] text-base font-black hover:bg-sky-600 transition-all shadow-xl shadow-sky-500/20 active:scale-95 group">
            <PlusIcon className="h-5 w-5" />
            إضافة منتج جديد
          </Link>
          <Link href="/admin/orders" className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-[1.5rem] text-base font-black hover:bg-slate-50 hover:border-slate-900 transition-all shadow-sm active:scale-95">
            إدارة الطلبات
          </Link>
        </div>
      </div>
      
      {/* ── Stats Grid (More Compact) ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 md:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div 
              key={idx} 
              className="flex-1 min-w-[160px] md:min-w-[220px] bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-xl hover:border-sky-100 transition-all duration-500 group flex flex-col items-center justify-center text-center relative overflow-hidden"
            >
              <div className={`h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center shrink-0 mb-4 md:mb-5 ${stat.bg} ${stat.color} transition-all duration-500 group-hover:scale-110 shadow-sm shadow-inner`}>
                <Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={2.5} />
              </div>

              <div className="space-y-1 w-full">
                <p className="text-[10px] md:text-[11px] font-black text-slate-300 font-inter uppercase tracking-widest">{stat.label}</p>
                <div className="flex flex-col items-center gap-1">
                  <p className="font-black text-slate-900 font-poppins tracking-tighter text-2xl md:text-3xl">
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <span className="text-emerald-500 text-[9px] font-black bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{stat.trend}</span>
                  )}
                </div>
                <p className="text-[10px] md:text-[11px] font-bold text-slate-400 font-inter mt-3">{stat.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Inventory Alerts ───────────────────────────────────────────── */}
      {products.filter(p => p.stock !== null && p.stock < 5).length > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <AlertTriangle className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="text-right">
                <h3 className="text-lg md:text-xl font-black text-slate-900 font-poppins tracking-tight">تنبيهات المخزون</h3>
                <p className="text-slate-400 font-bold text-[10px] md:text-xs">منتجات قاربت على نفاذ الكمية.</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-inter">المنتج</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-inter">الحالة</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest font-inter text-left">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products
                  .filter(p => p.stock !== null && p.stock < 5)
                  .sort((a, b) => (a.stock || 0) - (b.stock || 0))
                  .map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <PackageX className="h-5 w-5 text-slate-200" />
                          )}
                        </div>
                        <p className="text-sm md:text-base font-black text-slate-900 font-inter group-hover:text-sky-600 transition-colors leading-tight">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black font-inter ${
                        product.stock === 0 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {product.stock === 0 ? 'نفد' : `متبقي ${product.stock}`}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-left">
                      <Link 
                        href={`/admin/products/${product.id}/edit`}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-900 text-[10px] font-black rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                      >
                        تحديث
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
