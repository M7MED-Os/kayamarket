'use client'

import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { updateReviewStatus } from '@/app/actions/reviews'
import toast from 'react-hot-toast'

export default function ReviewActionButtons({ reviewId, status, variant = 'default' }: { reviewId: string, status: string, variant?: 'default' | 'compact' }) {
  const [loading, setLoading] = useState(false)

  const handleAction = async (newStatus: 'approved' | 'rejected') => {
    setLoading(true)
    const result = await updateReviewStatus(reviewId, newStatus)
    if (result.success) {
      toast.success(newStatus === 'approved' ? 'تم النشر' : 'تم الحذف')
    } else {
      toast.error(result.error || 'حدث خطأ')
      setLoading(false)
    }
  }

  if (status === 'approved') {
    return (
      <button
        onClick={() => handleAction('rejected')}
        disabled={loading}
        className="flex items-center gap-1.5 text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-xl text-xs font-black transition-all hover:bg-rose-50 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        حذف
      </button>
    )
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => handleAction('approved')}
        disabled={loading}
        className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-xl text-xs font-black transition-all disabled:opacity-50"
      >
        <Check className="h-3.5 w-3.5" />
        نشر
      </button>
      <button
        onClick={() => handleAction('rejected')}
        disabled={loading}
        className="flex items-center gap-1.5 text-rose-400 hover:text-rose-600 px-3 py-1.5 rounded-xl text-xs font-black transition-all hover:bg-rose-50 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        حذف
      </button>
    </div>
  )
}
