import { createClient } from '@/lib/supabase/server'
import { getStoreByIdentifier } from '@/lib/tenant/get-store'
import ProductCard from '@/components/product/ProductCard'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShieldCheck, Truck, Zap, Headphones, Sparkles,
  ChevronDown, ArrowLeft
} from 'lucide-react'
import StoreHeader from '@/components/StoreHeader'
import TestimonialsMarquee from '@/components/TestimonialsMarquee'
import Providers from '@/components/Providers'

// ─── Section Helpers ──────────────────────────────────────────────────────────
function isSectionEnabled(branding: any, sectionId: string): boolean {
  if (!branding?.sections || !Array.isArray(branding.sections)) return true
  const found = branding.sections.find((s: any) => s.id === sectionId)
  return found ? found.enabled !== false : true
}


// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, centered = true, light = false }: { title: string; subtitle?: string; centered?: boolean; light?: boolean }) {
  return (
    <div className={`mb-16 flex flex-col ${centered ? 'items-center text-center' : 'items-start text-right'} space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700`}>
      {subtitle && (
        <span className={`text-[11px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border ${light
          ? 'text-white/80 border-white/20 bg-white/5'
          : 'text-[var(--primary)] border-[var(--primary)]/10 bg-[var(--primary)]/5'
          }`}>
          {subtitle}
        </span>
      )}
      <h2 className={`text-3xl md:text-5xl font-black tracking-tight leading-tight ${light ? 'text-white' : 'text-zinc-900'}`}>
        {title}
      </h2>
      <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r from-[var(--primary)] to-transparent ${centered ? 'mx-auto' : ''}`} />
    </div>
  )
}

// ─── Announcement Bar ──────────────────────────────────────────────────────────
function AnnouncementBar({ text, branding }: { text: string; branding: any }) {
  return (
    <div className="relative group overflow-hidden border-b border-white/10" style={{ backgroundColor: branding?.primary_color || '#18181b' }}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      <div className="mx-auto max-w-7xl px-4 py-2.5 md:py-3 flex items-center justify-center gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </div>
        </div>
        <p className="text-white text-[10px] md:text-[13px] font-black tracking-wide text-center drop-shadow-sm">
          {text}
        </p>
      </div>
    </div>
  )
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ branding, store, slug }: { branding: any; store: any; slug: string }) {
  const bannerUrl = branding?.banner_url || null
  const heroTitle = branding?.hero_title || store.name
  const heroDescription = branding?.hero_description || branding?.tagline || `تسوق من ${store.name} بكل سهولة`
  const overlayOpacity = branding?.banner_overlay_opacity ?? 50
  const sideImage = branding?.hero_image_url || null
  const hasImage = !!sideImage

  const TextBlock = ({ isWhite = false }: { isWhite?: boolean }) => {
    const words = heroTitle.trim().split(/\s+/);
    const splitIndex = words.length <= 2 ? 1 : Math.ceil(words.length / 2);
    const firstPart = words.slice(0, splitIndex).join(' ');
    const secondPart = words.slice(splitIndex).join(' ');

    return (
      <div className={`flex flex-col items-center text-center ${hasImage ? 'lg:items-start lg:text-right' : ''} animate-in fade-in slide-in-from-bottom-8 duration-1000`}>
        <h1 className={`text-4xl sm:text-6xl font-extrabold leading-tight drop-shadow-sm`}>
          <span className={isWhite ? 'text-white' : 'text-zinc-900'}>{firstPart}</span>
          {secondPart && (
            <>
              <br />
              <span style={{ color: 'var(--primary)' }}>{secondPart}</span>
            </>
          )}
        </h1>
        <p className={`mt-6 max-w-xl text-base sm:text-lg leading-relaxed ${isWhite ? 'text-white/90' : 'text-zinc-500'}`}>
          {heroDescription}
        </p>

        <div className={`mt-10 flex flex-row items-center justify-center gap-3 sm:gap-4 w-full ${hasImage ? 'lg:justify-start' : ''}`}>
          <Link
            href={`/store/${slug}/products`}
            className="group relative inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all hover:-translate-y-0.5 active:scale-95 shadow-lg whitespace-nowrap"
            style={{
              background: 'var(--primary)',
              boxShadow: '0 10px 25px -5px color-mix(in srgb, var(--primary) 40%, transparent)'
            }}
          >
            تصفح المنتجات
          </Link>
          <a
            href={`#contact`}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border-2 px-8 py-4 text-base font-bold transition-all hover:-translate-y-0.5 active:scale-95 whitespace-nowrap ${isWhite
              ? 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              : 'bg-white/40 text-zinc-900 border-zinc-200/60 hover:border-[var(--primary)] shadow-sm'
              }`}
          >
            تواصل معنا
          </a>
        </div>
      </div>
    )
  }

  if (bannerUrl) {
    return (
      <section className="relative w-full overflow-hidden" dir="rtl">
        <div className="relative min-h-[calc(100vh-116px)] w-full flex items-center justify-center">
          <div className="absolute inset-0">
            <Image src={bannerUrl} alt="Banner" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-zinc-950" style={{ opacity: overlayOpacity / 100 }} />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-zinc-950/30" />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 w-full">
            <div className={`flex flex-col lg:flex-row items-center justify-between gap-16`}>
              <div className="flex-1 w-full">
                <TextBlock isWhite />
              </div>
              {hasImage && (
                <div className="flex-1 w-full flex justify-center lg:justify-end animate-in fade-in zoom-in duration-1000">
                  <div className="relative aspect-square lg:aspect-[4/5] w-full max-w-[400px] rounded-[3.5rem] overflow-hidden shadow-[0_48px_96px_-24px_rgba(0,0,0,0.3)] ring-1 ring-white/20 transition-all duration-700 hover:scale-[1.02] lg:-rotate-3 hover:rotate-0">
                    <Image src={sideImage} alt="Featured" fill className="object-cover" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden flex flex-col justify-center min-h-[calc(100vh-116px)]" dir="rtl">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 opacity-[0.45] blur-[120px] mix-blend-multiply" style={{ backgroundImage: `radial-gradient(at 20% 20%, var(--primary) 0, transparent 45%), radial-gradient(at 80% 80%, var(--primary) 0, transparent 45%)` }} />
      <div className="absolute -top-[10%] -right-[5%] w-[900px] h-[900px] rounded-full opacity-[0.2] blur-[180px] animate-pulse" style={{ background: 'var(--primary)' }} />
      <div className="absolute -bottom-[10%] -left-[5%] w-[800px] h-[800px] rounded-full opacity-[0.15] blur-[150px]" style={{ background: 'var(--primary)' }} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 w-full">
        <div className={`flex flex-col lg:flex-row items-center ${hasImage ? 'lg:justify-between gap-16' : 'justify-center text-center'}`}>
          <div className={`${hasImage ? 'flex-1 w-full' : 'w-fit max-w-3xl'}`}>
            <TextBlock />
          </div>
          {hasImage && (
            <div className="hidden lg:flex flex-1 w-full justify-center lg:justify-end animate-in fade-in zoom-in duration-1000">
              <div className="relative aspect-square lg:aspect-[4/5] w-full max-w-[440px] rounded-[4.5rem] overflow-hidden shadow-[0_64px_128px_-24px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transition-all duration-1000 hover:scale-[1.03] hover:rotate-0 group animate-float">
                <Image src={sideImage} alt="Featured" fill className="object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}


// ─── Categories ───────────────────────────────────────────────────────
function CategoryHighlights({ categories, slug, branding }: { categories: any[]; slug: string; branding: any }) {
  if (!categories || categories.length === 0) return null
  return (
    <section className="bg-white py-32 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-zinc-100 to-transparent" />
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader title="تصفح الأقسام" subtitle="اكتشف مجموعاتنا" />
        <div className="flex flex-wrap justify-center gap-8 md:gap-14 pb-4">
          {categories.map((cat, idx) => (
            <Link key={idx} href={`/store/${slug}/products?category=${cat.name}`} className="shrink-0 flex flex-col items-center gap-6 group">
              <div className="h-32 w-32 md:h-48 md:w-48 rounded-full bg-zinc-50 border border-zinc-100 group-hover:border-[var(--primary)]/30 flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] relative overflow-hidden">
                {cat.image_url ? (
                  <Image src={cat.image_url} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <span className="text-4xl md:text-5xl font-black opacity-20" style={{ color: 'var(--primary)' }}>{cat.name.charAt(0)}</span>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-transparent via-transparent to-[var(--primary)]/10" />
              </div>
              <span className="text-base font-black text-zinc-800 group-hover:text-[var(--primary)] transition-colors tracking-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Bestsellers ───────────────────────────────────────────────────────────────
function Bestsellers({ products, slug, branding }: { products: any[]; slug: string; branding: any }) {
  const featured = products.slice(0, 4)
  if (featured.length === 0) return null
  return (
    <section id="bestsellers" className="py-32 relative border-y border-zinc-100 bg-zinc-50/50">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader title="الأكثر مبيعاً" subtitle="الأكثر طلباً الآن" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} slug={slug} primaryColor={branding?.primary_color} />
          ))}
        </div>

        <div className="mt-20 flex justify-center">
          <Link
            href={`/store/${slug}/products`}
            className="group flex items-center gap-3 px-10 py-4.5 bg-white border border-zinc-200 rounded-[1.5rem] text-sm font-black text-zinc-900 hover:border-zinc-900 transition-all shadow-sm active:scale-95 shrink-0"
          >
            تصفح المتجر بالكامل
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Features ──────────────────────────────────────────────────────────────────
function Features({ branding }: { branding: any }) {
  const features = branding?.features_data || [
    { id: 'shipping', title: 'شحن سريع', desc: 'توصيل آمن وسريع لكافة المناطق' },
    { id: 'quality', title: 'جودة عالية', desc: 'منتجات مختارة بعناية فائقة' },
    { id: 'speed', title: 'سرعة التنفيذ', desc: 'نجهز طلبك في وقت قياسي' },
    { id: 'service', title: 'خدمة عملاء', desc: 'دعم فني متواصل على مدار الساعة' },
  ]
  const icons = [Truck, ShieldCheck, Zap, Headphones]
  return (
    <section id="features" className="bg-white py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader title="لماذا تختارنا؟" subtitle="لماذا تختارنا؟" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat: any, idx: number) => {
            const Icon = icons[idx] || Sparkles
            return (
              <div key={feat.id} className="group p-10 rounded-[3.5rem] bg-zinc-50/50 border border-zinc-100 hover:border-[var(--primary)]/20 hover:bg-white hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-[2.5rem] bg-white flex items-center justify-center shadow-sm border border-zinc-100 mb-8 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[var(--primary)] text-[var(--primary)] group-hover:text-white transition-all duration-700">
                  <Icon className="h-10 w-10 transition-transform duration-700" />
                </div>
                <h4 className="text-xl font-black text-zinc-900 mb-3 tracking-tight">{feat.title}</h4>
                <p className="text-sm font-bold text-zinc-500 leading-relaxed opacity-80">{feat.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ───────────────────────────────────────────────────────────────────────
function FAQ({ branding }: { branding: any }) {
  const faqs = branding?.faq_data || [
    { q: 'كم يستغرق توصيل الطلب؟', a: 'يستغرق التوصيل عادةً من 2 إلى 5 أيام عمل حسب منطقتك.' },
    { q: 'هل يمكنني إرجاع أو استبدال المنتج؟', a: 'نعم، يمكنك الإرجاع خلال 14 يوماً من تاريخ الاستلام بشرط أن يكون المنتج في حالته الأصلية.' },
    { q: 'ما هي طرق الدفع المتاحة؟', a: 'نوفر الدفع عند الاستلام، والدفع عبر المحافظ الإلكترونية، والتحويل البنكي.' },
    { q: 'كيف يمكنني تتبع طلبي؟', a: 'سيتم إرسال رابط تتبع ورقم الفاتورة عبر الواتساب فور تأكيد طلبك.' },
  ]
  return (
    <section id="faq" className="bg-white py-32 relative overflow-hidden border-t border-zinc-50">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader title="الأسئلة الشائعة" subtitle="إجابات لكل استفساراتك" />
        <div className="space-y-6">
          {faqs.map((faq: any, idx: number) => (
            <details key={idx} className="group bg-zinc-50/50 border border-zinc-100 rounded-[3rem] overflow-hidden transition-all hover:shadow-2xl hover:bg-white hover:border-zinc-200">
              <summary className="flex items-center justify-between cursor-pointer p-8 md:p-10 font-black text-zinc-900 hover:text-[var(--primary)] transition-colors list-none">
                <span className="text-right text-lg md:text-xl pr-2 leading-tight tracking-tight">{faq.q}</span>
                <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shrink-0 group-open:bg-[var(--primary)] group-open:border-[var(--primary)] group-open:text-white transition-all shadow-sm">
                  <ChevronDown className="h-6 w-6 transition-transform duration-500 group-open:rotate-180" />
                </div>
              </summary>
              <div className="px-10 pb-10 text-base md:text-lg font-bold text-zinc-500 leading-relaxed border-t border-zinc-50 pt-8 mx-2 animate-in fade-in slide-in-from-top-2 duration-500">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
import StoreFooter from '@/components/StoreFooter'
import {
  ElegantHeader,
  ElegantHero,
  ElegantCategories,
  ElegantBestsellers,
  ElegantFeatures,
  ElegantTestimonials,
  ElegantFooter,
  ElegantFAQ
} from '@/components/store/themes/ElegantTheme'
import {
  FloralHeader,
  FloralHero,
  FloralCategories,
  FloralProductCard,
  FloralFeatures,
  FloralTestimonials,
  FloralFAQ,
  FloralFooter
} from '@/components/store/themes/FloralTheme'

export default async function StorePage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { store, branding } = await getStoreByIdentifier(decodeURIComponent(slug))
  if (!store) notFound()

  // Fetch products
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


  // Fetch real reviews (max 10 approved) for the store only (not product reviews)
  const { data: storeReviews } = await supabase
    .from('product_reviews')
    .select('id, customer_name, rating, comment, created_at')
    .eq('store_id', store.id)
    .is('product_id', null)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10)

  const primaryColor = branding?.primary_color || '#e11d48'
  const secondaryColor = branding?.secondary_color || '#f8fafc'
  const fontFamily = branding?.font_family || 'Cairo'
  const selectedTheme = (branding as any)?.selected_theme || 'default'

  // Fixed order — only check enabled from DB sections
  const shown = (id: string) => isSectionEnabled(branding, id)

  // Fetch full categories with images
  const { data: dbCategories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)

  const commonStyles = { '--primary': primaryColor, '--secondary': secondaryColor, fontFamily } as any

  // ─── THEME: ELEGANT ────────────────────────────────────────────────────────
  if (selectedTheme === 'elegant') {
    return (
      <Providers>
        <div className="min-h-screen bg-white" dir="rtl" style={commonStyles}>
          {shown('announcement') && ((branding as any)?.announcement_enabled === true || (branding as any)?.announcement_enabled === 'true') && (
            <AnnouncementBar text={(branding as any)?.announcement_text || ''} branding={branding} />
          )}
          <ElegantHeader store={store} branding={branding} slug={slug} />
          <ElegantHero branding={branding} store={store} slug={slug} />
          <ElegantCategories categories={dbCategories || []} slug={slug} />
          <ElegantBestsellers products={productsWithRatings} slug={slug} branding={branding} />
          {shown('features') && <ElegantFeatures branding={branding} />}

          {shown('testimonials') && (
            <ElegantTestimonials reviews={storeReviews || []} />
          )}

          {shown('faq') && <ElegantFAQ branding={branding} />}
          {shown('footer') && <ElegantFooter store={store} branding={branding} />}
        </div>
      </Providers>
    )
  }

  // ─── THEME: FLORAL ─────────────────────────────────────────────────────────
  if (selectedTheme === 'floral') {
    return (
      <Providers>
        <div className="min-h-screen bg-white" dir="rtl" style={commonStyles}>
          {shown('announcement') && ((branding as any)?.announcement_enabled === true || (branding as any)?.announcement_enabled === 'true') && (
            <AnnouncementBar text={(branding as any)?.announcement_text || ''} branding={branding} />
          )}
          <FloralHeader store={store} branding={branding} slug={slug} />
          <FloralHero branding={branding} store={store} slug={slug} />
          {shown('categories') && <FloralCategories categories={dbCategories || []} slug={slug} />}

          {shown('bestsellers') && (
            <section className="py-28 bg-white">
              <div className="mx-auto max-w-7xl px-6">
                <div className="text-center mb-16 space-y-3">
                  <span className="text-xs font-black text-[var(--primary)] uppercase tracking-[0.25em]">مختاراتنا لك</span>
                  <h2 className="text-4xl md:text-5xl font-serif italic text-[#2B2B2B]">الأكثر مبيعاً</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
                  {productsWithRatings.slice(0, 8).map(product => (
                    <FloralProductCard key={product.id} product={product} slug={slug} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {shown('features') && <FloralFeatures branding={branding} />}
          {shown('testimonials') && <FloralTestimonials reviews={storeReviews || []} />}
          {shown('faq') && <FloralFAQ branding={branding} />}
          {shown('footer') && <FloralFooter store={store} branding={branding} />}
        </div>
      </Providers>
    )
  }

  // ─── THEME: DEFAULT (MESH) ─────────────────────────────────────────────────
  return (
    <Providers>
      <div className="min-h-screen bg-white" dir="rtl" style={commonStyles}>
        {/* 1. Announcement */}
        {shown('announcement') && ((branding as any)?.announcement_enabled === true || (branding as any)?.announcement_enabled === 'true') && (
          <AnnouncementBar text={(branding as any)?.announcement_text || ''} branding={branding} />
        )}
        {/* 2. Header */}
        <StoreHeader store={store} branding={branding} slug={slug} />
        <Hero branding={branding} store={store} slug={slug} />
        <CategoryHighlights categories={dbCategories || []} slug={slug} branding={branding} />
        <Bestsellers products={productsWithRatings} slug={slug} branding={branding} />
        <Features branding={branding} />

        {/* Testimonials / Reviews Section */}
        {shown('testimonials') && (
          <section className="bg-zinc-50/50 py-24 md:py-32 overflow-hidden border-y border-zinc-100">
            <div className="mx-auto max-w-7xl px-6">
              <SectionHeader title="آراء العملاء" subtitle="ثقة نعتز بها" />
              <TestimonialsMarquee reviews={storeReviews || []} />
            </div>
          </section>
        )}

        {shown('faq') && <FAQ branding={branding} />}
        {shown('footer') && <StoreFooter store={store} branding={branding} slug={slug} />}
      </div>
    </Providers>
  )
}
