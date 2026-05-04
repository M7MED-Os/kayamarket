'use client'

import { useState } from 'react'
import {
  Palette, Plus, Shield, Check, Info,
  ExternalLink, Lock, Eye, Settings2
} from 'lucide-react'
import Image from 'next/image'

const MOCK_THEMES = [
  {
    id: 'default',
    name: 'الافتراضي (Premium Mesh)',
    description: 'تصميم عصري بخلفيات متدرجة وتأثيرات زجاجية، مثالي للمتاجر التي تبحث عن مظهر فخم.',
    is_free: true,
    required_plan: 'free',
    preview_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    active_stores: 124,
  },
  {
    id: 'elegant',
    name: 'الأنيق (Minimal Elegant)',
    description: 'تصميم بسيط ونظيف يركز على المنتجات والصور الاحترافية، مناسب لمتاجر الأزياء والمجوهرات.',
    is_free: false,
    required_plan: 'basic',
    preview_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop',
    active_stores: 45,
  },
  {
    id: 'floral',
    name: 'بلوم — Bloom 🌸',
    description: 'ثيم رومانسي فاخر مخصص لمتاجر الورود والهدايا. تصميم عاطفي مدروس بفلسفة البخاء وتحويل الزوار إلى عملاء.',
    is_free: false,
    required_plan: 'basic',
    preview_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2670&auto=format&fit=crop',
    active_stores: 18,
  },
  {
    id: 'dark-vogue',
    name: 'دارك فوغ (Dark Vogue)',
    description: 'ثيم غامق بلمسات ذهبية يعطي طابعاً حصرياً وفخماً للمنتجات الفاخرة.',
    is_free: false,
    required_plan: 'pro',
    preview_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop',
    active_stores: 12,
  },
]

export default function ThemesPage() {
  const [themes] = useState(MOCK_THEMES)

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

      {/* Stats / Info */}
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
          <div key={theme.id} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col">
            {/* Preview */}
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src={theme.preview_url}
                alt={theme.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <Eye className="h-4 w-4" />
                  معاينة الثيم
                </button>
              </div>

              {/* Badge */}
              <div className="absolute top-4 left-4">
                {theme.is_free ? (
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">مجاني</span>
                ) : (
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    {theme.required_plan === 'pro' ? 'برو' : 'أساسي'}
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
              <p className="text-sm text-slate-500 font-bold leading-relaxed mb-6 flex-1">
                {theme.description}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">المتاجر النشطة</span>
                  <span className="text-lg font-black text-slate-900">{theme.active_stores} متجر</span>
                </div>
                <div className="flex gap-2">
                  <button className="h-11 w-11 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors" title="إعدادات الثيم">
                    <Settings2 className="h-5 w-5" />
                  </button>
                  <button className="h-11 px-5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-all active:scale-95">
                    تعديل
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Placeholder */}
        <button className="group relative h-full min-h-[400px] rounded-[2.5rem] border-4 border-dashed border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center gap-4 p-10">
          <div className="h-20 w-20 rounded-3xl bg-slate-50 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all flex items-center justify-center">
            <Plus className="h-10 w-10" />
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-slate-400 group-hover:text-indigo-900 transition-colors">إضافة ثيم جديد</div>
            <p className="text-sm font-bold text-slate-400 mt-1">ابدأ بتصميم قالب فريد للمتاجر</p>
          </div>
        </button>
      </div>
    </div>
  )
}
