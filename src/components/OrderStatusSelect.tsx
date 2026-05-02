'use client'

import { updateOrderStatus } from '@/app/actions/order'
import { useState } from 'react'
import toast from 'react-hot-toast'

const statusOptions = [
  { value: 'pending', label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'تم التأكيد', color: 'bg-blue-100 text-blue-700' },
  { value: 'processing', label: 'جاري التجهيز', color: 'bg-purple-100 text-purple-700' },
  { value: 'shipped', label: 'في الطريق', color: 'bg-orange-100 text-orange-700' },
  { value: 'completed', label: 'مكتمل', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'ملغي', color: 'bg-red-100 text-red-700' },
]

export default function OrderStatusSelect({ orderId, initialStatus }: { orderId: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setLoading(true)
    const result = await updateOrderStatus(orderId, newStatus)
    if (result.success) {
      setStatus(newStatus)
    } else {
      toast.error('حدث خطأ أثناء تحديث حالة الطلب')
    }
    setLoading(false)
  }

  const currentColor = statusOptions.find(o => o.value === status)?.color || 'bg-zinc-100 text-zinc-700'

  return (
    <div className="relative inline-block w-full">
      <select
        value={status}
        onChange={handleChange}
        disabled={loading}
        className={`w-full appearance-none rounded-lg border-none px-3 py-1.5 text-xs font-bold outline-none ring-1 ring-inset ring-zinc-200 focus:ring-2 focus:ring-rose-400 disabled:opacity-50 ${currentColor}`}
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value} className="bg-white text-zinc-900">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
