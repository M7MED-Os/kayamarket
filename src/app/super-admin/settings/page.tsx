import { getPlatformSettings, getPendingCleanupStores } from '@/app/actions/platform'
import SettingsForm from './SettingsForm'
import { Shield, Clock, Database, Activity, LayoutTemplate, Settings2 } from 'lucide-react'

export default async function PlatformSettingsPage() {
  const settings = await getPlatformSettings()
  const pendingStores = await getPendingCleanupStores()

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
        <div className="space-y-3">
           <div className="flex items-center gap-3 mb-2">
             <div className="h-10 w-2.5 bg-indigo-600 rounded-full" />
             <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">إعدادات المنصة</h1>
           </div>
           <p className="text-slate-500 font-medium text-base max-w-2xl leading-relaxed">
             التحكم المركزي في قواعد الاشتراكات، فترات السماح، وسياسات الاحتفاظ بالبيانات عبر كافة المتاجر.
           </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
           <Shield className="h-4 w-4 text-indigo-600" />
           <span className="text-xs font-black text-slate-700 tracking-widest uppercase">Global Core Config</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Main Configuration Area */}
        <div className="space-y-8">
           <SettingsForm initialSettings={settings} pendingStores={pendingStores} />
        </div>

        {/* Info & Guidelines Panel */}
        <div className="space-y-6">
           {/* Pro Tip Card */}
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
              <div className="relative z-10">
                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                   <Activity className="h-6 w-6 text-indigo-300" />
                </div>
                <h3 className="text-xl font-black mb-3">سياسة التأثير الفوري</h3>
                <p className="text-sm text-slate-300 font-medium leading-loose opacity-90">
                   أي تغيير في فترة السماح يُطبق <span className="text-white font-bold underline decoration-indigo-400 decoration-2 underline-offset-4">فوراً</span> على جميع المتاجر. 
                   إذا قمت بتقليل المدة، فقد تدخل بعض المتاجر في نطاق "التنظيف" في نفس اللحظة.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 -mr-20 -mt-20"></div>
           </div>

           {/* Metrics/Info Card */}
           <div className="bg-white border border-slate-200/60 rounded-3xl p-8 space-y-8 shadow-sm">
              <div className="flex items-start gap-4">
                 <div className="h-12 w-12 bg-blue-50/50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100/50">
                    <Clock className="h-6 w-6" strokeWidth={2.5} />
                 </div>
                 <div>
                    <h4 className="text-base font-black text-slate-900 mb-1">فترة السماح</h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">فترة حماية تُمنح للمتاجر المنتهية لمنع حذف بياناتها فور الانتهاء، تتيح لهم فرصة للتجديد.</p>
                 </div>
              </div>
              
              <div className="flex items-start gap-4">
                 <div className="h-12 w-12 bg-rose-50/50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 border border-rose-100/50">
                    <Database className="h-6 w-6" strokeWidth={2.5} />
                 </div>
                 <div>
                    <h4 className="text-base font-black text-slate-900 mb-1">التنظيف العميق (Deep Cleanup)</h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">عملية آلية تقوم بمحو المنتجات الإضافية، الصور، والهوية البصرية الزائدة لتقليل استهلاك موارد الخادم.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
