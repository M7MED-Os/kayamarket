'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState } from 'react'

export default function SearchFilter({ categories, currentCategory, currentQuery }: { categories: string[], currentCategory?: string, currentQuery?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(currentQuery || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (q) params.set('q', q)
    else params.delete('q')
    router.push(`/?${params.toString()}#products`, { scroll: false })
  }

  const handleCategory = (c: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (c) params.set('category', c)
    else params.delete('category')
    router.push(`/?${params.toString()}#products`, { scroll: false })
  }

  return (
    <div className="mb-10 space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن منتج..."
          className="w-full rounded-2xl border-2 border-rose-100 bg-white px-5 py-4 pl-12 text-sm text-zinc-900 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all shadow-sm"
        />
        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition-colors">
          <Search className="h-5 w-5" />
        </button>
      </form>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => handleCategory('')}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
              !currentCategory ? 'bg-rose-600 text-white shadow-md' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
            }`}
          >
            الكل
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => handleCategory(c)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                currentCategory === c ? 'bg-rose-600 text-white shadow-md' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
