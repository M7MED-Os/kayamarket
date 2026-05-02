import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Flower2, ShieldCheck, Truck, HeartHandshake, CheckCircle2 } from 'lucide-react'
import ImageGallery from '@/components/ImageGallery'
import CheckoutBox from '@/components/CheckoutBox'
import CountdownTimer from '@/components/CountdownTimer'


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('id', id)
    .single()
  if (!product) return { title: 'المنتج غير موجود' }
  return {
    title: `${product.name} | KayaMarket`,
    description: product.description?.slice(0, 160),
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product || (!product.is_visible)) notFound()

  // Increment views
  await supabase.rpc('increment_product_views', { product_id: id })


  // Build gallery images array — combine images[] with image_url fallback
  const galleryImages: string[] = []
  if (product.images && product.images.length > 0) {
    galleryImages.push(...product.images)
  } else if (product.image_url) {
    galleryImages.push(product.image_url)
  }

  return (
    <div className="min-h-screen bg-[#fffbfc]" dir="rtl">

      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex flex-col text-right">
              <span className="text-xl font-black text-zinc-900 tracking-tight leading-none">KayaMarket</span>
              <span className="text-[10px] font-bold text-zinc-500 text-left tracking-[0.2em] mt-1">STORE PREVIEW</span>
            </div>
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-zinc-900 border-2 border-zinc-100 transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-xl">K</span>
            </div>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للمتجر
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-10 flex items-center gap-2 text-sm text-zinc-400">
          <Link href="/" className="hover:text-rose-600 transition-colors font-medium">الرئيسية</Link>
          <span className="text-zinc-300">/</span>
          <span className="font-semibold text-zinc-700">{product.name}</span>
        </nav>

        {/* ===== Main Grid: INFO RIGHT | IMAGE LEFT ===== */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-start">

          {/* INFO PANEL — first in DOM = RIGHT in RTL ✓ */}
          <div className="flex flex-col">

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h1 className="text-4xl font-black leading-snug text-zinc-900 sm:text-5xl">
                {product.name}
              </h1>
              {product.sale_end_date && <CountdownTimer endDate={product.sale_end_date} />}
            </div>




            {/* Description */}
            {product.description && (
              <p className="text-lg leading-relaxed text-zinc-600">
                {product.description}
              </p>
            )}

            {/* Feature checklist */}
            <ul className="mt-8 space-y-3">
              {[
                'جودة عالية مضمونة',
                'شحن وتوصيل سريع',
                'تغليف آمن وممتاز',
              ].map(perk => (
                <li key={perk} className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-rose-500" />
                  {perk}
                </li>
              ))}
            </ul>

            {/* CTA & Price via CheckoutBox */}
            <div className="mt-10">
              <CheckoutBox product={product} storeId={product.store_id} />
            </div>

            {/* Trust badges */}
            <div className="mt-10 grid grid-cols-3 gap-3 border-t border-rose-100 pt-8">
              {[
                { icon: Truck, label: 'توصيل سريع' },
                { icon: ShieldCheck, label: 'جودة مضمونة' },
                { icon: HeartHandshake, label: 'خدمة متميزة' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 rounded-2xl bg-rose-50 p-4 text-center">
                  <Icon className="h-6 w-6 text-rose-500" />
                  <span className="text-xs font-bold text-zinc-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* IMAGE GALLERY — second in DOM = LEFT in RTL ✓ */}
          <div className="lg:sticky lg:top-24 relative">
            <ImageGallery images={galleryImages} productName={product.name} />
            
            {/* Promotion Badges - Moved discount to Left */}
            <div className="absolute top-4 left-4 z-10">
              {product.original_price && product.price && product.original_price > product.price && (
                <div className="bg-rose-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-xl">
                  خصم {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                </div>
              )}
            </div>
            
            {product.stock !== null && product.stock <= 5 && product.stock > 0 && (
              <div className="absolute bottom-4 right-4 bg-amber-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-xl animate-bounce z-10">
                باقي {product.stock} فقط!
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-100 py-8 flex flex-col items-center gap-2 text-sm text-zinc-400">
        <p>&copy; {new Date().getFullYear()} KayaMarket. جميع الحقوق محفوظة.</p>
        <Link href="/" className="hover:text-zinc-600 transition-colors font-medium">العودة للمنصة</Link>
      </footer>
    </div>
  )
}
