'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Loading from '@/app/loading';

// Dynamic Imports for Theme Views (Code Splitting)
const ThemeViews = {
  elegant: dynamic(() => import('@/components/store/product-views/ElegantView'), { loading: () => <Loading /> }),
  floral: dynamic(() => import('@/components/store/product-views/FloralView'), { loading: () => <Loading /> }),
  organic: dynamic(() => import('@/components/store/product-views/OrganicView'), { loading: () => <Loading /> }),
  default: dynamic(() => import('@/components/store/product-views/DefaultView'), { loading: () => <Loading /> }),
};

interface ProductClientPageProps {
  product: any;
  store: any;
  branding: any;
  reviews: any[];
  ratingSummary: any;
  slug: string;
}

export default function ProductClientPage({ 
  product, 
  store, 
  branding, 
  reviews, 
  ratingSummary, 
  slug 
}: ProductClientPageProps) {
  
  const commonStyles = useMemo(() => ({
    '--primary': branding?.primary_color || '#000',
    '--font-cairo': 'Cairo, sans-serif',
  }), [branding]);

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
