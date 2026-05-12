'use client'

import React from 'react'
import { FloralHeader, FloralFooter, FloralProductCard, FloralSectionTitle } from '@/components/store/themes/FloralTheme'
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
  totalCount: number
}

export default function FloralProducts({
  store,
  branding,
  slug,
  products,
  categories,
  currentCategory,
  searchQuery,
  showWatermark,
  commonStyles,
  sections,
  totalCount
}: ProductsViewProps) {
  return (
    <div className="min-h-screen bg-[#FAF3F0]/20" dir="rtl" style={commonStyles}>
      <FloralHeader store={store} branding={branding} slug={slug} />

      <main className="mx-auto max-w-7xl px-6 py-24">
        <FloralSectionTitle title="الباقات والزهور" subtitle={`متوفر لدينا ${totalCount} منتجاً`} />

        <ProductFilters categories={categories} currentCategory={currentCategory} slug={`${slug}/products`} searchQuery={searchQuery} />

        {products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-rose-50 mt-12 shadow-sm">
            <p className="text-xl font-serif italic text-zinc-500">عذراً، لا توجد زهور تطابق طلبك</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mt-12">
            {products.map((product) => (
              <FloralProductCard key={product.id} product={product} slug={slug} />
            ))}
          </div>
        )}
      </main>

      {sections.footer && <FloralFooter store={store} branding={branding} showWatermark={showWatermark} />}
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
