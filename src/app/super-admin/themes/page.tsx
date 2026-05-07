'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  Palette, Plus, Shield, Check, Info,
  ExternalLink, Lock, Eye, Settings2, Trash2, 
  EyeOff, Loader2, Save, ArrowRightLeft, AlertTriangle, X
} from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/ImageUpload'
import { getPlatformThemes, updateThemeSettings, disableThemeAndMigrate } from '@/app/actions/platform-themes'
import { getPlanName } from '@/lib/subscription'

export default function ThemesPage() {
  const [themes, setThemes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [editingTheme, setEditingTheme] = useState<any>(null)
  const [migrationTheme, setMigrationTheme] = useState<any>(null)

  useEffect(() => {
    fetchThemes()
  }, [])

  async function fetchThemes() {
    setLoading(true)
    try {
      const data = await getPlatformThemes()
      setThemes(data)
    } catch (err) {
      toast.error('فشل في جلب الثيمات')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: string, updates: any) => {
    startTransition(async () => {
      try {
        await updateThemeSettings(id, updates)
        toast.success('تم تحديث إعدادات الثيم')
        setEditingTheme(null)
        fetchThemes()
      } catch (err) {
        toast.error('فشل في التحديث')
      }
    })
  }

  const handleMigration = async (themeId: string, fallbackId: string) => {
    if (!confirm('هل أنت متأكد؟ سيتم تعطيل هذا الثيم ونقل جميع المشتركين فيه للثيم الجديد.')) return
    
    startTransition(async () => {
      try {
        await disableThemeAndMigrate(themeId, fallbackId)
        toast.success('تم تعطيل الثيم ونقل المشتركين بنجاح')
        setMigrationTheme(null)
        fetchThemes()
      } catch (err) {
        toast.error('فشل في عملية النقل')
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
      </div>
    )
  }

  return (
    <div className="space-y-10" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">إدارة الثيمات</h1>
          <p className="text-slate-500 mt-2 font-bold">تحكم في القوالب المتاحة للمتاجر وإعدادات الوصول لكل ثيم.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200">
          <Plus className="h-5 w-5" />
          إضافة ثيم جديد
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Palette className="h-7 w-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{themes.length}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">إجمالي الثيمات</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Check className="h-7 w-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{themes.filter(t => t.is_free).length}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">ثيمات مجانية</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{themes.filter(t => !t.is_free).length}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">ثيمات مدفوعة</div>
          </div>
        </div>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {themes.map((theme) => (
          <div key={theme.id} className={`group bg-white rounded-[2.5rem] border transition-all duration-500 flex flex-col overflow-hidden ${!theme.is_active ? 'opacity-60 grayscale' : 'hover:shadow-2xl hover:shadow-slate-200/50'} ${theme.is_visible ? 'border-slate-100' : 'border-dashed border-slate-300'}`}>
            {/* Preview */}
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={theme.preview_url}
                alt={theme.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              {!theme.is_visible && (
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2">
                  <EyeOff className="h-3.5 w-3.5" />
                  مخفي عن المديرين
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 gap-2">
                <button className="flex-1 bg-white text-slate-900 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <Eye className="h-4 w-4" />
                  معاينة
                </button>
                <button 
                  onClick={() => setMigrationTheme(theme)}
                  className="bg-rose-500 text-white p-3 rounded-xl shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75" 
                  title="تعطيل ونقل المشتركين"
                >
                  <ArrowRightLeft className="h-5 w-5" />
                </button>
              </div>

              {/* Badge */}
              <div className="absolute top-4 left-4">
                {theme.is_free ? (
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">مجاني</span>
                ) : (
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    {getPlanName(theme.required_plan)}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-slate-900">{theme.name}</h3>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">ID: {theme.id}</span>
              </div>
              <p className="text-sm text-slate-500 font-bold leading-relaxed mb-6 flex-1 line-clamp-2">
                {theme.description}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">المتاجر النشطة</span>
                  <span className="text-lg font-black text-slate-900">{theme.active_stores} متجر</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingTheme(theme)}
                    className="h-11 w-11 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors"
                  >
                    <Settings2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleUpdate(theme.id, { is_visible: !theme.is_visible })}
                    className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${theme.is_visible ? 'bg-slate-50 text-slate-400 hover:text-rose-500' : 'bg-rose-50 text-rose-600'}`}
                    title={theme.is_visible ? 'إخفاء' : 'إظهار'}
                  >
                    {theme.is_visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simple & Compact Edit Modal */}
      {editingTheme && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setEditingTheme(null)} />
          
          <div className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col">
            {/* Minimal Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-900 flex items-center justify-center border border-slate-100">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">تعديل {editingTheme.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400">تحكم في إعدادات القالب الأساسية</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingTheme(null)}
                className="h-8 w-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Basic Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">الاسم والوصف</label>
                  <input 
                    value={editingTheme.name}
                    onChange={e => setEditingTheme({ ...editingTheme, name: e.target.value })}
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold outline-none focus:bg-white focus:border-slate-900 transition-all"
                  />
                  <textarea 
                    value={editingTheme.description}
                    onChange={e => setEditingTheme({ ...editingTheme, description: e.target.value })}
                    className="w-full h-20 bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-bold outline-none focus:bg-white focus:border-slate-900 transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">صورة الغلاف</label>
                  <div className="scale-90 origin-top-right">
                    <ImageUpload 
                      category="banners"
                      currentUrl={editingTheme.preview_url}
                      onUploadSuccess={(url) => setEditingTheme({ ...editingTheme, preview_url: url })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">الباقة المطلوبة</label>
                    <div className="bg-slate-50 p-1 rounded-xl flex border border-slate-100">
                      {['starter', 'growth', 'pro'].map(p => {
                        const active = editingTheme.required_plan === p
                        return (
                          <button
                            key={p}
                            onClick={() => setEditingTheme({ ...editingTheme, required_plan: p, is_free: p === 'starter' })}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${active ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            {getPlanName(p as any)}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">الحالة</label>
                    <div className="h-[42px] flex items-center justify-between px-4 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-600">يظهر للتجار</span>
                      <button
                        onClick={() => setEditingTheme({ ...editingTheme, is_visible: !editingTheme.is_visible })}
                        className={`h-5 w-9 rounded-full relative flex items-center transition-all ${editingTheme.is_visible ? 'bg-slate-900' : 'bg-slate-200'}`}
                      >
                        <div className={`h-3.5 w-3.5 rounded-full bg-white transition-all ${editingTheme.is_visible ? 'mr-4.5' : 'mr-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Minimal Footer */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={() => handleUpdate(editingTheme.id, { 
                  name: editingTheme.name,
                  description: editingTheme.description,
                  preview_url: editingTheme.preview_url,
                  required_plan: editingTheme.required_plan,
                  is_free: editingTheme.is_free,
                  is_visible: editingTheme.is_visible
                })}
                disabled={isPending}
                className="flex-1 h-11 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ التعديلات
              </button>
              <button
                onClick={() => setEditingTheme(null)}
                className="px-6 h-11 bg-white border border-slate-200 text-slate-500 rounded-xl font-black text-xs hover:bg-slate-50 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Migration Modal */}
      {migrationTheme && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-rose-900/20 backdrop-blur-sm" onClick={() => setMigrationTheme(null)} />
          <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">تعطيل ونقل المشتركين</h3>
                  <p className="text-sm font-bold text-slate-400">سيتم نقل {migrationTheme.active_stores} متجر لثيم آخر.</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <Info className="h-4 w-4" />
                  <span className="text-xs font-black">تحذير هام</span>
                </div>
                <p className="text-[11px] font-bold text-amber-600 leading-relaxed">
                  هذه العملية ستقوم بتعطيل الثيم الحالي وإخفائه، ثم تقوم بتغيير ثيم جميع المتاجر التي تستخدمه حالياً إلى الثيم الذي ستختاره بالأسفل.
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">اختر الثيم البديل (Fallback Theme)</label>
                <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto p-1">
                  {themes.filter(t => t.id !== migrationTheme.id && t.is_active).map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleMigration(migrationTheme.id, t.id)}
                      disabled={isPending}
                      className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all text-right group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={t.preview_url} className="h-10 w-16 object-cover rounded-lg" />
                        <span className="text-sm font-black text-slate-900">{t.name}</span>
                      </div>
                      <ArrowRightLeft className="h-4 w-4 text-slate-300 group-hover:text-indigo-600" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setMigrationTheme(null)}
                className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
