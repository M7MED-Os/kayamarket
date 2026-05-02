import { notFound } from 'next/navigation'
import { getStoreByIdentifier } from '@/lib/tenant/get-store'
import TrackOrderClient from './TrackOrderClient'

export const metadata = {
  title: 'تتبع طلبك',
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function TrackPage({ params }: PageProps) {
  const { slug } = await params
  const { store, branding } = await getStoreByIdentifier(decodeURIComponent(slug))
  if (!store) notFound()

  return <TrackOrderClient store={store} branding={branding} slug={slug} />
}
