'use client'

import { useState, useEffect } from 'react'
import { X, Save, Ticket, Percent, Hash, Calendar, CheckCircle, Loader2 } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center">
              <Ticket className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-poppins">{isEditing ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}</h3>
              <p className="text-[11px] font-bold text-slate-400 font-inter">أدخل تفاصيل الخصم والعروض أدناه</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 font-inter">
                <Hash className="h-4 w-4 text-slate-400" />
                كود الخصم
              </label>
              <input
                required
                type="text"
                placeholder="مثال: SAVE20"
                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-sky-600 uppercase placeholder:text-slate-300 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-sky-50 focus:border-sky-400 transition-all font-poppins tracking-wider"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 font-inter">
                  <Percent className="h-4 w-4 text-slate-400" />
                  نسبة الخصم
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max="100"
                  placeholder="20"
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-50 focus:border-sky-400 transition-all font-poppins"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 font-inter">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  تاريخ الانتهاء
                </label>
                <input
                  type="date"
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-50 focus:border-sky-400 transition-all font-inter"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 font-inter">
                <Hash className="h-4 w-4 text-slate-400" />
                أقصى عدد استخدامات
              </label>
              <input
                type="number"
                min="1"
                placeholder="اتركه فارغاً للاستخدام اللامحدود"
                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-50 focus:border-sky-400 transition-all font-inter"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center justify-between cursor-pointer group p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-700 font-inter">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${formData.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  حالة الكوبون
                </div>
                <div 
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? '-translate-x-6' : '-translate-x-1'}`} />
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors font-inter"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] flex items-center justify-center gap-2 h-12 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 active:scale-95 font-inter"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5" />
                {isEditing ? 'تحديث الكوبون' : 'حفظ الكوبون'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
