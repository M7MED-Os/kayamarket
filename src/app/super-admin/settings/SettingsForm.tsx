'use client'

import { useState } from 'react'
import { 
  Save, Loader2, Clock, RotateCcw, 
  Trash2, ShieldCheck, Zap, AlertTriangle, X, Database
} from 'lucide-react'
import { updatePlatformSettings, triggerSubscriptionCheck } from '@/app/actions/platform'
import toast from 'react-hot-toast'

export default function SettingsForm({ initialSettings, pendingStores = [] }: { initialSettings: any, pendingStores?: any[] }) {
  const [settings, setSettings] = useState(initialSettings)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [cleaningId, setCleaningId] = useState<string | null>(null)

  const handleSave = async () => {
    setLoading(true)
    const res = await updatePlatformSettings(settings)
    if (res.success) {
      toast.success('تم حفظ إعدادات المنصة بنجاح')
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  // Custom Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'all' | 'single';
    storeId?: string;
    storeName?: string;
  }>({ isOpen: false, type: 'all' })

  const handleManualCheck = async () => {
    setChecking(true)
    const res = await triggerSubscriptionCheck()
    if (res.success) {
      if (res.processed === 0) {
        toast.success('تم الانتهاء. لا توجد متاجر تحتاج للتنظيف.')
      } else {
        toast.success(`تم بنجاح تنظيف ${res.processed} متجر.`)
        if (res.details && res.details.length > 0) {
          toast(res.details[0], { icon: '🧹', duration: 6000 })
        }
      }
    } else {
      toast.error(res.error)
    }
    setChecking(false)
  }

  const handleCleanStore = async (storeId: string) => {
    setCleaningId(storeId)
    const res = await triggerSubscriptionCheck(storeId)
    if (res.success) {
       toast.success(`تم تنظيف المتجر بنجاح.`)
       if (res.details && res.details.length > 0) {
         toast(res.details[0], { icon: '🧹', duration: 6000 })
       }
    } else {
       toast.error(res.error)
    }
    setCleaningId(null)
  }

  const executeClean = async () => {
    const { type, storeId } = confirmModal
    setConfirmModal({ ...confirmModal, isOpen: false })

    if (type === 'all') {
      await handleManualCheck()
    } else if (type === 'single' && storeId) {
      await handleCleanStore(storeId)
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Grace Period Section */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-8 space-y-8 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
         <div className="flex items-center gap-4 relative z-10">
            <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100/50">
               <Clock className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div>
               <h3 className="text-lg font-black text-slate-900">إعدادات فترة السماح</h3>
               <p className="text-xs font-bold text-slate-500 mt-1">المهلة الزمنية المتاحة للتجار قبل تطبيق سياسة حذف البيانات.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">عدد أيام السماح</label>
               <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                  <input 
                    type="number" min={0} max={30}
                    value={settings.grace_period_days}
                    onChange={e => setSettings({...settings, grace_period_days: parseInt(e.target.value)})}
                    className="flex-1 bg-transparent h-10 px-4 text-sm font-black outline-none text-slate-900"
                  />
                  <div className="px-4 text-[11px] font-black text-slate-500 bg-white border border-slate-200/60 rounded-xl py-2 shadow-sm">يوم / أيام</div>
               </div>
            </div>

            <div className="bg-rose-50/50 border border-rose-100/60 rounded-2xl p-5 flex flex-col justify-center">
               <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                  <p className="text-xs font-bold text-rose-900 leading-relaxed">
                    بمجرد انتهاء هذه المدة، سيتم تحويل المتجر <span className="font-black underline decoration-rose-400 decoration-2 underline-offset-4">فوراً</span> للباقة المجانية (Starter) ومسح كافة المنتجات والوسائط الزائدة نهائياً.
                  </p>
               </div>
            </div>
         </div>
         <div className="absolute top-0 right-0 h-40 w-40 bg-blue-50/50 rounded-full blur-[100px] -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>


      {/* 3. Pending Cleanups Dashboard */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-8 space-y-6 shadow-sm">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100/50">
                  <Trash2 className="h-6 w-6" strokeWidth={2.5} />
               </div>
               <div>
                  <h3 className="text-lg font-black text-slate-900">المتاجر المعلقة للتنظيف</h3>
                  <p className="text-xs font-bold text-slate-500 mt-1">متاجر تجاوزت المهلة وتنتظر تطبيق سياسة حذف البيانات المفرطة.</p>
               </div>
            </div>
            
            {pendingStores && pendingStores.length > 0 && (
              <button 
                onClick={() => setConfirmModal({ isOpen: true, type: 'all' })}
                disabled={checking}
                className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shrink-0 shadow-lg shadow-slate-900/20"
              >
                 {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                 تنظيف الكل ({pendingStores.length})
              </button>
            )}
         </div>

         {/* List of pending stores */}
         {pendingStores && pendingStores.length > 0 ? (
           <div className="grid grid-cols-1 gap-3">
             {pendingStores.map((store: any) => (
               <div key={store.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-200/50 rounded-2xl bg-white hover:bg-slate-50/50 hover:border-slate-300 transition-all gap-4 group">
                 <div className="flex flex-col">
                   <span className="font-black text-slate-900 text-base">{store.name}</span>
                   <span className="text-[10px] font-bold text-slate-400 font-mono mt-1 select-all">{store.id}</span>
                 </div>
                 <button
                   onClick={() => setConfirmModal({ isOpen: true, type: 'single', storeId: store.id, storeName: store.name })}
                   disabled={cleaningId === store.id || checking}
                   className="flex items-center justify-center gap-2 bg-white border border-rose-200 text-rose-600 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-rose-50 hover:border-rose-300 transition-all disabled:opacity-50 shrink-0 shadow-sm"
                 >
                   {cleaningId === store.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                   إزالة البيانات
                 </button>
               </div>
             ))}
           </div>
         ) : (
           <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-4 opacity-40" strokeWidth={1.5} />
              <p className="text-sm font-black text-slate-600">لا توجد أي متاجر متجاوزة للمهلة حالياً</p>
              <p className="text-xs font-bold text-slate-400 mt-2">النظام يعمل بشكل سليم ومستقر.</p>
           </div>
         )}
      </div>

      {/* Action Bar */}
      <div className="sticky bottom-8 mt-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 p-4 rounded-3xl shadow-2xl flex items-center justify-between z-20">
         <div className="px-4 hidden md:block">
           <p className="text-xs font-bold text-slate-500">تم حفظ آخر تغييرات تلقائياً من قبل النظام.</p>
         </div>
         <button 
           onClick={handleSave}
           disabled={loading}
           className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
         >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            حفظ إعدادات النظام
         </button>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            {/* Modal Header/Icon */}
            <div className="bg-rose-50/50 p-6 flex flex-col items-center justify-center border-b border-rose-100/50">
              <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-rose-100">
                <Database className="h-7 w-7 text-rose-500" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-black text-slate-900 text-center">تأكيد إزالة البيانات</h3>
            </div>
            
            {/* Modal Content */}
            <div className="p-8 text-center space-y-5">
              <p className="text-slate-600 font-bold leading-relaxed text-sm">
                {confirmModal.type === 'all' 
                  ? "أنت على وشك تنفيذ عملية تنظيف عميق لجميع المتاجر المعلقة في القائمة. سيتم مسح كافة صورهم ومنتجاتهم الزائدة نهائياً لتخفيف الضغط على خوادم المنصة."
                  : <>أنت على وشك تنظيف متجر <span className="text-indigo-600 font-black px-1">{confirmModal.storeName}</span> وإزالة كافة صوره ومنتجاته الزائدة عن حدود باقته.</>}
              </p>
              <div className="flex items-center justify-center gap-2 text-rose-600 bg-rose-50 px-4 py-3 rounded-xl border border-rose-100/50 mx-auto w-fit">
                <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
                <span className="text-[11px] font-black uppercase tracking-widest">إجراء غير قابل للتراجع</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="flex-1 px-6 py-3.5 bg-white text-slate-700 font-black text-sm rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
              >
                تراجع
              </button>
              <button 
                onClick={executeClean}
                className="flex-[1.5] px-6 py-3.5 bg-rose-600 text-white font-black text-sm rounded-xl shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                تأكيد ومسح
              </button>
            </div>
            
            {/* Close Icon (Top Right) */}
            <button 
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              className="absolute top-4 right-4 h-8 w-8 bg-white/50 backdrop-blur rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
