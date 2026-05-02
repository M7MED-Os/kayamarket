import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProductForm from '../ProductForm'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PlanTier, getDynamicPlanConfigs, getPlanConfig } from '@/lib/subscription'

export const metadata = {
  title: 'إضافة منتج | لوحة تحكم التاجر',
}

export default async function NewProductPage() {
  const supabase = await createClient()
  const { storeId } = await assertMerchant(supabase)

  const { data: store } = await supabase
    .from('stores')
    .select('plan')
    .eq('id', storeId)
    .single()

  const storePlan = (store?.plan as PlanTier) || 'starter'
  const dynamicConfigs = await getDynamicPlanConfigs(supabase)
  const currentConfig = dynamicConfigs[storePlan] || getPlanConfig(storePlan)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/products"
          className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shrink-0"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-black text-zinc-900 mb-1">إضافة منتج جديد</h2>
          <p className="text-zinc-500 font-medium text-sm">أدخل تفاصيل المنتج ليظهر لعملائك.</p>
        </div>
      </div>
      
      <ProductForm plan={storePlan} config={currentConfig} />
    </div>
  )
}
