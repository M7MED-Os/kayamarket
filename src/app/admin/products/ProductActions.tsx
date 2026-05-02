'use client'

import { useState } from 'react'
import { deleteProduct } from '@/app/actions/product'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Pencil, Trash2, ExternalLink, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProductActionsProps {
  productId: string
  storeSlug: string | null
}

export default function ProductActions({ productId, storeSlug }: ProductActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const router = useRouter()

  const confirmDelete = async () => {
    setIsDeleting(true)
    const res = await deleteProduct(productId)

    if (res.success !== false) { // Assuming deleteProduct doesn't return success explicitly on success, but doesn't return error
      toast.success('تم حذف المنتج بنجاح')
      router.refresh()
    } else {
      toast.error(res.error || 'حدث خطأ أثناء الحذف')
    }
    setIsDeleting(false)
    setShowDeleteModal(false)
  }

  return (
    <>
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="flex gap-1.5">
          <Link
            href={`/admin/products/${productId}/edit`}
            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 border border-transparent hover:border-sky-100 rounded-lg transition-all"
            title="تعديل المنتج"
          >
            <Pencil className="h-4 w-4" strokeWidth={2.5} />
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all disabled:opacity-50"
            title="حذف المنتج"
          >
            {isDeleting ? (
              <div className="h-4 w-4 border-2 border-rose-600 border-t-transparent animate-spin rounded-full" />
            ) : (
              <Trash2 className="h-4 w-4" strokeWidth={2.5} />
            )}
          </button>
        </div>

        {storeSlug && (
          <Link
            href={`/store/${storeSlug}/products/${productId}`}
            target="_blank"
            className="text-slate-500 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold font-inter"
          >
            معاينة
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Modern Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <AlertTriangle className="h-8 w-8" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins mb-2">حذف المنتج نهائياً؟</h3>
              <p className="text-slate-500 font-inter text-sm mb-6">
                هل أنت متأكد من رغبتك في حذف هذا المنتج؟ سيتم مسحه من متجرك ولن يظهر للعملاء بعد الآن.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold font-inter hover:bg-slate-50 transition-colors"
                >
                  تراجع
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-xl font-bold font-inter hover:bg-rose-600 transition-colors shadow-sm shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <span className="animate-pulse">جاري الحذف...</span>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      تأكيد الحذف
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
