'use client'

import { useState, useEffect } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/app/actions/category'
import { Tag, Plus, Edit2, Trash2, X, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmModal from '@/components/admin/ConfirmModal'

export default function CategoryManager({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  const loadCategories = async () => {
    setLoading(true)
    const res = await getCategories()
    if (res.success) {
      setCategories(res.data || [])
    }
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return
    setLoading(true)
    const res = await createCategory(newCategoryName)
    if (res.success) {
      toast.success('تم إضافة التصنيف بنجاح')
      setNewCategoryName('')
      loadCategories()
    } else {
      toast.error(res.error || 'حدث خطأ')
    }
    setLoading(false)
  }

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return
    setLoading(true)
    const res = await updateCategory(id, editingName)
    if (res.success) {
      toast.success('تم تحديث التصنيف بنجاح')
      setEditingId(null)
      loadCategories()
    } else {
      toast.error(res.error || 'حدث خطأ')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    setDeleteId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setLoading(true)
    const res = await deleteCategory(deleteId)
    setLoading(false)
    setIsDeleteModalOpen(false)
    setDeleteId(null)
    
    if (res.success) {
      toast.success('تم حذف التصنيف بنجاح')
      loadCategories()
    } else {
      toast.error(res.error || 'حدث خطأ')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-poppins">إدارة التصنيفات</h3>
              <p className="text-xs text-slate-500 font-inter">تحكم في قائمة التصنيفات الخاصة بمنتجاتك</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Add New Category */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="اسم التصنيف الجديد..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50 transition-all font-inter"
            />
            <button
              onClick={handleCreate}
              disabled={loading || !newCategoryName.trim()}
              className="px-4 py-2.5 bg-sky-500 text-white rounded-xl font-bold text-sm hover:bg-sky-600 transition-all shadow-sm shadow-sky-500/20 disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              إضافة
            </button>
          </div>

          {/* List */}
          <div className="space-y-2">
            {loading && categories.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm font-medium font-inter">جاري التحميل...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-slate-400 text-sm font-medium font-inter">لا يوجد تصنيفات حالياً</p>
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-sky-100 hover:bg-sky-50/30 transition-all">
                  {editingId === cat.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 rounded-lg border border-sky-200 px-3 py-1 text-sm outline-none bg-white"
                      />
                      <button onClick={() => handleUpdate(cat.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-slate-700 font-inter">{cat.name}</span>
                      <div className="flex items-center gap-1 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(cat.id)
                            setEditingName(cat.name)
                          }}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-white rounded-lg transition-colors shadow-sm"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors shadow-sm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={loading}
        title="حذف التصنيف"
        description="هل أنت متأكد من حذف هذا التصنيف؟ لا يمكن التراجع عن هذا الإجراء."
        variant="danger"
        confirmText="نعم، احذف"
      />
    </div>
  )
}
