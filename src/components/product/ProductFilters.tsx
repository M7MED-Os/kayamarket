'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState } from 'react'

interface ProductFiltersProps {
  categories: string[]
  currentCategory?: string
  slug: string
  searchQuery?: string
}

export default function ProductFilters({ categories, currentCategory, slug, searchQuery }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchQuery || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }
    router.push(`/store/${slug}?${params.toString()}#products`)
  }

  const handleCategoryChange = (cat: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (cat) {
      params.set('category', cat)
    } else {
      params.delete('category')
    }
    return `/store/${slug}?${params.toString()}#products`
  }

  return (
    <div className="flex flex-col gap-8 mb-12">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-lg mx-auto w-full group">
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن منتج..." 
          className="w-full rounded-2xl border border-gray-200 pl-12 pr-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] shadow-sm bg-white transition-all"
        />
        <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[var(--primary)] hover:scale-110 transition-all">
          <Search className="h-5 w-5" />
        </button>
      </form>

      {/* Categories */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          <Link 
            href={handleCategoryChange(null)}
            className={`px-5 md:px-8 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all ${!currentCategory ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 -translate-y-0.5' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
          >
            الكل
          </Link>
          {categories.filter(c => c !== 'الكل' && c !== 'عام').map((cat) => (
            <Link 
              key={cat} 
              href={handleCategoryChange(cat)}
              className={`px-5 md:px-8 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all ${currentCategory === cat ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20 -translate-y-0.5' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}
            >
              {cat}
            </Link>
          ))}
      </div>
    </div>
  )
}
