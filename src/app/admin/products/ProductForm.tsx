'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct } from '@/app/actions/product'
import { uploadImage } from '@/app/actions/storage'
import toast from 'react-hot-toast'
import { Save, Tag, Package, Calendar, Layers, X, Trash2, Plus, Info, Image as ImageIcon, Eye, EyeOff, Sparkles, Palette, Maximize2 } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

import { PlanTier, PLAN_CONFIG, PlanLimits } from '@/lib/subscription'
import UpgradeModal from '@/components/UpgradeModal'

export default function ProductForm({ initialData, plan = 'starter', config }: { initialData?: any, plan?: PlanTier, config?: PlanLimits }) {
  const currentConfig = config || PLAN_CONFIG[plan] || PLAN_CONFIG.starter
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, name: '', value: '' as any })
  const isEditing = !!initialData

  // --- Presets ---
  const SIZE_PRESETS = {
    CLOTHES: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    PANTS: ['28', '30', '32', '34', '36', '38', '40'],
    SHOES: ['37', '38', '39', '40', '41', '42', '43', '44', '45']
  }

  const COLOR_PRESETS = [
    { name: 'أسود', hex: '#000000' },
    { name: 'أبيض', hex: '#FFFFFF' },
    { name: 'سكري', hex: '#F5F5F5' },
    { name: 'رمادي', hex: '#808080' },
    { name: 'سيلفر', hex: '#C0C0C0' },
    { name: 'نبيتي', hex: '#800000' },
    { name: 'أحمر', hex: '#FF0000' },
    { name: 'سيمون', hex: '#FFA07A' },
    { name: 'وردي', hex: '#FFC0CB' },
    { name: 'فوشيا', hex: '#FF00FF' },
    { name: 'بني', hex: '#4b3621' },
    { name: 'هافان', hex: '#8B4513' },
    { name: 'كافيه', hex: '#a38068' },
    { name: 'بيج', hex: '#f5f5dc' },
    { name: 'جولد', hex: '#FFD700' },
    { name: 'مستردة', hex: '#e1ad01' },
    { name: 'أصفر', hex: '#FFFF00' },
    { name: 'ليموني', hex: '#CCFF00' },
    { name: 'أخضر', hex: '#008000' },
    { name: 'مينت جرين', hex: '#98FF98' },
    { name: 'زيتوني', hex: '#556b2f' },
    { name: 'بترولي', hex: '#005f6b' },
    { name: 'جنزاري', hex: '#008080' },
    { name: 'فيروزي', hex: '#40E0D0' },
    { name: 'أزرق', hex: '#0000FF' },
    { name: 'كحلي', hex: '#000080' },
    { name: 'لبني', hex: '#87CEEB' },
    { name: 'بنفسجي', hex: '#800080' },
    { name: 'موف فاتح', hex: '#E6E6FA' },
    { name: 'برتقالي', hex: '#FFA500' },
  ]

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
    variants: initialData?.variants || [] as any[],
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
      form.append('variants', JSON.stringify(formData.variants))

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
    <form onSubmit={handleSubmit} className="w-full max-w-full space-y-6 animate-in fade-in duration-700" dir="rtl">

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main Content Column */}
        <div className="xl:col-span-8 space-y-6">

          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center">
                  <Tag className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 tracking-tight">البيانات الأساسية</h2>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-1">اسم المنتج</label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none"
                    placeholder="مثال: ساعة ذكية أبل الجيل الثامن"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-1">وصف المنتج <span className="text-[10px] text-slate-300 font-medium">(اختياري)</span></label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:bg-white focus:border-sky-500 transition-all outline-none resize-none leading-relaxed"
                    placeholder="اكتب وصفاً جذاباً يتضمن أهم مميزات المنتج..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-1">التصنيف</label>
                  {isAddingCategory ? (
                    <div className="flex gap-2">
                      <input
                        required
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="flex-1 h-11 border-2 border-sky-500 rounded-xl px-4 text-sm font-bold outline-none shadow-sm"
                        autoFocus
                      />
                      <button type="button" onClick={() => setIsAddingCategory(false)} className="px-3 text-[10px] font-bold text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">إلغاء</button>
                    </div>
                  ) : (
                    <div className="relative group">
                      <select
                        required
                        name="category"
                        value={formData.category}
                        onChange={(e) => e.target.value === 'NEW' ? (setIsAddingCategory(true), setFormData(p => ({ ...p, category: '' }))) : handleChange(e)}
                        className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-sky-500 transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="الكل">الكل</option>
                        {availableCategories.filter((c: any) => c.name !== 'الكل' && c.name !== 'عام').map((cat: any) => (
                          <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                        <option value="NEW" className="text-sky-600 font-bold italic bg-sky-50 text-[10px]">+ إضافة تصنيف جديد</option>
                      </select>
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 pointer-events-none group-focus-within:text-sky-500 transition-colors" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-1">المخزون المتوفر <span className="text-[10px] text-slate-300 font-medium">(اختياري)</span></label>
                  <div className="relative group">
                    <input
                      type="number"
                      min="0"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="غير محدود (∞)"
                      className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-10 text-sm font-bold focus:bg-white focus:border-sky-500 transition-all outline-none"
                    />
                    <Package className="absolute right-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Promotion */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2.5 bg-slate-50/30">
              <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">التسعير والعروض</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-1">سعر البيع</label>
                  <div className="relative group">
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full h-11 bg-emerald-50/30 border border-emerald-100 rounded-xl px-12 text-base font-bold text-emerald-700 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-400">ج.م</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-1">السعر الأصلي <span className="text-[10px] text-slate-300 font-medium">(اختياري)</span></label>
                  <div className="relative group">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="original_price"
                      value={formData.original_price}
                      onChange={handleChange}
                      className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-400 focus:bg-white transition-all outline-none"
                      placeholder="اختياري..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-1">نهاية العرض <span className="text-[10px] text-slate-300 font-medium">(اختياري)</span></label>
                  <div className="relative group">
                    <input
                      type="datetime-local"
                      name="sale_end_date"
                      value={formData.sale_end_date}
                      onChange={handleChange}
                      className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-4 text-[10px] font-bold focus:bg-white focus:border-rose-500 transition-all outline-none cursor-pointer"
                    />
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Variants */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1 px-2">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">إدارة المتغيرات</h3>
                <div className="h-px w-12 bg-slate-200" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">أضف الخيارات بسهولة</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-2xl">
                استخدم هذا القسم فقط إذا كان منتجك يتوفر بمواصفات متعددة (مثل الملابس، الأحذية، إلخ). يمكنك إضافة ألوان ومقاسات معاً، أو الاكتفاء بإضافة مقاسات فقط لهذا المنتج.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type 1 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Palette className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">الألوان والمقاسات</h4>
                    <p className="text-[9px] text-slate-400 font-medium">للمنتجات ذات الألوان المتعددة</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-5 pt-1">
                  {COLOR_PRESETS.map((cp, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{cp.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.variants.some((v: any) => v.hex === cp.hex)) {
                            toast.error(`اللون ${cp.name} مضاف بالفعل`)
                            return
                          }
                          setFormData(prev => ({ ...prev, variants: [...prev.variants, { color: cp.name, hex: cp.hex, sizes: [] }] }))
                          toast.success(`تم إضافة ${cp.name}`, { icon: '🎨' })
                        }}
                        className="h-7 w-7 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100 transition-all hover:scale-110 active:scale-95"
                        style={{ backgroundColor: cp.hex }}
                        title={cp.name}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Type 2 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 transition-all hover:shadow-md flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Maximize2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">المقاسات فقط</h4>
                    <p className="text-[9px] text-slate-400 font-medium">لون واحد ومقاسات مختلفة</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.variants.some((v: any) => v.color === 'مقاسات المنتج')) {
                      toast.error('تم إضافة قسم المقاسات بالفعل')
                      return
                    }
                    setFormData(prev => ({ ...prev, variants: [...prev.variants, { color: 'مقاسات المنتج', hex: '#f8fafc', sizes: [] }] }))
                    toast.success('تم إضافة قسم المقاسات', { icon: '📏' })
                  }}
                  className="w-full flex-1 border-2 border-dashed border-slate-100 rounded-xl text-[10px] font-bold text-slate-400 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50/20 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="h-3.5 w-3.5" /> إضافة جدول مقاسات
                </button>
              </div>
            </div>

            {/* List */}
            {formData.variants.length > 0 && (
              <div className="space-y-4 mt-6">
                {formData.variants.map((v: any, colorIdx: number) => (
                  <div key={colorIdx} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden group/v">
                    <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg border-2 border-white shadow-sm" style={{ backgroundColor: v.hex }} />
                        <span className="text-[11px] font-bold text-slate-700">{v.color}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {['CLOTHES', 'PANTS', 'SHOES'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                const newVariants = [...formData.variants]
                                newVariants[colorIdx].sizes = (SIZE_PRESETS as any)[type].map((s: string) => ({ size: s, stock: 10, price_override: '' }))
                                setFormData(prev => ({ ...prev, variants: newVariants }))
                              }}
                              className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[8px] font-bold text-slate-500 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            >
                              {type === 'CLOTHES' ? '👕 ملابس' : type === 'PANTS' ? '👖 بناطيل' : '👟 أحذية'}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, variants: prev.variants.filter((_: any, i: number) => i !== colorIdx) }))}
                          className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {v.sizes.map((s: any, sizeIdx: number) => (
                          <div key={sizeIdx} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-1.5 pr-2.5 group/s relative">
                            <input
                              type="text"
                              value={s.size}
                              onChange={(e) => {
                                const newVariants = [...formData.variants]
                                newVariants[colorIdx].sizes[sizeIdx].size = e.target.value
                                setFormData(prev => ({ ...prev, variants: newVariants }))
                              }}
                              className="w-10 bg-transparent border-none text-[10px] font-bold text-slate-700 outline-none p-0 h-auto"
                            />
                            <div className="h-3 w-px bg-slate-200" />
                            <input
                              type="number"
                              value={s.stock}
                              onChange={(e) => {
                                const newVariants = [...formData.variants]
                                newVariants[colorIdx].sizes[sizeIdx].stock = Number(e.target.value)
                                setFormData(prev => ({ ...prev, variants: newVariants }))
                              }}
                              className="w-8 bg-transparent border-none text-[10px] font-bold text-sky-600 text-center outline-none p-0 h-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="0"
                            />
                            <div className="h-3 w-px bg-slate-200" />
                            <input
                              type="number"
                              value={s.price_override}
                              onChange={(e) => {
                                const newVariants = [...formData.variants]
                                newVariants[colorIdx].sizes[sizeIdx].price_override = e.target.value
                                setFormData(prev => ({ ...prev, variants: newVariants }))
                              }}
                              className="w-12 bg-transparent border-none text-[10px] font-bold text-emerald-600 text-center outline-none p-0 h-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="سعر"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newVariants = [...formData.variants]
                                newVariants[colorIdx].sizes = newVariants[colorIdx].sizes.filter((_: any, i: number) => i !== sizeIdx)
                                setFormData(prev => ({ ...prev, variants: newVariants }))
                              }}
                              className="text-rose-400 hover:text-rose-600"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newVariants = [...formData.variants]
                            newVariants[colorIdx].sizes.push({ size: 'جديد', stock: 10, price_override: '' })
                            setFormData(prev => ({ ...prev, variants: newVariants }))
                          }}
                          className="h-8 px-2.5 border border-dashed border-slate-200 rounded-xl text-[9px] font-bold text-slate-400 hover:border-sky-500 hover:text-sky-600 transition-all"
                        >
                          + مقاس
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-4 space-y-6 sticky top-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-50 bg-slate-50/30 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-slate-400" />
              <h2 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">إدارة الصور</h2>
            </div>

            <div className="p-5 space-y-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">الرئيسية</label>
                </div>
                <ImageUpload
                  category="products"
                  mode="manual"
                  currentUrl={pendingMainFile ? URL.createObjectURL(pendingMainFile) : formData.image_url}
                  onUploadSuccess={() => { }}
                  onFileSelect={(file) => setPendingMainFile(file)}
                />
              </div>

              <div className="space-y-3 pt-5 border-t border-slate-50">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">المعرض</label>
                  <span className="text-[10px] font-bold text-slate-400">{formData.images.length + pendingGalleryFiles.length} / {currentConfig.maxImagesPerProduct - 1}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {formData.images.map((url: string, idx: number) => (
                    <div key={`exist-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-100 shadow-sm">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_: any, i: number) => i !== idx) }))} className="absolute inset-0 bg-rose-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3.5 w-3.5 text-white" /></button>
                    </div>
                  ))}
                  {pendingGalleryFiles.map((p) => (
                    <div key={`pending-${p.id}`} className="relative aspect-square border-2 border-dashed border-sky-200 bg-sky-50 rounded-xl overflow-hidden group">
                      <img src={URL.createObjectURL(p.file)} alt="" className="w-full h-full object-cover opacity-60" />
                      <button type="button" onClick={() => setPendingGalleryFiles(prev => prev.filter(f => f.id !== p.id))} className="absolute inset-0 bg-rose-500/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3.5 w-3.5 text-white" /></button>
                    </div>
                  ))}
                  {(formData.images.length + pendingGalleryFiles.length) < (currentConfig.maxImagesPerProduct - 1) && (
                    <ImageUpload
                      category="products"
                      variant="compact"
                      mode="manual"
                      onUploadSuccess={() => { }}
                      onFileSelect={(file) => setPendingGalleryFiles(prev => [...prev, { file, id: Math.random().toString(36) }])}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${formData.is_visible ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                  {formData.is_visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">حالة الظهور</h4>
                  <p className="text-[10px] text-slate-400 font-medium">{formData.is_visible ? 'مرئي للعملاء' : 'مخفي حالياً'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                className={`h-7 w-12 rounded-full relative transition-all p-1 ${formData.is_visible ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-all transform ${formData.is_visible ? 'translate-x-0' : '-translate-x-5'}`} />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-100 hover:bg-sky-600 hover:shadow-sky-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 group"
            >
              {loading ? <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />}
              <span className="text-sm">حفظ المنتج</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>آخر تحديث</span>
              <span>{isEditing ? 'منذ قليل' : 'الآن'}</span>
            </div>
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 w-full" />
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={() => setUpgradeModal(prev => ({ ...prev, isOpen: false }))} limitName={upgradeModal.name} limitValue={upgradeModal.value} />
    </form>
  )
}
