import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getStoreByIdentifier } from '@/lib/tenant/get-store'
import TrackOrderClient from './TrackOrderClient'

export const metadata = {
  title: 'تتبع الطلب',
}

interface PageProps {
  params: Promise<{ slug: string; token: string }>
}

export default async function TrackOrderPage({ params }: PageProps) {
  const { slug, token } = await params
  const supabase = await createClient()

  const { store, branding } = await getStoreByIdentifier(decodeURIComponent(slug))
  if (!store) notFound()

  // get order
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('public_token', token)
    .single()

  if (!order) notFound()

  return <TrackOrderClient order={order} store={store} branding={branding} slug={slug} />
}
