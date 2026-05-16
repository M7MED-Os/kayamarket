import React from 'react'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStoreByIdentifier } from '@/lib/tenant/get-store'
import Loading from '@/app/loading'

// Dynamic Imports for Home Views
const HomeViews = {
  elegant: dynamic(() => import('@/components/store/home-views/ElegantHome'), { loading: () => <Loading /> }),
  floral: dynamic(() => import('@/components/store/home-views/FloralHome'), { loading: () => <Loading /> }),
  organic: dynamic(() => import('@/components/store/home-views/OrganicHome'), { loading: () => <Loading /> }),
  default: dynamic(() => import('@/components/store/home-views/DefaultHome'), { loading: () => <Loading /> }),
}

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// 🌐 SEO: Generate Dynamic Metadata for the Store
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { store, branding } = await getStoreByIdentifier(decodeURIComponent(slug))
  
  if (!store) return { title: 'المتجر غير موجود' }

  const storeName = store.name || 'KayaMarket Store'
  const title = `${storeName} | تسوق الآن`
  const description = branding?.hero_subtitle || branding?.footer_description || `مرحباً بك في متجر ${storeName}. اكتشف أفضل المنتجات بأفضل الأسعار.`;
  const logo = branding?.logo_url;
  const banner = branding?.banner_url || branding?.hero_image_url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: banner ? [{ url: banner }] : (logo ? [{ url: logo }] : []),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: banner ? [banner] : (logo ? [logo] : []),
    },
    alternates: {
      canonical: `/store/${slug}`,
    },
    keywords: `${storeName}, تسوق اونلاين, تجارة إلكترونية, ${store.slug}, مصر`,
  }
}

function isSectionEnabled(branding: any, sectionId: string): boolean {
  if (!branding?.sections || !Array.isArray(branding.sections)) return true
  const found = branding.sections.find((s: any) => s.id === sectionId)
  return found ? found.enabled !== false : true
}

export default async function StorePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { store, branding } = await getStoreByIdentifier(decodeURIComponent(slug))
  
  if (!store) notFound()

  // Fetch products (Server Side)
  const { data: allProducts } = await supabase
    .from('products')
    .select('*, product_reviews(rating, status)')
    .eq('store_id', store.id)
    .eq('is_visible', true)
    .order('sales_count', { ascending: false })

  const productsWithRatings = allProducts?.map(p => {
    const approved = p.product_reviews?.filter((r: any) => r.status === 'approved') || []
    const avgRating = approved.length > 0
      ? approved.reduce((sum: number, r: any) => sum + r.rating, 0) / approved.length
      : null
    const { product_reviews, ...productData } = p
    return { ...productData, rating: avgRating }
  }) || []

  // Fetch store reviews (Server Side)
  const { data: storeReviews } = await supabase
    .from('product_reviews')
    .select('id, customer_name, rating, comment, created_at')
    .eq('store_id', store.id)
    .is('product_id', null)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch categories (Server Side)
  const { data: dbCategories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)

  // Subscription check for watermark
  const { getPlanConfig, getDynamicPlanConfigs } = await import('@/lib/subscription')
  const dynamicConfigs = await getDynamicPlanConfigs(supabase)
  const rawPlan = store.plan as string || 'starter'
  const planTier = (rawPlan.toLowerCase() === 'free' ? 'starter' : rawPlan.toLowerCase()) as import('@/lib/subscription').PlanTier
  const planConfig = dynamicConfigs[planTier] || getPlanConfig(planTier)
  const showWatermark = planConfig ? !planConfig.canRemoveWatermark : true

  const selectedTheme = (branding as any)?.selected_theme || 'default'
  const commonStyles = {
    '--primary': branding?.primary_color || '#e11d48',
    '--secondary': branding?.secondary_color || '#f8fafc',
    'fontFamily': branding?.font_family || 'Cairo'
  }

  // Pre-calculate section visibility (cannot pass functions to Client Components)
  const sections = {
    announcement: isSectionEnabled(branding, 'announcement'),
    categories: isSectionEnabled(branding, 'categories'),
    bestsellers: isSectionEnabled(branding, 'bestsellers'),
    features: isSectionEnabled(branding, 'features'),
    testimonials: isSectionEnabled(branding, 'testimonials'),
    faq: isSectionEnabled(branding, 'faq'),
    footer: isSectionEnabled(branding, 'footer'),
  }

  // Select the appropriate view component
  const HomeView = (HomeViews as any)[selectedTheme] || HomeViews.default

  // 🛠️ SEO: Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name,
    url: `https://kayamarket.vercel.app/store/${slug}`,
    logo: branding?.logo_url,
    description: branding?.footer_description || branding?.hero_subtitle,
    image: branding?.banner_url || branding?.hero_image_url,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'EG',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `https://kayamarket.vercel.app/store/${slug}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeView
        store={store}
        branding={branding}
        slug={slug}
        dbCategories={dbCategories || []}
        productsWithRatings={productsWithRatings}
        storeReviews={storeReviews || []}
        showWatermark={showWatermark}
        commonStyles={commonStyles}
        sections={sections}
      />
    </>
  )
}
