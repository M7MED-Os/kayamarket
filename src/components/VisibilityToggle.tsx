'use client'

import { useState } from 'react'
import { toggleProductVisibility } from '@/app/admin/actions'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VisibilityToggle({ id, initialValue }: { id: string, initialValue: boolean }) {
  const [isVisible, setIsVisible] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    const result = await toggleProductVisibility(id, !isVisible)
    if (result?.error) {
      toast.error(result.error)
    } else {
      setIsVisible(!isVisible)
      toast.success(isVisible ? 'تم إخفاء المنتج' : 'تم إظهار المنتج')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isVisible ? 'إخفاء المنتج عن العملاء' : 'إظهار المنتج للعملاء'}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
        isVisible 
          ? 'text-green-600 hover:bg-green-100' 
          : 'text-zinc-400 hover:bg-zinc-100'
      } disabled:opacity-50`}
    >
      {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </button>
  )
}
