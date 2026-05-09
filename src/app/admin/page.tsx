import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ShoppingBag, DollarSign, Clock, AlertTriangle, PackageX, Package, ArrowUpRight, TrendingUp, Eye, Lock } from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats } from '@/app/actions/analytics'
import SalesChart from './SalesChart'
import TopProducts from './TopProducts'
import { getDynamicPlanConfigs, PlanTier } from '@/lib/subscription'

export const metadata = {
  title: 'لوحة التحكم | KayaMarket',
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

  // Fetch Fast Analytics Data
  const analytics = await getDashboardStats(14) // Last 14 days

  // Fetch store plan and products/orders for basic alerts
  const { data: storeData } = await supabase
    .from('stores')
    .select('plan')
    .eq('id', storeId)
    .single()

  const rawPlan = storeData?.plan || 'starter'
  const storePlan = (rawPlan === 'free' ? 'starter' : rawPlan) as PlanTier
  
  const allPlans = await getDynamicPlanConfigs(supabase)
  const currentPlanLimits = allPlans[storePlan]
  const hasAdvancedAnalytics = currentPlanLimits?.hasAdvancedAnalytics || false

  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)
    .eq('status', 'pending')

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, stock, image_url')
    .eq('store_id', storeId)

  if (productsError) {
    return (
      <div className="p-8 bg-rose-50 text-rose-600 rounded-2xl font-black flex items-center gap-4 border border-rose-100">
        <AlertTriangle className="h-6 w-6" />
        <p>حدث خطأ أثناء تحميل البيانات.</p>
      </div>
    )
  }

  const totalProducts = products.length
  const outOfStock = products.filter((p) => p.stock !== null && p.stock <= 0).length

  const stats = [
    { label: 'إجمالي الأرباح', value: `${analytics.kpis.revenue.toLocaleString()} ج.م`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'طوال الوقت' },
    { label: 'إجمالي الطلبات', value: analytics.kpis.orders, icon: ShoppingBag, color: 'text-sky-600', bg: 'bg-sky-50', sub: 'كل الطلبات الناجحة' },
    { label: 'زيارات المتجر', value: analytics.kpis.views, icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50', sub: 'عدد المشاهدات' },
    { label: 'قيد الانتظار', value: pendingOrders || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'تحتاج لمراجعتك' },
    { label: 'نفدت الكمية', value: outOfStock, icon: PackageX, color: 'text-rose-600', bg: 'bg-rose-50', sub: 'تحتاج لإعادة توريد' },
  ]

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* ── Header Section ───────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 text-right">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <div className="h-8 md:h-10 w-1.5 bg-sky-500 rounded-full shrink-0" />
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">نظرة عامة</h2>
          </div>
          <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl leading-relaxed">
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
      
      {/* ── Stats Grid (KPIs) ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 md:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div 
              key={idx} 
              className="flex-1 min-w-[140px] md:min-w-[200px] bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 hover:shadow-xl hover:border-sky-100 transition-all duration-500 group flex flex-col items-center justify-center text-center relative overflow-hidden"
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
                </div>
                <p className="text-[10px] md:text-[11px] font-bold text-slate-400 font-inter mt-3">{stat.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Inventory Alerts ───────────────────────────────────────────── */}
      {products.filter(p => p.stock !== null && p.stock < 5).length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
              <AlertTriangle className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div className="text-right">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">تنبيهات المخزون</h3>
              <p className="text-slate-500 font-bold text-xs mt-0.5">منتجات قاربت على نفاذ الكمية وتحتاج إلى إعادة توريد.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {products
              .filter(p => p.stock !== null && p.stock < 5)
              .sort((a, b) => (a.stock || 0) - (b.stock || 0))
              .map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-14 w-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-50">
                        <PackageX className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-black text-slate-900 truncate">{product.name}</span>
                    <span className={`text-[11px] font-bold mt-1 flex items-center gap-1.5 ${
                      product.stock === 0 ? 'text-rose-600' : 'text-amber-600'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${product.stock === 0 ? 'bg-rose-600' : 'bg-amber-500 animate-pulse'}`}></span>
                      {product.stock === 0 ? 'نفدت الكمية' : `متبقي ${product.stock} فقط`}
                    </span>
                  </div>
                </div>

                <Link 
                  href={`/admin/products/${product.id}/edit`}
                  className="shrink-0 px-4 py-2 bg-slate-50 hover:bg-slate-900 border border-slate-200 text-slate-700 hover:text-white text-xs font-black rounded-lg transition-all"
                >
                  تحديث
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Visual Analytics Section ─────────────────────────────────── */}
      {hasAdvancedAnalytics ? (

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
          <div className="xl:col-span-2">
            <SalesChart data={analytics.salesChart} />
          </div>
          <div className="xl:col-span-1">
            <TopProducts data={analytics.topProducts} />
          </div>
        </div>
      ) : (
        <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-50 w-full">
          {/* Blurred Placeholder */}
          <div className="absolute inset-0 opacity-40 blur-sm pointer-events-none grid grid-cols-1 xl:grid-cols-3 gap-8 p-8 grayscale">
            <div className="xl:col-span-2 h-64 bg-slate-200 rounded-xl" />
            <div className="xl:col-span-1 h-64 bg-slate-200 rounded-xl" />
          </div>
          
          {/* Lock Overlay */}
          <div className="relative z-10 flex flex-col items-center justify-center p-12 md:p-24 text-center w-full">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50">
              <Lock className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">التحليلات المتقدمة مقفلة</h3>
            <p className="text-slate-500 font-bold max-w-md mb-8 leading-relaxed">
              قم بترقية باقتك للوصول إلى تحليلات تفصيلية للمبيعات ومعرفة المنتجات الأكثر مبيعاً ورسم بياني لإيراداتك.
            </p>
            <Link 
              href="/admin/pricing"
              className="px-8 py-4 bg-slate-900 text-white rounded-xl font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              ترقية الباقة الآن
            </Link>
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
