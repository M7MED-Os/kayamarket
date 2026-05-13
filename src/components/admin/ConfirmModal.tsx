'use client'

import { AlertTriangle, X, Loader2, Check, Trash2, Info } from 'lucide-react'

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
    danger: 'bg-rose-50 text-rose-600 border-rose-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    primary: 'bg-sky-50 text-sky-600 border-sky-100'
  }

  const Icon = variant === 'danger' ? Trash2 : (variant === 'warning' ? AlertTriangle : Info)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[2rem] w-full max-w-[340px] overflow-hidden shadow-2xl border border-zinc-100 animate-in zoom-in-95 duration-300"
        dir="rtl"
      >
        <div className="p-6 text-center">
          <div className="flex flex-col items-center">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border mb-4 ${iconStyles[variant]}`}>
              <Icon className="h-6 w-6" />
            </div>

            <div className="space-y-2 mb-8">
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-slate-400 font-bold leading-relaxed text-xs">
                {description}
              </p>
            </div>

            <div className="flex flex-col w-full gap-2">
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`h-12 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${variantStyles[variant]}`}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {confirmText}
              </button>
              
              <button
                onClick={onClose}
                disabled={isLoading}
                className="h-12 rounded-xl font-black text-xs text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
