'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Package, Star, Heart, ShoppingCart } from 'lucide-react'
import CountdownTimer from '../CountdownTimer'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
  product: any
  slug: string
  primaryColor?: string
}

// Static star display — uses product.rating if available, otherwise defaults to 4.5
function StarRating({ rating }: { rating: number | null }) {
  if (rating === null || rating === undefined) return null

  const full = Math.floor(rating)
  const remainder = rating % 1
  const half = remainder >= 0.25 && remainder < 0.75
  const extraFull = remainder >= 0.75 ? 1 : 0

  const totalFull = full + extraFull
  const empty = Math.max(0, 5 - totalFull - (half ? 1 : 0))

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: totalFull }).map((_, i) => (
        <Star key={`f${i}`} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      ))}
      {half && (
        <span className="relative inline-block h-3.5 w-3.5">
          <Star className="absolute h-3.5 w-3.5 text-zinc-200 fill-zinc-200" />
          <span className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
            <Star className="absolute right-0 h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          </span>
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} className="h-3.5 w-3.5 text-zinc-200 fill-zinc-200" />
      ))}
      <span className="text-[11px] font-bold text-zinc-400 mr-1">({rating.toFixed(1)})</span>
    </div>
  )
}

import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product, slug }: ProductCardProps) {
  const router = useRouter()
  const hasDiscount = product.original_price && product.original_price > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0
  const isSaleActive = product.sale_end_date && new Date(product.sale_end_date) > new Date()
  // Real dynamic rating passed from the parent component
  const rating = product.rating ?? null

  const { addItem } = useCart()
  const { toggleItem, isInWishlist } = useWishlist()
  const isFavorite = isInWishlist(product.id)

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem({
      id: product.id,
      name: product.name,
      price: product.price,
      original_price: product.original_price,
      image_url: product.image_url,
      description: product.description,
      sale_end_date: product.sale_end_date,
      sales_count: product.sales_count
    })
    if (!isFavorite) {
      toast.success('تمت الإضافة للمفضلات')
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock === 0) {
      toast.error('هذا المنتج غير متوفر حالياً')
      return
    }

    // If product has variants, redirect to product page instead of adding directly
    const hasVariants = product.variants && product.variants.length > 0

    if (hasVariants) {
      toast('يرجى اختيار المقاس واللون أولاً ثم الضغط على زر "أضف للسلة"', { icon: '📝' })
      router.push(`/store/${slug}/products/${product.id}`)
      return
    }

    // Generate cartItemId for simple products
    const cartItemId = `${product.id}-none-none`

    addItem({
      id: product.id,
      cartItemId: cartItemId,
      name: product.name,
      price: product.price,
      original_price: product.original_price,
      image_url: product.image_url,
      description: product.description,
      quantity: 1,
      variant_info: {
        color: undefined,
        size: undefined
      }
    })
    toast.success('تمت الإضافة للسلة')
  }
  return (
    <div className="group relative flex flex-col bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden">

      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <button
          onClick={handleToggleWishlist}
          className={`h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md transition-all shadow-sm ${isFavorite ? 'text-rose-500 bg-white' : 'text-zinc-400 hover:text-rose-500 hover:bg-white'}`}
        >
          <Heart className={`h-4 w-4 md:h-5 md:w-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full bg-zinc-900/90 text-white backdrop-blur-md transition-all shadow-sm hover:scale-110 active:scale-95 disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
        </button>
      </div>

      {/* Product Image */}
      <Link
        href={`/store/${slug}/products/${product.id}`}
        className="relative aspect-[4/5] overflow-hidden bg-zinc-50 w-full"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-zinc-200" />
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div
            className="absolute top-4 right-4 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-xl z-10 flex items-center gap-1.5 backdrop-blur-md"
            style={{ background: 'color-mix(in srgb, var(--primary) 90%, black)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            خصم {discountPercent}%
          </div>
        )}

        {/* Countdown Timer Overlay */}
        {isSaleActive && (
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <CountdownTimer endDate={product.sale_end_date} />
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-5 md:p-6 flex flex-col flex-1 text-right">
        {/* Stars */}
        <div className="mb-3">
          <StarRating rating={Number(rating)} />
        </div>

        <Link href={`/store/${slug}/products/${product.id}`}>
          <h3
            className="text-[15px] md:text-base font-black text-zinc-900 mb-2 line-clamp-2 leading-tight group-hover:text-[var(--primary)] transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-[12px] text-zinc-400 line-clamp-2 mb-4 leading-relaxed font-bold">
            {product.description}
          </p>
        )}


        {/* Price Section */}
        <div className="mt-auto mb-5">
          {hasDiscount ? (
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-1.5" style={{ color: 'var(--primary)' }}>
                <span className="text-2xl font-black tracking-tight">
                  {Number(product.price).toLocaleString()}
                </span>
                <span className="text-[13px] font-black opacity-80">ج.م</span>
              </div>
              <div className="text-zinc-300 line-through decoration-zinc-300/60 font-bold text-sm">
                {Number(product.original_price).toLocaleString()} ج.م
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-start gap-1.5" style={{ color: 'var(--primary)' }}>
              <span className="text-2xl font-black tracking-tight">
                {Number(product.price).toLocaleString()}
              </span>
              <span className="text-[13px] font-black opacity-80">ج.م</span>
            </div>
          )}
        </div>

        {/* CTA Buttons & Stats */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Link
              href={`/store/${slug}/products/${product.id}`}
              className="flex items-center justify-center w-full py-3 text-[14px] font-black text-zinc-900 bg-white border-2 border-zinc-100 rounded-2xl transition-all hover:bg-zinc-50 hover:scale-[1.02] active:scale-95 shadow-sm"
            >
              اطلب الآن
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-2 w-full py-3 text-[14px] font-black text-white bg-zinc-900 rounded-2xl transition-all hover:bg-zinc-800 hover:scale-[1.02] active:scale-95 shadow-md shadow-zinc-200 disabled:opacity-50 disabled:hover:scale-100 disabled:bg-zinc-300"
            >
              <ShoppingCart className="h-4 w-4" />
              {product.stock === 0 ? 'نفذت الكمية' : 'أضف للسلة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
