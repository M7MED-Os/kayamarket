import { createAdminClient } from '@/lib/supabase/server'
import { Store, Search, Filter, Download } from 'lucide-react'
import MerchantTable from './MerchantTable'
import MerchantFilters from './MerchantFilters'

export default async function MerchantsPage(props: {
  searchParams: Promise<{ q?: string; plan?: string }>
}) {
  const searchParams = await props.searchParams
  const admin = createAdminClient()
  const query = searchParams.q || ''
  const planFilter = searchParams.plan || ''

  // Fetch all stores (Using Admin Client to see all)
  let dbQuery = admin
    .from('stores')
    .select(`
      id, name, slug, plan, is_active, created_at, plan_expires_at
    `)
    .order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`)
  }
  if (planFilter) {
    dbQuery = dbQuery.eq('plan', planFilter)
  }

  const { data: stores, error } = await dbQuery

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">إدارة المتاجر</h1>
           <p className="text-slate-500 font-bold">تحكم في اشتراكات وحالات المتاجر المشتركة في المنصة.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all">
              <Download className="h-4 w-4" />
              <span>تصدير البيانات</span>
           </button>
        </div>
      </div>

      {/* Filters & Search */}
      <MerchantFilters />

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
         <MerchantTable stores={stores || []} />
      </div>
    </div>
  )
}
