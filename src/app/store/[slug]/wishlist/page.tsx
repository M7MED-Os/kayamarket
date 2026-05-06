export const dynamic = 'force-dynamic'

import { getStoreByIdentifier } from '@/lib/tenant/get-store'
import WishlistView from './WishlistView'

import { createClient } from '@/lib/supabase/server'

export default async function WishlistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const storeData = await getStoreByIdentifier(decodeURIComponent(slug))
  const supabase = await createClient()

  const { getPlanConfig, getDynamicPlanConfigs } = await import('@/lib/subscription')
  const dynamicConfigs = await getDynamicPlanConfigs(supabase)
  const planTier = (storeData.store?.plan || 'starter') as any
  const planConfig = dynamicConfigs[planTier] || getPlanConfig(planTier)
  const showWatermark = !planConfig.canRemoveWatermark

  return <WishlistView params={{ slug }} storeData={storeData} showWatermark={showWatermark} />
}
