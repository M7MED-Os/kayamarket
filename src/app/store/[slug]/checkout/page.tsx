import { getStoreByIdentifier } from '@/lib/tenant/get-store'
import CheckoutView from './CheckoutView'

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const storeData = await getStoreByIdentifier(decodeURIComponent(slug))

  return <CheckoutView params={{ slug }} storeData={storeData} />
}
