import { createClient } from '@/lib/supabase/server'
import { getStoreByIdentifier } from '@/lib/tenant/get-store'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShieldCheck, Truck, HeartHandshake, CheckCircle2, ChevronRight, Package } from 'lucide-react'
import ImageGallery from '@/components/ImageGallery'
import CheckoutBox from '@/components/CheckoutBox'
import CountdownTimer from '@/components/CountdownTimer'
import StoreHeader from '@/components/StoreHeader'
import ProductReviews from '@/components/product/ProductReviews'
import { getApprovedReviews, getProductRatingSummary } from '@/app/actions/reviews'
import { Star } from 'lucide-react'
import StoreFooter from '@/components/StoreFooter'

interface PageProps {
  params: Promise<{ slug: string; id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id, slug } = await params
  const supabase = await createClient()
  const [{ data: product }, { store }] = await Promise.all([
    supabase.from('products').select('name, description').eq('id', id).single(),
    getStoreByIdentifier(decodeURIComponent(slug)),
  ])
  if (!product) return { title: 'المنتج غير موجود' }
  return {
    title: `${product.name} | ${store?.name ?? 'متجر'}`,
    description: product.description?.slice(0, 160),
  }
}

export default async function StoreProductPage({ params }: PageProps) {
  const { slug, id } = await params
  const supabase = await createClient()

  const { store, branding } = await getStoreByIdentifier(decodeURIComponent(slug))
  if (!store) notFound()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('store_id', store.id)
    .eq('is_visible', true)
    .single()

  if (!product) notFound()

  // Fetch reviews data in parallel
  const [reviews, ratingSummary] = await Promise.all([
    getApprovedReviews(id),
    getProductRatingSummary(id)
  ])

  if (!product) notFound()

  // Increment views
  supabase.rpc('increment_product_views', { product_id: id }).then(() => { })

  const galleryImages: string[] = []
  if (product.image_url) {
    galleryImages.push(product.image_url)
  }
  if (product.images && product.images.length > 0) {
    // Avoid duplicating the main image if it's already in the images array
    const additionalImages = product.images.filter((img: any) => img !== product.image_url)
    galleryImages.push(...additionalImages)
  }

  const primaryColor = branding?.primary_color || '#e11d48'
  const logoSrc = branding?.logo_url || null

  return (
    <div className="min-h-screen bg-white font-inter" dir="rtl" style={{ '--store-primary': primaryColor, '--primary': primaryColor } as any}>

      <StoreHeader store={store} branding={branding} slug={slug} />

      <main className="mx-auto max-w-7xl px-6 py-12">

        {/* Breadcrumb */}
        <nav className="mb-12 flex items-center gap-2 text-xs font-bold text-zinc-400">
          <Link href={`/store/${slug}`} className="hover:text-primary-600 transition-colors">
            {store.name}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-900 font-black">{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-start">

          {/* ── Gallery (Left on Desktop, Top on Mobile) ── */}
          <div className="lg:sticky lg:top-28 relative">
            <div className="rounded-[3rem] overflow-hidden border border-zinc-100 shadow-2xl shadow-zinc-200/50">
              <ImageGallery images={galleryImages} productName={product.name} />
            </div>

            {product.original_price && product.price && product.original_price > product.price && (
              <div className="absolute top-6 left-6 z-10 bg-red-600 text-white text-xs font-black px-5 py-2 rounded-full shadow-2xl">
                خصم {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
              </div>
            )}

            {product.stock !== null && product.stock <= 5 && product.stock > 0 && (
              <div className="absolute bottom-6 right-6 bg-amber-500 text-white text-xs font-black px-5 py-2 rounded-full shadow-2xl animate-bounce z-10">
                باقي {product.stock} فقط في المخزون!
              </div>
            )}
          </div>

          {/* ── Info & Checkout (Right) ── */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-3 mb-6">
              <h1 className="text-4xl md:text-5xl font-black text-zinc-900 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 flex-wrap">
                {ratingSummary.total_reviews > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <span className="text-sm font-bold text-zinc-800">{ratingSummary.average_rating.toFixed(1)}</span>
                    <span className="text-xs font-bold text-zinc-400">({ratingSummary.total_reviews} تقييم)</span>
                  </div>
                )}

                {product.sales_count > 0 && (
                  <>
                    {ratingSummary.total_reviews > 0 && <div className="h-4 w-px bg-zinc-200" />}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                      <Package className="h-4 w-4 text-zinc-400" />
                      تم شراءه <span className="text-[var(--store-primary)] text-sm">{product.sales_count}</span> مرة
                    </div>
                  </>
                )}
              </div>
            </div>

            {product.description && (
              <div className="mt-4 border-r-2 border-zinc-100 pr-2 py-1 mb-8">
                <p className="text-lg leading-relaxed text-zinc-600 font-bold whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              {[
                { icon: CheckCircle2, label: 'أعلى جودة' },
                { icon: Truck, label: 'شحن فائق السرعة' },
                { icon: ShieldCheck, label: 'دفع آمن' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 shadow-sm">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[13px] font-black text-zinc-900">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Checkout Section */}
            <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 p-8 md:p-10 mb-12">
              <CheckoutBox product={product} storeId={store.id} storeSlug={slug} />
            </div>

            {/* Product Reviews */}
            <ProductReviews 
              productId={product.id} 
              storeId={store.id}
              initialReviews={reviews as any}
              averageRating={ratingSummary.average_rating}
              totalReviews={ratingSummary.total_reviews}
            />


          </div>
        </div>
      </main>
      <StoreFooter store={store} branding={branding} slug={slug} />
    </div>
  )
}
