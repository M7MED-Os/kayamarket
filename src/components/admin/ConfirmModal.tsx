'use client'

import { AlertTriangle, X, Loader2 } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: 'danger' | 'warning' | 'primary'
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  isLoading = false,
  variant = 'primary'
}: ConfirmModalProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100',
    primary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-100'
  }

  const iconStyles = {
    danger: 'bg-rose-50 text-rose-600',
    warning: 'bg-amber-50 text-amber-600',
    primary: 'bg-slate-50 text-slate-600'
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-zinc-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500"
        dir="rtl"
      >
        <div className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${iconStyles[variant]}`}>
              <AlertTriangle className="h-7 w-7" />
            </div>
            <button 
              onClick={onClose}
              className="h-10 w-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3 mb-10">
            <h3 className="text-2xl font-black text-zinc-900 leading-tight">
              {title}
            </h3>
            <p className="text-zinc-500 font-bold leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 h-14 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${variantStyles[variant]}`}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {confirmText}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-14 rounded-2xl font-black text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-zinc-100 transition-all active:scale-95"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
