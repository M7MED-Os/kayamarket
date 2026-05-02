'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct } from '@/app/actions/product'
import { uploadImage } from '@/app/actions/storage'
import toast from 'react-hot-toast'
import { Save, Tag, Package, Calendar, Layers, X, Trash2, Plus, Info, Image as ImageIcon, Eye, EyeOff, Sparkles } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

import { PlanTier, PLAN_CONFIG, PlanLimits } from '@/lib/subscription'
import UpgradeModal from '@/components/UpgradeModal'

export default function ProductForm({ initialData, plan = 'starter', config }: { initialData?: any, plan?: PlanTier, config?: PlanLimits }) {
  const currentConfig = config || PLAN_CONFIG[plan] || PLAN_CONFIG.starter
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, name: '', value: '' as any })
  const isEditing = !!initialData

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    original_price: initialData?.original_price?.toString() || '',
    stock: initialData?.stock !== null && initialData?.stock !== undefined ? initialData.stock.toString() : '',
    category: initialData?.category || 'الكل',
    image_url: initialData?.image_url || '',
    images: initialData?.images || [],
    is_visible: initialData?.is_visible !== undefined ? initialData.is_visible : true,
    sale_end_date: initialData?.sale_end_date ? new Date(initialData.sale_end_date).toISOString().slice(0, 16) : '',
  })

  const [pendingMainFile, setPendingMainFile] = useState<File | null>(null)
  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<{ file: File, id: string }[]>([])

  const [availableCategories, setAvailableCategories] = useState<any[]>([])
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  useEffect(() => {
    import('@/app/actions/category').then(mod => {
      mod.getCategories().then(res => {
        if (res.success) setAvailableCategories(res.data || [])
      })
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleToggle = () => {
    setFormData(prev => ({ ...prev, is_visible: !prev.is_visible }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalImageUrl = formData.image_url
      let finalGalleryUrls = [...formData.images]

      if (pendingMainFile) {
        const mainFormData = new FormData()
        mainFormData.append('file', pendingMainFile)
        mainFormData.append('category', 'products')
        const res = await uploadImage(mainFormData)
        if (res.success && res.url) finalImageUrl = res.url
      }

      if (pendingGalleryFiles.length > 0) {
        const uploadPromises = pendingGalleryFiles.map(async (p) => {
          const galleryFormData = new FormData()
          galleryFormData.append('file', p.file)
          galleryFormData.append('category', 'products')
          const res = await uploadImage(galleryFormData)
          return res.success ? res.url : null
        })
        const uploadedUrls = await Promise.all(uploadPromises)
        finalGalleryUrls = [...finalGalleryUrls, ...uploadedUrls.filter(url => url !== null) as string[]]
      }

      const form = new FormData()
      form.append('name', formData.name)
      form.append('description', formData.description)
      form.append('price', formData.price)
      if (formData.original_price) form.append('original_price', formData.original_price)
      if (formData.stock) form.append('stock', formData.stock)
      if (formData.category) form.append('category', formData.category)
      form.append('image_url', finalImageUrl)
      form.append('images', JSON.stringify(finalGalleryUrls))
      if (formData.sale_end_date) form.append('sale_end_date', formData.sale_end_date)
      form.append('is_visible', String(formData.is_visible))

      let res
      if (isEditing) {
        res = await updateProduct(initialData.id, form)
      } else {
        res = await createProduct(form)
      }

      if (res.success) {
        toast.success(isEditing ? 'تم التحديث' : 'تمت الإضافة')
        router.push('/admin/products')
      } else {
        if (res.code === 'LIMIT_REACHED' || res.code === 'IMAGE_LIMIT_REACHED') {
          setUpgradeModal({ isOpen: true, name: res.code === 'LIMIT_REACHED' ? 'المنتجات' : 'الصور', value: res.limit })
        } else {
          toast.error(res.error || 'خطأ في الحفظ')
        }
      }
    } catch (err: any) {
      toast.error('حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-full space-y-8 animate-in fade-in duration-500" dir="rtl">

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

        {/* Right: Primary Data (8 cols) */}
        <div className="xl:col-span-8 space-y-8">

          {/* Basic Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <Tag className="h-5 w-5 text-sky-500" />
              <h2 className="text-lg font-black text-slate-800 font-inter">البيانات الأساسية</h2>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">اسم المنتج</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-14 bg-slate-50/50 border border-slate-200 rounded-2xl px-6 text-base font-black focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none"
                  placeholder="مثال: ساعة ذكية أبل"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">التصنيف</label>
                  <div className="flex gap-2">
                    {isAddingCategory ? (
                      <div className="flex-1 flex gap-2 animate-in slide-in-from-right-2">
                        <input
                          required
                          type="text"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="flex-1 h-14 border-2 border-sky-500 rounded-2xl px-5 text-base font-black outline-none shadow-lg shadow-sky-50"
                          autoFocus
                        />
                        <button type="button" onClick={() => setIsAddingCategory(false)} className="px-4 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">إلغاء</button>
                      </div>
                    ) : (
                      <div className="relative flex-1 group">
                        <select
                          required
                          name="category"
                          value={formData.category}
                          onChange={(e) => e.target.value === 'NEW' ? (setIsAddingCategory(true), setFormData(p => ({ ...p, category: '' }))) : handleChange(e)}
                          className="w-full h-14 bg-slate-50/50 border border-slate-200 rounded-2xl px-6 text-base font-black focus:bg-white focus:border-sky-500 transition-all outline-none appearance-none cursor-pointer"
                        >
                          <option value="الكل">الكل</option>
                          {availableCategories.filter((c: any) => c.name !== 'الكل' && c.name !== 'عام').map((cat: any) => (
                            <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                          ))}
                          <option value="NEW" className="text-sky-600 font-black italic bg-sky-50">+ إضافة تصنيف جديد</option>
                        </select>
                        <Layers className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none group-focus-within:text-sky-500 transition-colors" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">المخزون (الكمية)</label>
                  <div className="relative group">
                    <input
                      type="number"
                      min="0"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="غير محدود (∞)"
                      className="w-full h-14 bg-slate-50/50 border border-slate-200 rounded-2xl px-6 text-base font-black focus:bg-white focus:border-sky-500 transition-all outline-none"
                    />
                    <Package className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-sky-500 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">وصف المنتج</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-8 text-base font-bold focus:bg-white focus:border-sky-500 transition-all outline-none resize-none leading-relaxed"
                  placeholder="اشرح مميزات منتجك هنا لجذب المشترين..."
                />
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="h-6 w-6 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-lg font-black text-xs">$</div>
              <h2 className="text-lg font-black text-slate-800 font-inter">التسعير والعروض</h2>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">سعر البيع الحالي</label>
                  <div className="relative group">
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full h-18 bg-emerald-50/20 border border-emerald-100 rounded-2xl px-14 text-2xl font-black text-emerald-600 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-400">ج.م</span>
                    <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">السعر الأصلي (قبل الخصم)</label>
                  <div className="relative group">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="original_price"
                      value={formData.original_price}
                      onChange={handleChange}
                      className={`w-full h-18 bg-slate-50/50 border border-slate-200 rounded-2xl px-6 text-xl font-black transition-all outline-none ${formData.original_price ? 'text-slate-400 line-through' : 'text-slate-300'}`}
                      placeholder="اختياري..."
                    />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-200 uppercase tracking-tighter">Offer Price</div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-rose-500" />
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">تاريخ انتهاء الخصم (اختياري)</label>
                </div>
                <input
                  type="datetime-local"
                  name="sale_end_date"
                  value={formData.sale_end_date}
                  onChange={handleChange}
                  className="w-full h-14 bg-slate-50/50 border border-slate-200 rounded-2xl px-8 text-base font-black focus:bg-white focus:border-rose-500 transition-all outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Left: Media (4 cols) */}
        <div className="xl:col-span-4 space-y-8 sticky top-12">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-black text-slate-800 font-inter">إدارة الصور</h2>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-1">الصورة الرئيسية</label>
                  <div className="flex items-center gap-1.5 text-sky-500 bg-sky-50 px-3 py-1 rounded-full text-[9px] font-black">
                    <Sparkles className="h-3 w-3" /> جودة عالية
                  </div>
                </div>
                <ImageUpload
                  category="products"
                  mode="manual"
                  currentUrl={pendingMainFile ? URL.createObjectURL(pendingMainFile) : formData.image_url}
                  onUploadSuccess={() => { }}
                  onFileSelect={(file) => setPendingMainFile(file)}
                />
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-50">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">معرض الصور</label>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    {formData.images.length + pendingGalleryFiles.length} / {currentConfig.maxImagesPerProduct - 1}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {/* Existing Images */}
                  {formData.images.map((url: string, idx: number) => (
                    <div key={`exist-${idx}`} className="relative aspect-square border border-slate-100 rounded-xl overflow-hidden group shadow-sm">
                      <img src={url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_: any, i: number) => i !== idx) }))} className="absolute inset-0 bg-rose-600/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-5 w-5 text-white" /></button>
                    </div>
                  ))}

                  {/* Pending Previews (FIXED) */}
                  {pendingGalleryFiles.map((p) => (
                    <div key={`pending-${p.id}`} className="relative aspect-square border-2 border-dashed border-sky-400 bg-sky-50/20 rounded-xl overflow-hidden group shadow-sm">
                      <img src={URL.createObjectURL(p.file)} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all" />
                      <button type="button" onClick={() => setPendingGalleryFiles(prev => prev.filter(f => f.id !== p.id))} className="absolute inset-0 bg-rose-600/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-5 w-5 text-white" /></button>
                    </div>
                  ))}

                  {/* Add Button */}
                  {(formData.images.length + pendingGalleryFiles.length) < (currentConfig.maxImagesPerProduct - 1) && (
                    <div className="aspect-square">
                      <ImageUpload
                        category="products"
                        variant="compact"
                        mode="manual"
                        onUploadSuccess={() => { }}
                        onFileSelect={(file) => setPendingGalleryFiles(prev => [...prev, { file, id: Math.random().toString(36) }])}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Image Guidelines Card */}
              <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-start gap-4">

                <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-900">نصائح احترافية للصور:</h4>
                  <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                    استخدم صوراً **مربعة (1:1)** بدقة لا تقل عن **800x800** بكسل وخلفية فاتحة للحصول على أفضل مظهر في متجرك.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visibility Status Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex items-center justify-between transition-all hover:border-emerald-100 group">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${formData.is_visible ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-300'}`}>
                {formData.is_visible ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">ظهور المنتج</span>
                <span className="text-[10px] font-bold text-slate-400">{formData.is_visible ? 'مرئي للجميع' : 'مخفي حالياً'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className={`h-8 w-14 rounded-full relative transition-all duration-500 p-1 ${formData.is_visible ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-200'}`}
            >
              <div className={`h-6 w-6 rounded-full bg-white shadow-sm transition-all transform ${formData.is_visible ? 'translate-x-0' : '-translate-x-6'}`} />
            </button>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-18 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl shadow-slate-100 hover:bg-sky-600 hover:shadow-sky-100 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 group"
          >
            {loading ? <div className="h-7 w-7 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="h-6 w-6 group-hover:scale-110 transition-transform" />}
            <span className="text-lg">حفظ التغييرات</span>
          </button>
        </div>
      </div>

      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={() => setUpgradeModal(prev => ({ ...prev, isOpen: false }))} limitName={upgradeModal.name} limitValue={upgradeModal.value} />
    </form>
  )
}
