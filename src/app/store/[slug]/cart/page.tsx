export const dynamic = 'force-dynamic'

import { getStoreByIdentifier } from '@/lib/tenant/get-store'
import CartView from './CartView'

export default async function CartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const storeData = await getStoreByIdentifier(decodeURIComponent(slug))

  return <CartView params={{ slug }} storeData={storeData} />
}
