import { createAdminClient } from '@/lib/supabase/server'
import { getDynamicPlanConfigs } from '@/lib/subscription'
import { Shield, Info } from 'lucide-react'
import PlanEditor from './PlanEditor'

export default async function PlansManagementPage() {
  const admin = createAdminClient()
  const dynamicConfigs = await getDynamicPlanConfigs(admin)

  return (
    <div className="space-y-10" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-2">
         <h1 className="text-3xl font-black text-slate-900 tracking-tight">إدارة خطط الاشتراكات</h1>
         <p className="text-slate-500 font-bold">تحكم كامل في حدود وميزات كل باقة. أي تعديل هنا يطبق فوراً على كافة المتاجر.</p>
      </div>

      {/* Dynamic Plan Editor Component */}
      <PlanEditor initialConfigs={dynamicConfigs} />

      {/* Info Box */}
      <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
         <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
            <Shield className="h-8 w-8" />
         </div>
         <div>
            <h3 className="text-lg font-black text-blue-900 mb-1">أمان قاعدة البيانات مفعل</h3>
            <p className="text-sm font-bold text-blue-700/70 leading-relaxed">
               تم ربط هذه الإعدادات بـ "Triggers" داخل قاعدة البيانات. حتى لو تم تجاوز القيود برمجياً، ستقوم قاعدة البيانات برفض العمليات غير المسموح بها تلقائياً.
            </p>
         </div>
      </div>
    </div>
  )
}
