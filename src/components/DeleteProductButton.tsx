'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function DeleteProductButton({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)
    const { error } = await supabase.from('products').delete().eq('id', id)
    
    if (error) {
      toast.error('حدث خطأ أثناء الحذف: ' + error.message)
      setLoading(false)
    } else {
      toast.success('تم حذف المنتج بنجاح')
      setIsOpen(false)
      router.refresh()
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="حذف المنتج"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => !loading && setIsOpen(false)}
          />
          
          {/* Modal content */}
          <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-2">حذف المنتج؟</h3>
              <p className="text-zinc-500 leading-relaxed px-4">
                هل أنت متأكد من حذف هذا المنتج؟ سيتم إزالته نهائياً من المتجر ولا يمكن التراجع عن هذا القرار.
              </p>
            </div>

            <div className="flex flex-col gap-3 px-4">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full rounded-2xl bg-red-600 py-4 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'جاري الحذف...' : 'نعم، احذف المنتج'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="w-full rounded-2xl bg-zinc-100 py-4 text-sm font-bold text-zinc-600 transition hover:bg-zinc-200 active:scale-95"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
