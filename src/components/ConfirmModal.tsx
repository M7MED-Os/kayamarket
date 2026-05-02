'use client'

import { AlertTriangle, X, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger'
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      shadow: 'shadow-red-100'
    },
    warning: {
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      shadow: 'shadow-amber-100'
    },
    info: {
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-500',
      buttonBg: 'bg-sky-600 hover:bg-sky-700',
      shadow: 'shadow-sky-100'
    }
  }

  const style = variantStyles[variant]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" dir="rtl">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onCancel}
      />
      
      {/* Modal Card */}
      <div className={`relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl ${style.shadow} p-8 md:p-10 animate-in zoom-in-95 fade-in duration-300 border border-white`}>
        <button 
          onClick={onCancel}
          className="absolute left-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`h-20 w-20 ${style.iconBg} rounded-[2rem] flex items-center justify-center mb-6`}>
            <AlertTriangle className={`h-10 w-10 ${style.iconColor}`} />
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
            {title}
          </h2>
          
          <p className="text-slate-500 font-bold leading-relaxed mb-10 px-4">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 ${style.buttonBg} text-white h-14 rounded-2xl font-black shadow-lg shadow-zinc-200 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2`}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : confirmText}
            </button>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-slate-100 text-slate-600 h-14 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
