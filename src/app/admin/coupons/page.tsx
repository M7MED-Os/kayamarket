import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { Ticket, Lock, ArrowUpRight } from 'lucide-react'
import CouponTable from './CouponTable'
import { redirect } from 'next/navigation'
import { PlanTier, getDynamicPlanConfigs, getPlanConfig, getPlanName } from '@/lib/subscription'
import Link from 'next/link'

export const metadata = {
  title: 'كوبونات الخصم | KayaMarket',
}

export default async function AdminCoupons() {
  const supabase = await createClient()
  let storeId: string

  try {
    const authData = await assertMerchant(supabase)
    storeId = authData.storeId
  } catch {
    redirect('/login')
  }

  const { data: storeData } = await supabase
    .from('stores').select('plan').eq('id', storeId).single()
  const plan = (storeData?.plan || 'starter') as PlanTier
  const dynamicConfigs = await getDynamicPlanConfigs(supabase)
  const config = dynamicConfigs[plan] || getPlanConfig(plan)

  if (config.maxCoupons === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in fade-in duration-500" dir="rtl">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 max-w-lg w-full text-center shadow-sm">
          <div className="h-20 w-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">الكوبونات غير متاحة</h2>
          <p className="text-slate-500 font-medium mb-8">نظام الكوبونات متاح فقط في الباقات المدفوعة.</p>
          <Link href="/pricing" className="flex items-center justify-center gap-2 w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-95">
            ترقية الباقة الآن
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  const usedCount = coupons?.length ?? 0

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700" dir="rtl">
      
      <div className="space-y-2 mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <div className="h-8 md:h-10 w-1.5 bg-sky-500 rounded-full shrink-0" />
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">كوبونات الخصم</h2>
        </div>
        <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl leading-relaxed">
          أنشئ أكواد خصم جذابة لعملائك لزيادة مبيعات متجرك وتحفيزهم على الشراء.
        </p>
      </div>

      <CouponTable 
        initialCoupons={coupons || []} 
        usedCount={usedCount} 
        maxCoupons={config.maxCoupons} 
      />
    </div>
  )
}
