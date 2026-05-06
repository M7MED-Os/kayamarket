import { createClient } from '@/lib/supabase/server'
import { getStoreByIdentifier } from '@/lib/tenant/get-store'
import CheckoutView from './CheckoutView'

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const storeData = await getStoreByIdentifier(decodeURIComponent(slug))
  const supabase = await createClient()
  const { getPlanConfig, getDynamicPlanConfigs } = await import('@/lib/subscription')
  const dynamicConfigs = await getDynamicPlanConfigs(supabase)
  const rawPlan = storeData.store?.plan as string || 'starter'
  const planTier = (rawPlan.toLowerCase() === 'free' ? 'starter' : rawPlan.toLowerCase()) as import('@/lib/subscription').PlanTier
  const planConfig = dynamicConfigs[planTier] || getPlanConfig(planTier)
  const showWatermark = !planConfig.canRemoveWatermark

  return <CheckoutView params={{ slug }} storeData={storeData} showWatermark={showWatermark} />
}
