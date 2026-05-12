'use client'

import React from 'react'
import { ShoppingBag } from 'lucide-react'
import { ElegantHeader, ElegantFooter, ElegantProductCard } from '@/components/store/themes/ElegantTheme'
import ProductFilters from '@/components/product/ProductFilters'
import { KayaBadge } from '@/components/store/KayaBadge'

interface ProductsViewProps {
  store: any
  branding: any
  slug: string
  products: any[]
  categories: string[]
  currentCategory: string
  searchQuery: string
  showWatermark: boolean
  commonStyles: any
  sections: any
}

export default function ElegantProducts({
  store,
  branding,
  slug,
  products,
  categories,
  currentCategory,
  searchQuery,
  showWatermark,
  commonStyles,
  sections
}: ProductsViewProps) {
  return (
    <div className="min-h-screen bg-white" dir="rtl" style={commonStyles}>
      <ElegantHeader store={store} branding={branding} slug={slug} />
      <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col items-center text-center mb-20 space-y-4">
          <div className="h-px w-12 bg-[var(--primary)]/30 mb-2" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--primary)]">المتجر</span>
          <h1 className="text-4xl md:text-5xl font-light text-zinc-900 tracking-tighter uppercase">כל <span className="font-bold italic text-[var(--primary)]">المنتجات</span></h1>
        </div>

        <ProductFilters categories={categories} currentCategory={currentCategory} slug={`${slug}/products`} searchQuery={searchQuery} />

        {products.length === 0 ? (
          <div className="text-center py-32 border border-zinc-100 bg-zinc-50/50 rounded-[3rem] mt-12">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ShoppingBag className="h-8 w-8 text-zinc-200" />
            </div>
            <p className="text-lg font-light italic text-zinc-400">عذراً، لم نجد أي قطع تطابق بحثك حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16 mt-12">
            {products.map((product) => (
              <ElegantProductCard key={product.id} product={product} slug={slug} />
            ))}
          </div>
        )}
      </main>
      {sections.footer && <ElegantFooter store={store} branding={branding} showWatermark={showWatermark} />}
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
