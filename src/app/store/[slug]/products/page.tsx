import React from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import { getStoreByIdentifier } from '@/lib/tenant/get-store'
import { notFound } from 'next/navigation'
import Loading from '@/app/loading'

// Dynamic Imports for Products Views
const ProductsViews = {
  elegant: dynamic(() => import('@/components/store/products-views/ElegantProducts'), { loading: () => <Loading /> }),
  floral: dynamic(() => import('@/components/store/products-views/FloralProducts'), { loading: () => <Loading /> }),
  organic: dynamic(() => import('@/components/store/products-views/OrganicProducts'), { loading: () => <Loading /> }),
  default: dynamic(() => import('@/components/store/products-views/DefaultProducts'), { loading: () => <Loading /> }),
}

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function isSectionEnabled(branding: any, sectionId: string): boolean {
  if (!branding?.sections || !Array.isArray(branding.sections)) return true
  const found = branding.sections.find((s: any) => s.id === sectionId)
  return found ? found.enabled !== false : true
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const { store } = await getStoreByIdentifier(decodeURIComponent(slug))
  return { title: `${store?.name || 'المتجر'} - جميع المنتجات` }
}

export default async function AllProductsPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { category: currentCategory, search: searchQuery } = await searchParams
  const supabase = await createClient()

  const { store, branding } = await getStoreByIdentifier(decodeURIComponent(slug))
  if (!store) notFound()

  // Fetch products (Server Side)
  const { data: allProducts } = await supabase
    .from('products')
    .select('*, product_reviews(rating, status)')
    .eq('store_id', store.id)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })

  const productsWithRatings = allProducts?.map(p => {
    const approvedReviews = p.product_reviews?.filter((r: any) => r.status === 'approved') || []
    const avgRating = approvedReviews.length > 0
      ? approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / approvedReviews.length
      : null
    const { product_reviews, ...productData } = p
    return { ...productData, rating: avgRating }
  }) || []

  // Derived data
  const categories = Array.from(new Set(productsWithRatings.map(p => p.category).filter(Boolean) as string[]))
  
  let filteredProducts = productsWithRatings
  const catFilter = typeof currentCategory === 'string' ? currentCategory : Array.isArray(currentCategory) ? currentCategory[0] : null

  if (catFilter) {
    filteredProducts = filteredProducts.filter(p =>
      p.category?.toString().trim().toLowerCase() === catFilter.trim().toLowerCase()
    )
  }
  
  if (typeof searchQuery === 'string' && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim()
    filteredProducts = filteredProducts.filter(p =>
      p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    )
  }

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

  // Pre-calculate sections visibility
  const sections = {
    footer: isSectionEnabled(branding, 'footer')
  }

  // Select the appropriate view component
  const ProductsView = (ProductsViews as any)[selectedTheme] || ProductsViews.default

  return (
    <ProductsView
      store={store}
      branding={branding}
      slug={slug}
      products={filteredProducts}
      categories={categories}
      currentCategory={currentCategory as string}
      searchQuery={searchQuery as string}
      showWatermark={showWatermark}
      commonStyles={commonStyles}
      sections={sections}
      totalCount={productsWithRatings.length}
    />
  )
}
