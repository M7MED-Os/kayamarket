'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { ElegantHeader, ElegantFooter } from '@/components/store/themes/ElegantTheme';
import ImageGallery from '@/components/ImageGallery';
import CheckoutBox from '@/components/CheckoutBox';
import ProductReviews from '@/components/product/ProductReviews';
import { KayaBadge } from '@/components/store/KayaBadge';

interface ProductViewProps {
  product: any;
  store: any;
  branding: any;
  slug: string;
  galleryImages: string[];
  ratingSummary: any;
  reviews: any;
  showWatermark: boolean;
  commonStyles: any;
  selectedTheme: string;
}

export default function ElegantView({
  product,
  store,
  branding,
  slug,
  galleryImages,
  ratingSummary,
  reviews,
  showWatermark,
  commonStyles,
  selectedTheme
}: ProductViewProps) {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-cairo)]" dir="rtl" style={commonStyles}>
      <ElegantHeader store={store} branding={branding} slug={slug} />
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:gap-20 lg:grid-cols-2 items-start">
          
          {/* Gallery Section */}
          <div className="lg:sticky lg:top-32">
            <div className="relative rounded-3xl border border-zinc-100 bg-white p-0 overflow-hidden shadow-2xl shadow-zinc-200/50">
              <ImageGallery images={galleryImages} productName={product.name} />
              
              {/* Stock Badge (Top Left) */}
              <div className="absolute top-4 md:top-6 left-4 md:left-6 z-10">
                <div className="px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[10px] font-black text-white shadow-xl flex items-center gap-2"
                  style={{ backgroundColor: product.stock === 0 ? '#333' : 'var(--primary)' }}>
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  {product.stock === null ? 'متوفر' : product.stock === 0 ? 'نفذت الكمية' : `متبقي ${product.stock} فقط`}
                </div>
              </div>

              {/* Discount Badge (Top Right) */}
              {product.original_price && product.price && product.original_price > product.price && (
                <div className="absolute top-4 md:top-6 right-4 md:right-6 z-10 bg-zinc-900 text-white text-[10px] font-black px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-xl uppercase tracking-widest">
                  وفر {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col gap-10 md:gap-12">
            <div className="space-y-8">
              <div className="space-y-6">
                {/* Category & Sales */}
                <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                  <span className="text-[var(--primary)] text-[10px] font-black uppercase tracking-widest bg-[var(--primary)]/5 px-4 py-1.5 rounded-full">
                    {product.category || 'تنسيق حصري'}
                  </span>
                  {product.sales_count > 0 && (
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-r border-zinc-200 pr-4">
                      طلب {product.sales_count} مرة
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="text-3xl md:text-5xl font-black text-zinc-900 leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className={`h-4 w-4 ${idx < Math.round(ratingSummary?.average_rating || 5) ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-zinc-100'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    ({ratingSummary?.total_reviews || 0} تقييم)
                  </span>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="pt-2">
                    <p className="text-lg text-zinc-500 font-light leading-relaxed border-r-2 border-[var(--primary)]/10 pr-4">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Checkout Integration */}
              <div className="relative">
                <CheckoutBox product={product} storeId={store.id} storeSlug={slug} selectedTheme={selectedTheme} />
              </div>
            </div>

            {/* Reviews Section */}
            <div className="pt-12 md:pt-20 border-t border-zinc-100">
              <ProductReviews
                productId={product.id}
                storeId={store.id}
                initialReviews={reviews as any}
                averageRating={ratingSummary?.average_rating || 5}
                totalReviews={ratingSummary?.total_reviews || 0}
                selectedTheme={selectedTheme}
              />
            </div>
          </div>
        </div>
      </main>
      <ElegantFooter store={store} branding={branding} />
      {showWatermark && <div className="fixed bottom-6 md:bottom-10 right-6 md:right-10 z-[9999] scale-90 md:scale-110"><KayaBadge /></div>}
    </div>
  );
}
