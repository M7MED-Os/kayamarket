'use client'

import { useState } from 'react'
import { 
  MoreHorizontal, Edit2, ShieldAlert, 
  ExternalLink, CheckCircle2, XCircle,
  TrendingUp, Star, Zap, Loader2, Store,
  Trash2, Power, Eye, Calendar
} from 'lucide-react'
import { updateStorePlan, toggleStoreStatus, deleteStore } from '@/app/actions/super-admin'
import toast from 'react-hot-toast'
import { PlanTier } from '@/lib/subscription'
import ConfirmModal from '@/components/ConfirmModal'

interface MerchantTableProps {
  stores: any[]
}

export default function MerchantTable({ stores }: MerchantTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, storeId: string, storeName: string }>({
    isOpen: false,
    storeId: '',
    storeName: ''
  })
  const [planModal, setPlanModal] = useState<{ isOpen: boolean, storeId: string, plan: PlanTier | null }>({
    isOpen: false,
    storeId: '',
    plan: null
  })
  const [duration, setDuration] = useState(30)

  const handlePlanUpdate = async () => {
    if (!planModal.plan) return
    setLoadingId(planModal.storeId)
    const res = await updateStorePlan(planModal.storeId, planModal.plan, duration)
    if (res.success) {
      toast.success('تم تحديث الخطة والمدة بنجاح')
      setPlanModal({ isOpen: false, storeId: '', plan: null })
    } else {
      toast.error(res.error || 'فشل التحديث')
    }
    setLoadingId(null)
  }

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    setLoadingId(id)
    const res = await toggleStoreStatus(id, !currentStatus)
    if (res.success) {
      toast.success(currentStatus ? 'تم تعطيل المتجر' : 'تم تفعيل المتجر')
    } else {
      toast.error(res.error || 'فشل التحديث')
    }
    setLoadingId(null)
  }

  const handleDeleteConfirm = async () => {
    const { storeId } = deleteModal
    setLoadingId(storeId)
    const res = await deleteStore(storeId)
    if (res.success) {
      toast.success('تم حذف المتجر بنجاح')
      setDeleteModal({ ...deleteModal, isOpen: false })
    } else {
      toast.error(res.error || 'فشل الحذف')
    }
    setLoadingId(null)
  }

  return (
    <div className="overflow-x-auto" dir="rtl">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">المتجر</th>
            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">الحالة</th>
            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">الخطة الحالية</th>
            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">أيام الاشتراك</th>
            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">تغيير الخطة</th>
            <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">إجراءات الإدارة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {stores.map((store) => {
            const daysLeft = store.plan_expires_at ? Math.ceil((new Date(store.plan_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

            return (
            <tr key={store.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400">
                    {store.name?.[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900">{store.name}</span>
                    <span className="text-xs text-slate-400 font-bold">{store.slug}.kayamarket.com</span>
                  </div>
                </div>
              </td>
              
              <td className="px-8 py-6">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black w-fit ${store.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {store.is_active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {store.is_active ? 'نشط' : 'معطل'}
                </div>
              </td>

              <td className="px-8 py-6">
                 <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black
                    ${store.plan === 'pro' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                      store.plan === 'growth' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 
                      'bg-slate-50 text-slate-500 border border-slate-100'}
                 `}>
                    {store.plan === 'pro' ? <Zap className="h-3.5 w-3.5" /> : 
                     store.plan === 'growth' ? <TrendingUp className="h-3.5 w-3.5" /> : 
                     <Star className="h-3.5 w-3.5" />}
                    {store.plan === 'pro' ? 'Pro Plus' : store.plan === 'growth' ? 'Pro' : 'Free'}
                 </div>
              </td>

              <td className="px-8 py-6 text-center">
                 <button 
                   onClick={() => {
                      setPlanModal({ isOpen: true, storeId: store.id, plan: store.plan })
                      setDuration(daysLeft || 30)
                   }}
                   className="group/days flex flex-col items-center justify-center gap-1 mx-auto"
                 >
                    {daysLeft !== null ? (
                       <div className={`text-xs font-black ${daysLeft <= 3 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                          {daysLeft} يوم
                       </div>
                    ) : (
                       <span className="text-[10px] font-bold text-slate-300">غير محدود</span>
                    )}
                    <span className="text-[8px] font-black text-sky-500 opacity-0 group-hover/days:opacity-100 transition-opacity">تعديل المدة</span>
                 </button>
              </td>

              <td className="px-8 py-6">
                 <div className="flex items-center justify-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-fit mx-auto">
                    {(['starter', 'growth', 'pro'] as PlanTier[]).map(p => (
                       <button
                         key={p}
                         onClick={() => {
                            if (p === 'starter') {
                               setLoadingId(store.id)
                               updateStorePlan(store.id, 'starter').then(res => {
                                  if (res.success) toast.success('تم التحويل للخطة المجانية')
                                  else toast.error(res.error)
                                  setLoadingId(null)
                               })
                            } else {
                               setPlanModal({ isOpen: true, storeId: store.id, plan: p })
                               setDuration(30)
                            }
                         }}
                         disabled={loadingId === store.id || store.plan === p}
                         className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all
                            ${store.plan === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}
                         `}
                       >
                          {p === 'starter' ? 'Free' : p === 'growth' ? 'Pro' : 'Pro Plus'}
                       </button>
                    ))}
                 </div>
              </td>

              <td className="px-8 py-6">
                <div className="flex items-center justify-center gap-2">
                  <a 
                    href={`/store/${store.slug}`} 
                    target="_blank" 
                    title="معاينة المتجر"
                    className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
                  >
                    <Eye className="h-4 w-4" />
                  </a>

                  <button 
                    onClick={() => handleStatusToggle(store.id, store.is_active)}
                    disabled={loadingId === store.id}
                    title={store.is_active ? "تعطيل المتجر" : "تفعيل المتجر"}
                    className={`p-2 rounded-xl transition-all ${store.is_active ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                  >
                    <Power className="h-4 w-4" />
                  </button>

                  <button 
                    onClick={() => setDeleteModal({ isOpen: true, storeId: store.id, storeName: store.name })}
                    disabled={loadingId === store.id}
                    title="حذف المتجر نهائياً"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          )})}
        </tbody>
      </table>

      {/* Plan & Duration Modal */}
      {planModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4">
                 <div className="h-14 w-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
                    <Calendar className="h-7 w-7" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900">تحديث مدة الاشتراك</h3>
                    <p className="text-xs font-bold text-slate-400">حدد عدد الأيام الصالحة لهذا الاشتراك.</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">مدة الاشتراك (بالأيام)</label>
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-sky-500 focus-within:bg-white transition-all shadow-sm">
                       <input 
                         type="number" min={1}
                         value={duration}
                         onChange={e => setDuration(parseInt(e.target.value))}
                         className="flex-1 bg-transparent h-12 px-4 text-lg font-black text-slate-900 outline-none"
                       />
                       <div className="px-6 text-xs font-black text-slate-500 bg-white border border-slate-100 rounded-xl py-3 shadow-sm">يوم</div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    {[30, 90, 365].map(d => (
                       <button 
                         key={d}
                         onClick={() => setDuration(d)}
                         className={`py-3 rounded-xl text-xs font-black border transition-all ${duration === d ? 'bg-sky-500 border-sky-500 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-sky-300'}`}
                       >
                          {d === 30 ? 'شهر' : d === 90 ? '3 شهور' : 'سنة'}
                       </button>
                    ))}
                    <button 
                       onClick={() => setDuration(duration + 30)}
                       className="py-3 rounded-xl text-xs font-black bg-slate-50 border border-slate-100 text-slate-500 hover:border-sky-300"
                    >
                       +30 يوم
                    </button>
                 </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                 <button 
                    onClick={handlePlanUpdate}
                    disabled={loadingId !== null}
                    className="flex-1 h-14 bg-sky-500 text-white rounded-2xl font-black text-sm hover:bg-sky-600 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-sky-100"
                 >
                    {loadingId !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    تأكيد التحديث
                 </button>
                 <button 
                    onClick={() => setPlanModal({ isOpen: false, storeId: '', plan: null })}
                    className="px-8 h-14 bg-slate-50 text-slate-400 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all"
                 >
                    إلغاء
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        title="حذف المتجر نهائياً"
        description={`هل أنت متأكد من حذف متجر "${deleteModal.storeName}"؟ سيتم مسح كافة البيانات والمنتجات والطلبات بشكل نهائي ولا يمكن استعادتها.`}
        confirmText="نعم، احذف المتجر"
        cancelText="إلغاء"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        isLoading={loadingId === deleteModal.storeId}
        variant="danger"
      />
    </div>
  )
}
