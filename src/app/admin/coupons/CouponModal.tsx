'use client'

import { useState, useEffect } from 'react'
import { X, Save, Ticket, Percent, Hash, Calendar, CheckCircle, Loader2, Sparkles, LayoutGrid } from 'lucide-react'
import { createCoupon, updateCoupon } from '@/app/actions/coupons'
import toast from 'react-hot-toast'

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

interface CouponModalProps {
  isOpen: boolean
  onClose: () => void
  coupon?: Coupon
  onSuccess: (coupon: any) => void
}

export default function CouponModal({ isOpen, onClose, coupon, onSuccess }: CouponModalProps) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!coupon

  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: '',
    max_uses: '',
    expires_at: '',
    is_active: true,
  })

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        discount_percentage: coupon.discount_percentage.toString(),
        max_uses: coupon.max_uses?.toString() || '',
        expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : '',
        is_active: coupon.is_active,
      })
    } else {
      setFormData({
        code: '',
        discount_percentage: '',
        max_uses: '',
        expires_at: '',
        is_active: true,
      })
    }
  }, [coupon, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const data = new FormData()
    data.append('code', formData.code)
    data.append('discount_percentage', formData.discount_percentage)
    if (formData.max_uses) data.append('max_uses', formData.max_uses)
    if (formData.expires_at) data.append('expires_at', formData.expires_at)
    data.append('is_active', String(formData.is_active))

    let res
    if (isEditing) {
      res = await updateCoupon(coupon.id, data)
    } else {
      res = await createCoupon(data)
    }

    if (res.success) {
      toast.success(isEditing ? 'تم تحديث الكوبون بنجاح' : 'تم إضافة الكوبون بنجاح')
      onSuccess(res.coupon)
      onClose()
    } else {
      toast.error(res.error || 'حدث خطأ غير متوقع')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-[1.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        
        {/* Compact Header */}
        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-100">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{isEditing ? 'تعديل الكوبون' : 'كوبون جديد'}</h3>
              <p className="text-[10px] font-bold text-slate-400">تخصيص العروض والخصومات</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Compact Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-5 no-scrollbar">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">كود الخصم (CODE)</label>
              <input
                required type="text" placeholder="مثال: WELCOME20"
                className="w-full h-11 rounded-xl border-2 border-slate-50 bg-slate-50 px-4 text-sm font-black text-sky-600 uppercase focus:outline-none focus:bg-white focus:border-sky-500 transition-all"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">نسبة الخصم (%)</label>
                <input
                  required type="number" min="1" max="100" placeholder="20"
                  className="w-full h-11 rounded-xl border-2 border-slate-50 bg-slate-50 px-4 text-sm font-black text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 transition-all"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">تاريخ الانتهاء</label>
                <input
                  type="date"
                  className="w-full h-11 rounded-xl border-2 border-slate-50 bg-slate-50 px-4 text-xs font-black text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 transition-all"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">أقصى عدد استخدامات</label>
              <input
                type="number" placeholder="اتركه فارغاً للاستخدام اللامحدود"
                className="w-full h-11 rounded-xl border-2 border-slate-50 bg-slate-50 px-4 text-xs font-black text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 transition-all"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
              />
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${formData.is_active ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${formData.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className={`text-xs font-black ${formData.is_active ? 'text-emerald-700' : 'text-slate-400'}`}>حالة الكوبون نشط</span>
              </div>
              <div className={`h-5 w-9 rounded-full p-1 transition-all ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`h-3 w-3 rounded-full bg-white transition-all ${formData.is_active ? 'mr-4' : 'mr-0'}`} />
              </div>
            </button>
          </div>
        </form>

        {/* Compact Fixed Footer */}
        <div className="p-4 bg-white border-t border-slate-50 flex items-center gap-3">
          <button onClick={onClose} className="h-11 px-6 rounded-xl font-black text-slate-400 hover:bg-slate-50 transition-all text-xs">إلغاء</button>
          <button
            onClick={handleSubmit} disabled={loading}
            className="flex-1 h-11 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-sky-600 transition-all shadow-lg shadow-slate-100 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isEditing ? 'تحديث الكوبون' : 'حفظ الكوبون'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
