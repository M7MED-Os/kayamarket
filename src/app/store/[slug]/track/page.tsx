import { notFound } from 'next/navigation'
import { getStoreByIdentifier } from '@/lib/tenant/get-store'
import TrackOrderClient from './TrackOrderClient'

export const metadata = {
  title: 'تتبع طلبك',
}

interface PageProps {
  params: Promise<{ slug: string }>
}

import { createClient } from '@/lib/supabase/server'

export default async function TrackPage({ params }: PageProps) {
  const { slug } = await params
  const { store, branding } = await getStoreByIdentifier(decodeURIComponent(slug))
  if (!store) notFound()

  const supabase = await createClient()
  const { getPlanConfig, getDynamicPlanConfigs } = await import('@/lib/subscription')
  const dynamicConfigs = await getDynamicPlanConfigs(supabase)
  const planTier = (store.plan || 'starter') as any
  const planConfig = dynamicConfigs[planTier] || getPlanConfig(planTier)
  const showWatermark = !planConfig.canRemoveWatermark

  return <TrackOrderClient store={store} branding={branding} slug={slug} showWatermark={showWatermark} />
}
