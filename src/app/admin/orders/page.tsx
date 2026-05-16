import { createClient } from '@/lib/supabase/server'
import { assertMerchant } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OrderTable from './OrderTable'
import { PlanTier } from '@/lib/subscription'

export const metadata = {
  title: 'الطلبات | KayaMarket',
}

const PAGE_SIZE = 20

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  let storeId: string

  try {
    const authData = await assertMerchant(supabase)
    storeId = authData.storeId
  } catch {
    redirect('/login')
  }

  const { data: storeData } = await supabase
    .from('stores')
    .select('name, plan')
    .eq('id', storeId!)
    .single()

  const storeName = storeData?.name || 'KayaMarket'
  const storePlan = (storeData?.plan as PlanTier) || 'starter'

  const { data: orders, error, count } = await supabase
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .eq('store_id', storeId!)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    return <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl font-inter shadow-sm">حدث خطأ أثناء تحميل الطلبات.</div>
  }

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <div className="h-8 md:h-10 w-1.5 bg-sky-500 rounded-full shrink-0" />
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">الطلبات</h2>
            {count !== null && (
              <span className="bg-sky-50 text-sky-600 px-3 py-1 rounded-full text-sm font-bold font-inter border border-sky-100 shadow-sm">
                {count} طلب
              </span>
            )}
          </div>
          <p className="text-slate-500 font-medium text-sm md:text-lg max-w-2xl leading-relaxed">
            إدارة ومتابعة طلبات متجرك وتحديث حالاتها بكل سهولة.
          </p>
        </div>
      </div>

      <OrderTable
        orders={orders || []}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={count || 0}
        storeId={storeId!}
        storeName={storeName}
        plan={storePlan}
      />
    </div>
  )
}
