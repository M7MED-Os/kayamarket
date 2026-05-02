'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Tag } from 'lucide-react'
import CategoryManager from './CategoryManager'

export default function ProductHeaderActions() {
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false)

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setIsCategoryManagerOpen(true)}
          className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 md:px-6 py-3.5 rounded-2xl font-black font-inter hover:bg-slate-50 hover:border-slate-900 transition-all shadow-sm active:scale-95"
          title="إدارة التصنيفات"
        >
          <Tag className="h-5 w-5 md:h-5 md:w-5" strokeWidth={2.5} />
          <span className="hidden md:inline">إدارة التصنيفات</span>
        </button>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-sky-500 text-white px-4 md:px-6 py-3.5 rounded-2xl font-black font-inter hover:bg-sky-600 transition-all shadow-xl shadow-sky-500/20 active:scale-95"
          title="إضافة منتج"
        >
          <Plus className="h-5 w-5 md:h-5 md:w-5" strokeWidth={3} />
          <span className="hidden md:inline">إضافة منتج</span>
        </Link>
      </div>

      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
      />
    </>
  )
}
