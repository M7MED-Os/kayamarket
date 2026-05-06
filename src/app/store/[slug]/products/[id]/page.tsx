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
import { KayaBadge } from '@/components/store/KayaBadge'

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

import {
  ElegantHeader,
  ElegantFooter
} from '@/components/store/themes/ElegantTheme'
import {
  FloralHeader,
  FloralFooter
} from '@/components/store/themes/FloralTheme'

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
  const selectedTheme = (branding as any)?.selected_theme || 'default'

  const commonStyles = { '--store-primary': primaryColor, '--primary': primaryColor } as any

  // Fetch plan config for watermark
  const { getPlanConfig, getDynamicPlanConfigs } = await import('@/lib/subscription')
  const dynamicConfigs = await getDynamicPlanConfigs(supabase)
  const rawPlan = store.plan as string || 'starter'
  const planTier = (rawPlan.toLowerCase() === 'free' ? 'starter' : rawPlan.toLowerCase()) as import('@/lib/subscription').PlanTier
  const planConfig = dynamicConfigs[planTier] || getPlanConfig(planTier)
  const showWatermark = !planConfig.canRemoveWatermark

  // ─── THEME: ELEGANT ────────────────────────────────────────────────────────
  if (selectedTheme === 'elegant') {
    return (
      <div className="min-h-screen bg-white" dir="rtl" style={commonStyles}>
        <ElegantHeader store={store} branding={branding} slug={slug} />
        <main className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid grid-cols-1 gap-20 lg:grid-cols-2 items-start">
            {/* Gallery */}
            <div className="lg:sticky lg:top-28">
              <div className="relative group">
                <ImageGallery images={galleryImages} productName={product.name} />
                <div className="absolute top-6 left-6 z-10">
                  <div className="bg-[var(--primary)] text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl shadow-[var(--primary)]/20">
                    {product.stock !== null && product.stock > 0 ? 'متوفر حالياً' : 'نفذت الكمية'}
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-12">
              <div className="space-y-8">
                <div className="flex flex-col space-y-4">
                  <div className="h-px w-12 bg-[var(--primary)]/30" />
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                      <span className="text-[var(--primary)]">{product.category || 'تصنيف'}</span>
                      <span>|</span>
                      <span>تم الشراء {product.views_count ? Math.max(1, Math.floor(product.views_count / 3)) : 12} مرة</span>
                    </div>
                    {ratingSummary.total_reviews > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3 w-3 ${s <= Math.round(ratingSummary.average_rating) ? 'text-[var(--primary)] fill-[var(--primary)]' : 'text-zinc-100'}`}
                              strokeWidth={1}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">({ratingSummary.total_reviews} تقييم)</span>
                      </div>
                    )}
                  </div>
                </div>
                <h1 className="text-5xl md:text-6xl font-light text-zinc-900 leading-tight tracking-tighter uppercase">
                  {product.name}
                </h1>
                <div className="flex items-center gap-6">
                  <div className="text-4xl font-bold text-[var(--primary)] tracking-tighter">
                    {Number(product.price).toLocaleString()} <span className="text-sm font-black opacity-60">ج.م</span>
                  </div>
                  {product.original_price && Number(product.original_price) > Number(product.price) && (
                    <div className="text-lg font-bold text-zinc-300 line-through decoration-zinc-100">
                      {Number(product.original_price).toLocaleString()} ج.م
                    </div>
                  )}
                </div>
              </div>

              {product.description && (
                <div className="relative mb-0">
                  <div className="absolute -right-6 top-0 bottom-0 w-1 bg-[var(--primary)]/10" />
                  <p className="text-xl text-zinc-500 font-light leading-relaxed italic pr-4">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="pt-8">
                <CheckoutBox product={product} storeId={store.id} storeSlug={slug} selectedTheme={selectedTheme} />
              </div>

              <div className="pt-16 border-t border-zinc-100">
                <ProductReviews
                  productId={product.id}
                  storeId={store.id}
                  initialReviews={reviews as any}
                  averageRating={ratingSummary.average_rating}
                  totalReviews={ratingSummary.total_reviews}
                  selectedTheme={selectedTheme}
                />
              </div>
            </div>
          </div>
        </main >
        <ElegantFooter store={store} branding={branding} />
        {showWatermark && (
          <div className="fixed bottom-6 right-6 z-[9999]">
            <KayaBadge />
          </div>
        )}
      </div >
    )
  }

  // ─── THEME: FLORAL ─────────────────────────────────────────────────────────
  if (selectedTheme === 'floral') {
    return (
      <div className="min-h-screen bg-[#FAF3F0]/20" dir="rtl" style={commonStyles}>
        <FloralHeader store={store} branding={branding} slug={slug} />
        <main className="mx-auto max-w-7xl px-6 py-24">
          {/* Bloom Breadcrumb */}
          <nav className="mb-10 flex items-center gap-2 flex-wrap" aria-label="breadcrumb">
            <Link href={`/store/${slug}`} className="text-sm font-bold text-zinc-400 hover:text-[var(--primary)] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-rose-50 hover:border-rose-100">
              الرئيسية
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-300 rotate-180" />
            <Link href={`/store/${slug}/products`} className="text-sm font-bold text-zinc-400 hover:text-[var(--primary)] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-rose-50 hover:border-rose-100">
              المنتجات
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-300 rotate-180" />
            <span className="text-sm font-bold text-[var(--primary)] px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 max-w-[200px] truncate">
              {product.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-start">
            {/* Gallery */}
            <div className="lg:sticky lg:top-32 rounded-[2.5rem] overflow-hidden border border-rose-50 shadow-sm">
              <ImageGallery images={galleryImages} productName={product.name} />
            </div>

            {/* Details */}
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-rose-50 text-[var(--primary)] text-sm font-bold border border-rose-100">
                  {product.category || 'منتج'}
                </span>
                <h1 className="text-4xl md:text-5xl font-sans font-black text-[#2B2B2B] leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className={`h-5 w-5 ${idx < Math.round(ratingSummary.average_rating || 5) ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-zinc-200'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-zinc-500">
                    ({ratingSummary.total_reviews} تقييم)
                  </span>
                </div>

                <div className="flex items-baseline gap-4 pt-4">
                  <div className="text-3xl font-black text-[var(--primary)]">
                    {Number(product.price).toLocaleString()} ج.م
                  </div>
                  {product.original_price && Number(product.original_price) > Number(product.price) && (
                    <div className="text-lg font-bold text-zinc-400 line-through">
                      {Number(product.original_price).toLocaleString()} ج.م
                    </div>
                  )}
                </div>
              </div>

              {product.description && (
                <div className="p-6 rounded-[2rem] bg-white border border-rose-50">
                  <p className="text-base text-zinc-500 font-medium leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="pt-6">
                <CheckoutBox product={product} storeId={store.id} storeSlug={slug} selectedTheme={selectedTheme} />
              </div>

              <div className="pt-16 mt-16 border-t border-rose-100/50">
                <ProductReviews
                  productId={product.id}
                  storeId={store.id}
                  initialReviews={reviews as any}
                  averageRating={ratingSummary.average_rating}
                  totalReviews={ratingSummary.total_reviews}
                  selectedTheme={selectedTheme}
                />
              </div>
            </div>
          </div>
        </main>
        <FloralFooter store={store} branding={branding} />
        {showWatermark && (
          <div className="fixed bottom-6 right-6 z-[9999]">
            <KayaBadge />
          </div>
        )}
      </div>
    )
  }

  // ─── THEME: DEFAULT ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white font-inter" dir="rtl" style={commonStyles}>

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
            <div className="rounded-[3rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50">
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
              selectedTheme={selectedTheme}
            />


          </div>
        </div>
      </main>
      <StoreFooter store={store} branding={branding} slug={slug} />
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <KayaBadge />
        </div>
      )}
    </div>
  )
}
