'use client'

import { useState } from 'react'
import { Ticket, Plus, Edit2, Trash2, CheckCircle2, XCircle, Calendar, Zap, AlertCircle, Hash, Percent, UserCheck, Copy, Check, Clock, ShieldAlert } from 'lucide-react'
import { toggleCoupon, deleteCoupon } from '@/app/actions/coupons'
import toast from 'react-hot-toast'
import CouponModal from './CouponModal'
import ConfirmModal from '@/components/admin/ConfirmModal'

interface Coupon {
  id: string
  code: string
  discount_percentage: number
  max_uses: number | null
  current_uses: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export default function CouponTable({
  initialCoupons,
  usedCount: initialUsedCount,
  maxCoupons
}: {
  initialCoupons: Coupon[],
  usedCount: number,
  maxCoupons: number
}) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [copyingId, setCopyingId] = useState<string | null>(null)

  const usedCount = coupons.length
  const remaining = maxCoupons - usedCount

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await toggleCoupon(id, currentStatus)
    if (res.success) {
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c))
      toast.success(currentStatus ? 'تم إيقاف الكوبون' : 'تم تفعيل الكوبون')
    } else {
      toast.error(res.error || 'حدث خطأ ما')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await deleteCoupon(id)
    if (res.success) {
      setCoupons(prev => prev.filter(c => c.id !== id))
      toast.success('تم حذف الكوبون بنجاح')
      setDeleteId(null)
    } else {
      toast.error(res.error || 'حدث خطأ ما')
    }
  }

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopyingId(id)
    toast.success('تم نسخ الكود')
    setTimeout(() => setCopyingId(null), 2000)
  }

  const openAddModal = () => {
    setEditingCoupon(undefined)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20" dir="rtl">

      {/* ── Compact Unified Dashboard Actions (FIXED) ───────────────── */}
      <div className="flex justify-center md:justify-end">
        <div className="flex items-center gap-3 bg-white p-2.5 md:p-3 rounded-3xl border border-slate-100 shadow-sm w-fit max-w-full">

          {/* Quota Badge - Compact & Non-Growing */}
          <div className={`flex items-center gap-3 px-4 md:px-5 py-2 rounded-2xl border transition-all shrink-0 ${remaining <= 2 ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-500'
            }`}>
            <div className="flex flex-col text-center">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60">الاستهلاك</span>
              <span className="text-xs md:text-sm font-black leading-tight">{usedCount} / {maxCoupons}</span>
            </div>
            <div className="h-6 w-px bg-slate-200 opacity-50" />
            <Ticket className={`h-4 w-4 md:h-5 md:w-5 ${remaining <= 2 ? 'text-amber-500' : 'text-sky-500'}`} />
          </div>

          {/* Responsive Action Button */}
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2.5 bg-sky-500 text-white h-10 md:h-12 px-4 md:px-6 rounded-2xl font-black text-xs md:text-sm hover:bg-sky-600 transition-all shadow-lg shadow-sky-100 active:scale-95 group shrink-0"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5 group-hover:rotate-90 transition-transform" strokeWidth={3} />
            <span className="hidden md:inline">إنشاء كوبون جديد</span>
          </button>
        </div>
      </div>

      {/* ── Coupons Grid (430px System) ───────────────────────────────── */}
      {coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-[3rem] border border-slate-100 border-dashed">
          <div className="h-20 w-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mb-6">
            <Ticket className="h-10 w-10" strokeWidth={1} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">لا توجد كوبونات</h3>
          <p className="text-slate-400 font-bold max-w-xs mx-auto text-sm">ابدأ بإنشاء أول كوبون خصم لمتجرك لزيادة المبيعات.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,430px),1fr))] gap-8">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-100 transition-all duration-500 flex flex-col group overflow-hidden relative">

              {/* Visual Accent Decoration */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-[0.03] transition-colors ${coupon.is_active ? 'bg-sky-500' : 'bg-slate-500'}`} />

              {/* Card Header: Code & Discount Badge */}
              <div className="p-8 pb-4 flex items-center justify-between gap-6 relative z-10">
                <div className="flex flex-col gap-3 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-2 bg-sky-400 rounded-full" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">كود الخصم</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-2xl font-black text-slate-900 font-poppins tracking-tighter bg-slate-50/50 px-4 py-2 rounded-xl border border-slate-100 shadow-inner group-hover:bg-white group-hover:border-sky-200 transition-all">
                      {coupon.code}
                    </h4>
                    <button
                      onClick={() => copyToClipboard(coupon.code, coupon.id)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-sky-500 hover:border-sky-100 transition-all shadow-sm active:scale-90"
                    >
                      {copyingId === coupon.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Refined Discount Badge */}
                <div className="shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-10 group-hover:opacity-20 transition-opacity" />
                    <div className="relative bg-white border-2 border-emerald-500/20 rounded-2xl px-4 py-3 flex flex-col items-center justify-center shadow-sm">
                      <span className="text-2xl font-black text-emerald-600 leading-none">%{coupon.discount_percentage}</span>
                      <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mt-1">خصم</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Stats: Usage & Expiry */}
              <div className="px-8 py-6 space-y-6 relative z-10">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-500">مرات الاستخدام</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md">
                      {coupon.current_uses} / {coupon.max_uses || '∞'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                    <div
                      className={`h-full transition-all duration-1000 ${coupon.is_active ? 'bg-emerald-400' : 'bg-slate-300'}`}
                      style={{ width: `${coupon.max_uses ? Math.min(100, (coupon.current_uses / coupon.max_uses) * 100) : 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-400 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 opacity-50" />
                    <span className="text-[11px] font-bold">
                      {coupon.expires_at ? `ينتهي في ${new Date(coupon.expires_at).toLocaleDateString('ar-EG')}` : 'صلاحية مفتوحة'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px] font-bold">
                      {new Date(coupon.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-auto p-8 pt-0 flex items-center gap-3 relative z-10">
                <button
                  onClick={() => handleToggle(coupon.id, coupon.is_active)}
                  className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-xs font-black transition-all border ${coupon.is_active
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  {coupon.is_active ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {coupon.is_active ? 'فعال' : 'متوقف'}
                </button>
                <button
                  onClick={() => {
                    setEditingCoupon(coupon)
                    setIsModalOpen(true)
                  }}
                  className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-sky-600 hover:border-sky-200 transition-all shadow-sm"
                  title="تعديل"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteId(coupon.id)}
                  className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
                  title="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coupon={editingCoupon}
        onSuccess={(updatedCoupon) => {
          if (editingCoupon) {
            setCoupons(prev => prev.map(c => c.id === updatedCoupon.id ? updatedCoupon : c))
          } else {
            setCoupons(prev => [updatedCoupon, ...prev])
          }
        }}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="حذف الكوبون"
        description="هل أنت متأكد من حذف هذا الكوبون نهائياً؟ لا يمكن للعملاء استخدامه بعد الحذف."
        confirmText="نعم، حذف نهائياً"
        variant="danger"
      />
    </div>
  )
}
