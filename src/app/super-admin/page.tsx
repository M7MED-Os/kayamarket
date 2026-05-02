import { createAdminClient } from '@/lib/supabase/server'
import { 
  Users, Store, ShoppingBag, 
  TrendingUp, CreditCard, Clock,
  ChevronRight, ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

export default async function SuperAdminDashboard() {
  const admin = createAdminClient()

  // Fetch High-Level Stats (Using Admin Client to bypass RLS)
  const { count: totalStores } = await admin.from('stores').select('*', { count: 'exact', head: true })
  const { count: totalProducts } = await admin.from('products').select('*', { count: 'exact', head: true })
  const { count: totalOrders } = await admin.from('orders').select('*', { count: 'exact', head: true })
  
  const { count: starterCount } = await admin.from('stores').select('*', { count: 'exact', head: true }).or('plan.eq.starter,plan.eq.free,plan.is.null')
  const { count: growthCount } = await admin.from('stores').select('*', { count: 'exact', head: true }).eq('plan', 'growth')
  const { count: proCount } = await admin.from('stores').select('*', { count: 'exact', head: true }).eq('plan', 'pro')
  const { count: pendingUpgrades } = await admin.from('plan_upgrade_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')

  const stats = [
    { label: 'إجمالي المتاجر', value: totalStores || 0, icon: Store, color: 'text-blue-600', bg: 'bg-blue-50', link: '/super-admin/merchants' },
    { label: 'طلبات الترقية', value: pendingUpgrades || 0, icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50', link: '/super-admin/upgrade-requests' },
    { label: 'إجمالي المنتجات', value: totalProducts || 0, icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'إجمالي الطلبات', value: totalOrders || 0, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">نظرة عامة على المنصة</h1>
           <p className="text-slate-500 font-bold">أهلاً بك في غرفة القيادة. إليك ملخص لأداء كايا ماركت اليوم.</p>
        </div>
        <div className="h-14 px-6 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 shadow-sm">
           <Clock className="h-5 w-5 text-slate-400" />
           <span className="text-sm font-black text-slate-600">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const CardContent = (
            <div key={stat.label} className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group h-full">
               <div className="flex items-center justify-between mb-6">
                  <div className={`h-14 w-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                     <stat.icon className="h-7 w-7" />
                  </div>
                  <div className="bg-slate-50 px-3 py-1 rounded-full flex items-center gap-1">
                     <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                     <span className="text-[10px] font-black text-emerald-600">+12%</span>
                  </div>
               </div>
               <h3 className="text-slate-500 text-sm font-black mb-1">{stat.label}</h3>
               <p className="text-3xl font-black text-slate-900">{stat.value.toLocaleString()}</p>
            </div>
          )

          return stat.link ? (
            <Link key={stat.label} href={stat.link}>{CardContent}</Link>
          ) : (
            <div key={stat.label}>{CardContent}</div>
          )
        })}
      </div>

      {/* Plan Distribution & Recent Stores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-10">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-xl font-black text-slate-900">توزيع المتاجر حسب الخطط</h3>
               <Link href="/super-admin/merchants" className="text-sm font-black text-indigo-600 hover:underline">عرض كل المتاجر</Link>
            </div>
            
            <div className="space-y-6">
               {[
                 { label: 'الباقة المجانية (Starter)', count: starterCount, color: 'bg-slate-100', text: 'text-slate-600', width: (starterCount || 0) / (totalStores || 1) * 100 },
                 { label: 'باقة النمو (Growth)', count: growthCount, color: 'bg-indigo-100', text: 'text-indigo-600', width: (growthCount || 0) / (totalStores || 1) * 100 },
                 { label: 'الباقة الاحترافية (Pro)', count: proCount, color: 'bg-amber-100', text: 'text-amber-600', width: (proCount || 0) / (totalStores || 1) * 100 },
               ].map(plan => (
                 <div key={plan.label} className="space-y-3">
                    <div className="flex items-center justify-between text-sm font-black">
                       <span className={plan.text}>{plan.label}</span>
                       <span className="text-slate-900">{plan.count} متجر</span>
                    </div>
                    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                       <div className={`h-full ${plan.color} rounded-full transition-all duration-1000`} style={{ width: `${plan.width}%` }} />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
            <div className="relative z-10">
               <h3 className="text-xl font-black mb-4">إجمالي الإيرادات المتوقع</h3>
               <p className="text-sm text-slate-400 font-bold mb-10">بناءً على المشتركين الحاليين في الباقات المدفوعة.</p>
               
               <div className="mb-10">
                  <span className="text-5xl font-black tracking-tight">{(growthCount || 0) * 300 + (proCount || 0) * 500}</span>
                  <span className="text-lg font-black mr-3 text-slate-400">ج.م / شهر</span>
               </div>

               <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-sm transition-all hover:bg-indigo-50 active:scale-95 flex items-center justify-center gap-2">
                  <span>تحليل الأرباح</span>
                  <ChevronRight className="h-4 w-4" />
               </button>
            </div>
            {/* Abstract Background Decoration */}
            <div className="absolute -bottom-20 -left-20 h-64 w-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
         </div>
      </div>
    </div>
  )
}
