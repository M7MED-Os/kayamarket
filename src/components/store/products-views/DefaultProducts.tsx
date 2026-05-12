'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import StoreHeader from '@/components/StoreHeader'
import StoreFooter from '@/components/StoreFooter'
import ProductCard from '@/components/product/ProductCard'
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

export default function DefaultProducts({
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
    <div className="min-h-screen bg-white" dir="rtl" style={commonStyles}>
      <StoreHeader store={store} branding={branding} slug={slug} />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <Link href={`/store/${slug}`} className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-600 mb-3 transition-colors">
              <ArrowRight className="h-3.5 w-3.5" />
              العودة للرئيسية
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-zinc-900">جميع المنتجات</h1>
            <p className="text-zinc-500 font-bold mt-1">{totalCount} منتج متاح</p>
          </div>
          <div className="flex items-center gap-2 bg-[var(--primary)]/10 px-5 py-3 rounded-2xl">
            <ShoppingBag className="h-5 w-5 text-[var(--primary)]" />
            <span className="font-black text-[var(--primary)]">{store.name}</span>
          </div>
        </div>

        {/* Filters */}
        <ProductFilters categories={categories} currentCategory={currentCategory} slug={`${slug}/products`} searchQuery={searchQuery} />

        {/* Grid */}
        {products.length === 0 ? (
          <div className="text-center py-24 bg-zinc-50 rounded-3xl border border-zinc-100 mt-8">
            <p className="text-xl font-bold text-zinc-500 mb-2">عذراً، لم نجد أي منتجات تطابق بحثك 🕵️</p>
            <p className="text-sm text-zinc-400">جرب البحث بكلمات أخرى أو تصفح الأقسام</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} slug={slug} />
            ))}
          </div>
        )}
      </main>
      {sections.footer && <StoreFooter store={store} branding={branding} slug={slug} showWatermark={showWatermark} />}
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
