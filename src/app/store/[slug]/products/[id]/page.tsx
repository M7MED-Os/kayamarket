import React from 'react';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProductClientPage from './ProductClientPage';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

// 🌐 SEO: Generate Dynamic Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id } = await params;
  const supabase = await createClient();

  // Fetch product
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  let query = supabase.from('products').select('*, stores!inner(name, id)').eq('is_visible', true);
  
  if (isUUID) {
    query = query.eq('id', id);
  } else {
    const normalizedSlug = id.includes('%') ? decodeURIComponent(id) : id;
    query = query.or(`slug.eq."${normalizedSlug}",slug.eq."${normalizedSlug.replace(/\s+/g, '-')}"`);
  }

  const { data: product } = await query.single();
  if (!product) return { title: 'المنتج غير موجود' };

  const storeName = product.stores?.name || 'KayaMarket';
  const title = `${product.name} | ${storeName}`;
  const description = product.description?.substring(0, 160) || `اشتري ${product.name} الآن من متجر ${storeName}. أفضل الأسعار وأعلى جودة.`;
  const image = product.image_url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: `/store/${slug}/products/${id}`,
    },
    keywords: `${product.name}, ${product.category}, ${storeName}, تسوق اونلاين, مصر`,
  };
}

export default async function Page({ params }: Props) {
  const { slug, id } = await params;
  const supabase = await createClient();

  // 1. Fetch Store
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!store) notFound();

  // 2. Fetch Product & Reviews
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  let pQuery = supabase.from('products').select('*');
  if (isUUID) {
    pQuery = pQuery.eq('id', id);
  } else {
    const normalizedSlug = id.includes('%') ? decodeURIComponent(id) : id;
    pQuery = pQuery.or(`slug.eq."${normalizedSlug}",slug.eq."${normalizedSlug.replace(/\s+/g, '-')}"`);
  }

  const { data: product } = await pQuery.single();
  if (!product) notFound();

  // 3. Fetch Branding
  const { data: branding } = await supabase
    .from('store_branding')
    .select('*')
    .eq('store_id', store.id)
    .single();

  // 4. Fetch Reviews
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', product.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  const reviewsData = reviews || [];
  const avg = reviewsData.length > 0 
    ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length 
    : 5;
  
  const ratingSummary = {
    average_rating: avg,
    avg: avg,
    total_reviews: reviewsData.length,
    count: reviewsData.length
  };

  // 🛠️ SEO: Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image_url,
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: store.name,
    },
    offers: {
      '@type': 'Offer',
      url: `https://kayamarket.vercel.app/store/${slug}/products/${id}`,
      priceCurrency: 'EGP',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: store.name,
      },
    },
    aggregateRating: reviewsData.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: reviewsData.length,
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClientPage 
        product={product}
        store={store}
        branding={branding}
        reviews={reviewsData}
        ratingSummary={ratingSummary}
        slug={slug}
      />
    </>
  );
}
