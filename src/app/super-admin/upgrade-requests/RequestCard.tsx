'use client'

import React, { useState } from 'react'
import { 
   CheckCircle2, XCircle, Clock, 
   ExternalLink, Phone, CreditCard,
   Building2, User, Calendar, 
   Maximize2, X, Loader2
} from 'lucide-react'
import Image from 'next/image'
import { approveUpgradeRequest, rejectUpgradeRequest } from '@/app/actions/subscription'
import { getPlanName } from '@/lib/subscription'
import { toast } from 'react-hot-toast'

export default function RequestCard({ req }: { req: any }) {
   const [showModal, setShowModal] = useState(false)
   const [days, setDays] = useState(30)
   const [notes, setNotes] = useState('')
   const [loading, setLoading] = useState(false)

   const handleApprove = async () => {
      setLoading(true)
      const res = await approveUpgradeRequest(req.id, days)
      if (res.success) toast.success('تم تفعيل الباقة بنجاح')
      else toast.error(res.error || 'حدث خطأ')
      setLoading(false)
   }

   const handleReject = async () => {
      if (!notes) { toast.error('يرجى كتابة سبب الرفض'); return }
      setLoading(true)
      const res = await rejectUpgradeRequest(req.id, notes)
      if (res.success) toast.success('تم رفض الطلب')
      else toast.error(res.error || 'حدث خطأ')
      setLoading(false)
   }

   return (
      <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group relative overflow-hidden">
         <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* 📸 Thumbnail Section */}
            <div className="w-full lg:w-48 shrink-0">
               <div 
                  onClick={() => setShowModal(true)}
                  className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 cursor-zoom-in group/img"
               >
                  {req.receipt_url ? (
                     <>
                        <Image 
                           src={req.receipt_url} 
                           alt="Receipt" 
                           fill 
                           className="object-cover group-hover/img:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                           <Maximize2 className="text-white h-6 w-6" />
                        </div>
                     </>
                  ) : (
                     <div className="h-full w-full flex items-center justify-center text-slate-300 italic text-[10px]">بدون إيصال</div>
                  )}
               </div>
               <p className="text-[10px] font-black text-slate-400 text-center mt-3 uppercase tracking-widest">صورة الإيصال (اضغط للتكبير)</p>
            </div>

            {/* 📄 Content Section */}
            <div className="flex-1 space-y-6">
               <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                     <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        req.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-rose-100 text-rose-600'
                     }`}>
                        {req.status === 'pending' ? 'قيد المراجعة' : req.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
                     </div>
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {new Date(req.created_at).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                     </span>
                  </div>
               </div>

               <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-4">
                     طلب ترقية إلى باقة <span className="text-sky-600">"{getPlanName(req.plan_id)}"</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                              <Building2 className="h-4.5 w-4.5" />
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">المتجر</p>
                              <p className="text-sm font-black text-slate-900">{req.stores?.name || '...'}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                              <User className="h-4.5 w-4.5" />
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">صاحب المتجر</p>
                              <p className="text-sm font-black text-slate-900 truncate max-w-[150px]">@{req.stores?.slug}</p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                              <Phone className="h-4.5 w-4.5" />
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">بيانات المحول</p>
                              <p className="text-sm font-black text-slate-900">{req.sender_phone}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                              <CreditCard className="h-4.5 w-4.5" />
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">طريقة الدفع</p>
                              <p className="text-sm font-black text-slate-900">{req.sender_phone?.split(':')[0] || 'تحويل يدوي'}</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                           <Calendar className="h-3.5 w-3.5 text-slate-400" />
                           <span className="text-[10px] font-black text-slate-400 uppercase">مدة الاشتراك</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <input 
                              type="number" 
                              value={days}
                              onChange={(e) => setDays(Number(e.target.value))}
                              disabled={req.status !== 'pending'}
                              className="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-sm font-black outline-none focus:border-sky-500 transition-all"
                           />
                           <span className="text-xs font-bold text-slate-400 shrink-0">يوم</span>
                        </div>
                     </div>
                  </div>
               </div>

               {req.status === 'pending' && (
                  <div className="pt-6 border-t border-slate-50 flex flex-wrap gap-4 items-center">
                     <button 
                        onClick={handleApprove}
                        disabled={loading}
                        className="h-12 px-8 bg-sky-500 text-white rounded-xl font-black text-xs hover:bg-sky-600 transition-all active:scale-95 flex items-center gap-3 shadow-lg shadow-sky-100 disabled:opacity-50"
                     >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        موافقة وتفعيل
                     </button>

                     <div className="flex-1 flex items-center gap-2 min-w-[250px]">
                        <input 
                           value={notes}
                           onChange={(e) => setNotes(e.target.value)}
                           placeholder="سبب الرفض..." 
                           className="flex-1 h-12 bg-slate-50 border border-slate-100 rounded-xl px-5 text-xs font-black outline-none focus:bg-white focus:border-rose-500 transition-all"
                        />
                        <button 
                           onClick={handleReject}
                           disabled={loading}
                           className="h-12 px-6 bg-white border border-rose-100 text-rose-500 rounded-xl font-black text-xs hover:bg-rose-50 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                        >
                           <XCircle className="h-4 w-4" />
                           رفض
                        </button>
                     </div>
                  </div>
               )}

               {req.status === 'rejected' && req.admin_notes && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                     <p className="text-[9px] font-black text-rose-400 uppercase mb-1">سبب الرفض</p>
                     <p className="text-xs font-bold text-rose-700">{req.admin_notes}</p>
                  </div>
               )}
            </div>
         </div>

         {/* 🖼️ Modal Section */}
         {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
               <div className="relative max-w-4xl w-full h-full max-h-[90vh]">
                  <button 
                     onClick={() => setShowModal(false)}
                     className="absolute -top-12 right-0 h-10 w-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
                  >
                     <X className="h-6 w-6" />
                  </button>
                  <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl">
                     <Image 
                        src={req.receipt_url} 
                        alt="Full Receipt" 
                        fill 
                        className="object-contain"
                     />
                  </div>
               </div>
            </div>
         )}
      </div>
   )
}
