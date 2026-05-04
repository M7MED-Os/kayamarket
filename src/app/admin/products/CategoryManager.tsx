'use client'

import { useState, useEffect } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/app/actions/category'
import { Tag, Plus, Edit2, Trash2, X, Loader2, Check, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { uploadImage } from '@/app/actions/storage'
import Image from 'next/image'

export default function CategoryManager({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryFile, setNewCategoryFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingFile, setEditingFile] = useState<File | null>(null)
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null)
  const [isImageRemoved, setIsImageRemoved] = useState(false)
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

    let finalImageUrl = null
    if (newCategoryFile) {
      const formData = new FormData()
      formData.append('file', newCategoryFile)
      formData.append('category', 'categories')
      const uploadRes = await uploadImage(formData)
      if (uploadRes.success && uploadRes.url) {
        finalImageUrl = uploadRes.url
      } else {
        toast.error(uploadRes.error || 'فشل في رفع الصورة')
        setLoading(false)
        return
      }
    }

    const res = await createCategory(newCategoryName, finalImageUrl)
    if (res.success) {
      toast.success('تم إضافة التصنيف بنجاح')
      setNewCategoryName('')
      setNewCategoryFile(null)
      loadCategories()
    } else {
      toast.error(res.error || 'حدث خطأ')
    }
    setLoading(false)
  }

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return
    setLoading(true)

    let finalImageUrl = editingImageUrl
    if (isImageRemoved) {
      finalImageUrl = null
    }
    if (editingFile) {
      const formData = new FormData()
      formData.append('file', editingFile)
      formData.append('category', 'categories')
      const uploadRes = await uploadImage(formData)
      if (uploadRes.success && uploadRes.url) {
        finalImageUrl = uploadRes.url
      } else {
        toast.error(uploadRes.error || 'فشل في رفع الصورة')
        setLoading(false)
        return
      }
    }

    const res = await updateCategory(id, editingName, finalImageUrl)
    if (res.success) {
      toast.success('تم تحديث التصنيف بنجاح')
      setEditingId(null)
      setEditingFile(null)
      setEditingImageUrl(null)
      setIsImageRemoved(false)
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
        <div className="p-4 md:p-8 overflow-y-auto flex-1 space-y-6 md:space-y-8 bg-white">
          {/* Add New Category */}
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-sky-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <h4 className="text-sm font-bold text-slate-700 mb-3 px-1 flex items-center gap-2">
              <Plus className="h-4 w-4 text-sky-500" />
              إضافة قسم جديد
            </h4>
            <div className="flex flex-col sm:flex-row gap-3 relative z-10">
              <div className="flex items-center gap-3 w-full sm:flex-1">
                {/* Image Upload */}
                <div className="relative shrink-0 group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) setNewCategoryFile(e.target.files[0])
                    }} 
                    className="hidden" 
                    id="new-category-image"
                  />
                  <label 
                    htmlFor="new-category-image" 
                    className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all overflow-hidden relative ${newCategoryFile ? 'border-sky-500 shadow-md shadow-sky-100' : 'border-dashed border-slate-300 bg-white hover:border-sky-400'}`}
                  >
                    {newCategoryFile ? (
                      <Image src={URL.createObjectURL(newCategoryFile)} alt="preview" fill className="object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-300 group-hover:text-sky-400 transition-colors" />
                    )}
                  </label>
                  {newCategoryFile && (
                    <button onClick={() => setNewCategoryFile(null)} className="absolute -top-2 -right-2 bg-white text-rose-500 border border-slate-100 rounded-full p-1 shadow-sm hover:scale-110 transition-transform z-10">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                
                {/* Input */}
                <input
                  type="text"
                  placeholder="اسم القسم (مثل: عطور، هدايا...)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 w-full h-12 sm:h-14 rounded-2xl border border-slate-200 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all font-inter bg-white"
                />
              </div>
              
              {/* Button */}
              <button
                onClick={handleCreate}
                disabled={loading || !newCategoryName.trim()}
                className="w-full sm:w-auto h-12 sm:h-14 px-8 bg-sky-500 text-white rounded-2xl font-black text-sm hover:bg-sky-600 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 shrink-0"
              >
                إضافة
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {loading && categories.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm font-medium font-inter">جاري التحميل...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                <p className="text-slate-400 text-sm font-medium font-inter">لا يوجد تصنيفات حالياً</p>
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="group flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 rounded-3xl border border-slate-100 hover:border-sky-100 hover:shadow-md hover:shadow-sky-50/50 bg-white transition-all gap-3 sm:gap-4">
                  {editingId === cat.id ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full bg-slate-50/50 p-2 sm:p-0 sm:bg-transparent rounded-2xl">
                      <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                        {/* Edit Image */}
                        <div className="relative shrink-0">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setEditingFile(e.target.files[0])
                                setIsImageRemoved(false)
                              }
                            }} 
                            className="hidden" 
                            id={`edit-category-image-${cat.id}`}
                          />
                          <label 
                            htmlFor={`edit-category-image-${cat.id}`} 
                            className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border-2 flex items-center justify-center cursor-pointer overflow-hidden relative border-sky-400 bg-sky-50"
                          >
                            {editingFile ? (
                              <Image src={URL.createObjectURL(editingFile)} alt="preview" fill className="object-cover" />
                            ) : editingImageUrl && !isImageRemoved ? (
                              <Image src={editingImageUrl} alt="preview" fill className="object-cover" />
                            ) : (
                              <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500" />
                            )}
                          </label>
                          {(editingFile || (editingImageUrl && !isImageRemoved)) && (
                            <button onClick={() => { setEditingFile(null); setIsImageRemoved(true); }} className="absolute -top-2 -right-2 bg-white text-rose-500 border border-slate-100 rounded-full p-1 shadow-sm hover:scale-110 transition-transform z-10">
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        
                        {/* Edit Input */}
                        <input
                          type="text"
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 w-full h-12 sm:h-14 rounded-2xl border border-sky-200 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 transition-all bg-white shadow-sm"
                        />
                      </div>
                      
                      {/* Edit Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <button onClick={() => handleUpdate(cat.id)} className="flex-1 sm:flex-none h-12 sm:h-14 px-6 bg-emerald-500 text-white hover:bg-emerald-600 rounded-2xl font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm">
                          <Check className="h-5 w-5" />
                          حفظ
                        </button>
                        <button onClick={() => { setEditingId(null); setIsImageRemoved(false); }} className="h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 rounded-2xl transition-all shrink-0">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          {cat.image_url ? (
                            <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-300" />
                          )}
                        </div>
                        <span className="text-sm sm:text-base font-black text-slate-700 font-inter">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingId(cat.id)
                            setEditingName(cat.name)
                            setEditingImageUrl(cat.image_url || null)
                            setEditingFile(null)
                            setIsImageRemoved(false)
                          }}
                          className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all bg-slate-50 sm:bg-transparent"
                        >
                          <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all bg-slate-50 sm:bg-transparent"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>
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
