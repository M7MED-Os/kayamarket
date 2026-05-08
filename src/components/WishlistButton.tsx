'use client'

import { useWishlist } from '@/context/WishlistContext'
import { Heart } from 'lucide-react'

export default function WishlistButton({ product }: { product: any }) {
  const { toggleItem, isInWishlist } = useWishlist()
  const isWishlisted = isInWishlist(product.id)

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      store_id: product.store_id
    })
  }

  return (
    <button
      onClick={handleWishlist}
      className={`h-14 w-14 flex items-center justify-center rounded-none backdrop-blur-md border transition-all hover:scale-105 active:scale-95 ${isWishlisted ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20' : 'bg-white/90 text-zinc-400 border-zinc-200 hover:text-rose-500 shadow-sm'}`}
      aria-label="Add to Wishlist"
    >
      <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} strokeWidth={1.5} />
    </button>
  )
}
