'use client'

import React, { useState, useMemo } from 'react'
import { Filter, Search, SlidersHorizontal, Grid3X3, LayoutList, Leaf, X, ChevronDown } from 'lucide-react'
import { OrganicHeader, OrganicFooter, OrganicProductCard } from '../themes/OrganicTheme'

export default function OrganicProducts({ store, branding, slug, products, categories, showWatermark, commonStyles }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('default')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showSort, setShowSort] = useState(false)

  const primaryColor = branding?.primary_color || '#4A6741'
  const finalStyles = { ...commonStyles, '--primary': primaryColor, fontFamily: branding?.font_family || 'Outfit, Cairo, sans-serif' }

  const filteredProducts = useMemo(() => {
    let result = [...(products || [])]
    if (selectedCategory) result = result.filter((p: any) => p.category_id === selectedCategory)
    if (searchQuery.trim()) result = result.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    if (sortBy === 'price_asc') result.sort((a: any, b: any) => a.price - b.price)
    if (sortBy === 'price_desc') result.sort((a: any, b: any) => b.price - a.price)
    if (sortBy === 'rating') result.sort((a: any, b: any) => (b.avg_rating || 0) - (a.avg_rating || 0))
    return result
  }, [products, selectedCategory, searchQuery, sortBy])

  const sortOptions = [
    { value: 'default', label: 'الافتراضي' },
    { value: 'price_asc', label: 'السعر: الأقل أولاً' },
    { value: 'price_desc', label: 'السعر: الأعلى أولاً' },
    { value: 'rating', label: 'الأعلى تقييماً' },
  ]

  const clearFilters = () => { setSelectedCategory(null); setSearchQuery(''); setSortBy('default') }
  const hasFilters = selectedCategory || searchQuery || sortBy !== 'default'

  return (
    <div className="min-h-screen bg-[#F9F7F2]" dir="rtl" style={finalStyles}>
      <OrganicHeader store={store} branding={branding} slug={slug} />

      <main className="pt-28 pb-24">
        {/* Page Header */}
        <div className="bg-white border-b border-zinc-100">
          <div className="max-w-7xl mx-auto px-6 py-14">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--primary)]/8 rounded-full">
                <Leaf className="h-3.5 w-3.5 text-[var(--primary)]" />
                <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.25em]">المتجر</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight">
                جميع <span className="italic text-[var(--primary)] font-serif">المنتجات</span>
              </h1>
              <p className="text-zinc-500 font-medium max-w-md text-base leading-relaxed">
                {branding?.products_page_description || 'اكتشف مجموعتنا الكاملة من المنتجات الطبيعية العضوية.'}
              </p>
              <div className="pt-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {filteredProducts.length} منتج متاح
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-10">
          {/* Filters Bar */}
          <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm p-4 mb-10 space-y-4">
            {/* Category pills */}
            {categories && categories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all whitespace-nowrap flex-shrink-0
                    ${!selectedCategory ? 'bg-zinc-900 text-white shadow-sm' : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'}`}
                >
                  الكل
                </button>
                {categories.map((cat: any, idx: number) => (
                  <button
                    key={cat.id || idx}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all whitespace-nowrap flex-shrink-0
                      ${selectedCategory === cat.id ? 'bg-[var(--primary)] text-white shadow-sm shadow-[var(--primary)]/20' : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Search + Sort + View */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن منتج..."
                  className="w-full bg-zinc-50 border border-transparent rounded-xl py-3 pr-11 pl-4 text-sm font-medium outline-none focus:bg-white focus:border-[var(--primary)]/30 transition-all placeholder:text-zinc-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <button onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 px-4 py-3 bg-zinc-50 border border-transparent rounded-xl text-xs font-black text-zinc-600 hover:bg-zinc-100 transition-all whitespace-nowrap">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:block">{sortOptions.find(o => o.value === sortBy)?.label}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showSort ? 'rotate-180' : ''}`} />
                </button>
                {showSort && (
                  <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden z-20">
                    {sortOptions.map(opt => (
                      <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSort(false) }}
                        className={`w-full text-right px-5 py-3.5 text-sm font-bold transition-colors flex items-center justify-between
                          ${sortBy === opt.value ? 'bg-[var(--primary)]/8 text-[var(--primary)]' : 'text-zinc-600 hover:bg-zinc-50'}`}
                      >
                        {opt.label}
                        {sortBy === opt.value && <div className="h-1.5 w-1.5 bg-[var(--primary)] rounded-full" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View mode */}
              <div className="hidden sm:flex items-center bg-zinc-50 rounded-xl p-1 border border-transparent">
                <button onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-700'}`}
                  aria-label="عرض شبكي">
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-700'}`}
                  aria-label="عرض قائمة">
                  <LayoutList className="h-4 w-4" />
                </button>
              </div>

              {/* Clear filters */}
              {hasFilters && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-3 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl text-xs font-black hover:bg-rose-500 hover:text-white transition-all">
                  <X className="h-3.5 w-3.5" /> مسح
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6'
              : 'flex flex-col gap-4'
            }>
              {filteredProducts.map((product: any, index: number) => (
                viewMode === 'grid' ? (
                  <div key={product.id} style={{ animationDelay: `${Math.min(index * 60, 600)}ms` }}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                    <OrganicProductCard product={product} slug={slug} />
                  </div>
                ) : (
                  <div key={product.id} className="bg-white rounded-[1.5rem] border border-zinc-100 shadow-sm p-4 flex items-center gap-5 hover:shadow-md hover:border-[var(--primary)]/20 transition-all group">
                    <div className="h-24 w-24 rounded-2xl overflow-hidden bg-zinc-50 flex-shrink-0">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Leaf className="h-3 w-3" /> عضوي
                      </p>
                      <h3 className="font-black text-zinc-900 truncate text-base">{product.name}</h3>
                      <p className="text-lg font-black text-[var(--primary)] mt-1">{product.price.toLocaleString()} ج.م</p>
                    </div>
                    <a href={`/store/${slug}/products/${product.id}`}
                      className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-wide hover:bg-[var(--primary)] transition-colors flex-shrink-0">
                      عرض
                    </a>
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
              <div className="h-28 w-28 bg-zinc-100 rounded-[2.5rem] flex items-center justify-center text-zinc-300">
                <Leaf className="h-14 w-14" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-zinc-900">لا توجد منتجات</h3>
                <p className="text-zinc-500 font-medium text-sm">لم نجد منتجات تطابق بحثك.</p>
              </div>
              <button onClick={clearFilters}
                className="px-8 py-4 bg-zinc-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-[var(--primary)] transition-colors">
                عرض جميع المنتجات
              </button>
            </div>
          )}
        </div>
      </main>

      <OrganicFooter store={store} branding={branding} slug={slug} showWatermark={showWatermark} categories={categories} />
    </div>
  )
}
