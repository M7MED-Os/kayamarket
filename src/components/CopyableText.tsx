'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CopyableText({ text, label }: { text: string, label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(`تم نسخ ${label || 'النص'} بنجاح`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="group relative flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-rose-50 active:scale-95"
      title="اضغط للنسخ"
    >
      <span className="font-bold text-zinc-900">{text}</span>
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4 text-zinc-400 group-hover:text-rose-500 transition-colors" />
      )}
    </button>
  )
}
