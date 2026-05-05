export const dynamic = 'force-dynamic'

import { getStoreByIdentifier } from '@/lib/tenant/get-store'
import WishlistView from './WishlistView'

export default async function WishlistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const storeData = await getStoreByIdentifier(decodeURIComponent(slug))

  return <WishlistView params={{ slug }} storeData={storeData} />
}
