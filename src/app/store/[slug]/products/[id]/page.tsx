'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useProductDetails } from '@/hooks/useProductDetails';
import { useStoreBranding } from '@/hooks/useStoreBranding';
import { useStoreData } from '@/hooks/useStoreData';
import Loading from '@/app/loading';

// Dynamic Imports for Theme Views (Code Splitting)
const ThemeViews = {
  elegant: dynamic(() => import('@/components/store/product-views/ElegantView'), { loading: () => <Loading /> }),
  floral: dynamic(() => import('@/components/store/product-views/FloralView'), { loading: () => <Loading /> }),
  organic: dynamic(() => import('@/components/store/product-views/OrganicView'), { loading: () => <Loading /> }),
  default: dynamic(() => import('@/components/store/product-views/DefaultView'), { loading: () => <Loading /> }),
};

export default function ProductPage({ params: paramsPromise }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = React.use(paramsPromise);
  const { store, loading: storeLoading } = useStoreData(slug);
  const { product, reviews, ratingSummary, loading: productLoading } = useProductDetails(id);
  const { branding, loading: brandingLoading } = useStoreBranding(store?.id);

  const loading = storeLoading || productLoading || brandingLoading;

  const commonStyles = useMemo(() => ({
    '--primary': branding?.primary_color || '#000',
    '--font-cairo': 'Cairo, sans-serif',
  }), [branding]);

  if (loading) return <Loading />;
  if (!product || !store) return <div className="min-h-screen flex items-center justify-center font-bold">المنتج غير موجود</div>;

  const selectedTheme = (branding as any)?.selected_theme || 'default';
  const showWatermark = branding?.subscription_tier !== 'professional';
  const galleryImages = [product.image_url, ...(product.gallery || [])].filter(Boolean);

  // Select the appropriate view component
  const ProductView = (ThemeViews as any)[selectedTheme] || ThemeViews.default;

  return (
    <ProductView
      product={product}
      store={store}
      branding={branding}
      slug={slug}
      galleryImages={galleryImages}
      ratingSummary={ratingSummary}
      reviews={reviews}
      showWatermark={showWatermark}
      commonStyles={commonStyles}
      selectedTheme={selectedTheme}
    />
  );
}
