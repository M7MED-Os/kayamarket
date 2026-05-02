'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteOrder } from '@/app/actions/order'
import ConfirmModal from '@/components/admin/ConfirmModal'
import toast from 'react-hot-toast'

export default function DeleteOrderButton({ orderId }: { orderId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const result = await deleteOrder(orderId)
    setLoading(false)
    if (result.success) {
      setIsOpen(false)
      toast.success('تم حذف الطلب بنجاح')
    } else {
      toast.error(result.error || 'حدث خطأ أثناء الحذف')
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="حذف الطلب"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        isLoading={loading}
        title="تأكيد حذف الطلب"
        description="هل أنت متأكد من حذف هذا الطلب نهائياً؟ سيتم إزالة كافة بيانات الفاتورة من النظام ولا يمكن التراجع عن هذا الإجراء."
        variant="danger"
        confirmText="نعم، احذف نهائياً"
      />
    </>
  )
}
