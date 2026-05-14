'use client'

import { useState } from 'react'
import { deleteProduct } from '@/app/actions/product'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Pencil, Trash2, ExternalLink, AlertTriangle, X, Copy, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProductActionsProps {
  productId: string
  productSlug: string | null
  storeSlug: string | null
}

export default function ProductActions({ productId, productSlug, storeSlug }: ProductActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  // 1. Logic for Editing
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/admin/products/${productId}/edit`)
  }

  // 2. Logic for Deleting
  const performDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteProduct(productId)
      if (res.success) {
        toast.success('تم حذف المنتج بنجاح')
        router.refresh()
        setOpenModal(false)
      } else {
        toast.error(res.error || 'حدث خطأ أثناء الحذف')
      }
    } catch (err) {
      toast.error('خطأ غير متوقع')
    } finally {
      setIsDeleting(false)
    }
  }

  const openDeleteConfirmation = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenModal(true)
  }

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/store/${storeSlug}/products/${productSlug || productId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('تم نسخ رابط المنتج')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <div className="pt-2 flex items-center justify-between mt-auto">
        <div className="flex gap-1">
          {/* Edit Button */}
          <button
            type="button"
            onClick={handleEdit}
            className="p-2.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all active:scale-90"
            title="تعديل"
          >
            <Pencil className="h-5 w-5" strokeWidth={2} />
          </button>

          {/* New Delete Button */}
          <button
            type="button"
            onClick={openDeleteConfirmation}
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
            title="حذف"
          >
            <Trash2 className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {storeSlug && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyLink}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-90 flex items-center gap-1 text-[11px] font-black"
              title="نسخ الرابط"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <Link
              href={`/store/${storeSlug}/products/${productSlug || productId}`}
              target="_blank"
              className="text-slate-400 hover:text-sky-600 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 text-[11px] font-black font-inter"
            >
              معاينة
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      {/* ─── Premium Delete Modal (SCRATCH REWRITE) ─── */}
      {openModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300"
          style={{ zIndex: 10000 }}
          onClick={() => !isDeleting && setOpenModal(false)}
        >
          <div 
            className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header/Icon */}
            <div className="relative p-8 pb-0 text-center">
               <button 
                onClick={() => setOpenModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
               >
                 <X className="h-5 w-5" />
               </button>
               <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <AlertTriangle className="h-10 w-10" />
               </div>
            </div>

            {/* Modal Body */}
            <div className="px-10 pb-10 text-center">
              <h3 className="text-2xl font-black text-slate-900 mb-3 font-inter tracking-tight">حذف المنتج؟</h3>
              <p className="text-slate-500 font-bold text-sm leading-relaxed mb-10">
                أنت على وشك حذف هذا المنتج نهائياً من المتجر. هل أنت متأكد من هذا الإجراء؟
              </p>

              <div className="flex flex-col gap-3">
                <button
                  disabled={isDeleting}
                  onClick={performDelete}
                  className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-base hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-5 w-5" />
                      تأكيد الحذف النهائي
                    </>
                  )}
                </button>
                <button
                  disabled={isDeleting}
                  onClick={() => setOpenModal(false)}
                  className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-base hover:bg-slate-100 transition-all active:scale-95"
                >
                  تراجع
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
