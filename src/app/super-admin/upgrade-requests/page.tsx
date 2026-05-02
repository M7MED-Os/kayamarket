import { createAdminClient } from '@/lib/supabase/server'
import { 
  CreditCard
} from 'lucide-react'
import { getPlanName } from '@/lib/subscription'
import RequestCard from './RequestCard'

export default async function UpgradeRequestsPage() {
  const admin = createAdminClient()

  // Fetch requests with store info
  const { data: requests, error } = await admin
    .from('plan_upgrade_requests')
    .select(`
      *,
      stores ( name, slug )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-10 text-red-500">حدث خطأ أثناء تحميل الطلبات: {error.message}</div>
  }

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">طلبات الترقية</h1>
          <p className="text-slate-500 font-bold">راجع طلبات الترقية اليدوية وقم بتأكيد الدفع لتفعيل الباقات.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests?.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center space-y-4">
            <div className="h-20 w-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto">
              <CreditCard className="h-10 w-10" />
            </div>
            <p className="text-slate-400 font-black">لا توجد طلبات ترقية حالياً</p>
          </div>
        ) : (
          requests?.map((req: any) => (
            <RequestCard key={req.id} req={req} />
          ))
        )}
      </div>
    </div>
  )
}
