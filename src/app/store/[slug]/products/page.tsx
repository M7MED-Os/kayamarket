import { createClient } from '@/lib/supabase/server'
import { getStoreByIdentifier } from '@/lib/tenant/get-store'
import ProductCard from '@/components/product/ProductCard'
import ProductFilters from '@/components/product/ProductFilters'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import StoreHeader from '@/components/StoreHeader'
import StoreFooter from '@/components/StoreFooter'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
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

  const categories = Array.from(new Set(productsWithRatings.map(p => p.category).filter(Boolean) as string[]))

  let products = productsWithRatings
  if (typeof currentCategory === 'string') {
    products = products.filter(p => p.category === currentCategory)
  }
  if (typeof searchQuery === 'string' && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim()
    products = products.filter(p =>
      p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    )
  }

  const primaryColor = branding?.primary_color || '#e11d48'
  const secondaryColor = branding?.secondary_color || '#f8fafc'
  const fontFamily = branding?.font_family || 'Cairo'

  return (
    <div className="min-h-screen bg-white" dir="rtl" style={{ '--primary': primaryColor, '--secondary': secondaryColor, fontFamily } as any}>
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
            <p className="text-zinc-500 font-bold mt-1">{productsWithRatings.length} منتج متاح</p>
          </div>
          <div className="flex items-center gap-2 bg-[var(--primary)]/10 px-5 py-3 rounded-2xl">
            <ShoppingBag className="h-5 w-5 text-[var(--primary)]" />
            <span className="font-black text-[var(--primary)]">{store.name}</span>
          </div>
        </div>

        {/* Filters */}
        <ProductFilters categories={categories} currentCategory={currentCategory as string} slug={`${slug}/products`} searchQuery={searchQuery as string} />

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
      <StoreFooter store={store} branding={branding} slug={slug} />
    </div>
  )
}
